import { generateFingerprint } from './Fingerprint.js';

/**
 * Token-based access control gate for the chatbot.
 * Handles request/approve/deny flow with email submission and polling.
 */
export class AccessGate {
  constructor(container, config) {
    this._container = container;
    this._tokenUrl = config.tokenUrl;
    this._pollInterval = config.pollInterval || 3000;
    this._onGranted = config.onGranted;

    this._accessToken = localStorage.getItem('cb_token') || null;
    this._requestId = localStorage.getItem('cb_request_id') || null;
    this._deviceId = localStorage.getItem('cb_device_id');
    if (!this._deviceId) {
      this._deviceId = crypto.randomUUID();
      localStorage.setItem('cb_device_id', this._deviceId);
    }
    this._hwFingerprint = null;
    this._pollTimer = null;

    this._overlay = null;
    this._btn = null;
    this._status = null;
  }

  get accessToken() { return this._accessToken; }

  clearToken() {
    this._accessToken = null;
    localStorage.removeItem('cb_token');
  }

  async init() {
    this._buildOverlay();

    if (this._accessToken) {
      var valid = await this._validateToken(this._accessToken);
      if (valid) {
        this._hide();
        this._onGranted();
        return;
      }
      this._accessToken = null;
      localStorage.removeItem('cb_token');
      this._show();
    } else if (this._requestId) {
      this._show();
      this._setStatus('waiting', 'Waiting for approval...');
      this._startPolling();
    } else {
      this._show();
    }
  }

  showAndReset() {
    this._show();
    if (this._btn) {
      this._btn.disabled = false;
      this._btn.textContent = 'Request Access';
    }
    this._setStatus('info', '');
  }

  destroy() {
    this._stopPolling();
    if (this._overlay && this._overlay.parentNode) {
      this._overlay.parentNode.removeChild(this._overlay);
    }
  }

  _buildOverlay() {
    this._overlay = document.createElement('div');
    this._overlay.id = 'chatbot-gate';
    this._overlay.className = 'chatbot-gate';

    var icon = document.createElement('div');
    icon.className = 'chatbot-gate-icon';
    icon.innerHTML = '<i class="fas fa-lock"></i>';
    this._overlay.appendChild(icon);

    var title = document.createElement('h3');
    title.textContent = 'Access Required';
    title.className = 'chatbot-gate-title';
    this._overlay.appendChild(title);

    var desc = document.createElement('p');
    desc.textContent = 'This is a live AI demo. Request access to start a conversation.';
    desc.className = 'chatbot-gate-desc';
    this._overlay.appendChild(desc);

    this._btn = document.createElement('button');
    this._btn.textContent = 'Request Access';
    this._btn.className = 'btn-primary';
    this._btn.style.cssText =
      'padding:10px 28px;border-radius:8px;color:white;font-weight:600;font-size:0.875rem;border:none;cursor:pointer;';
    this._btn.addEventListener('click', () => this._requestAccess());
    this._overlay.appendChild(this._btn);

    this._status = document.createElement('p');
    this._status.className = 'chatbot-gate-status';
    this._overlay.appendChild(this._status);

    this._container.style.position = 'relative';
    this._container.appendChild(this._overlay);
  }

  _show() { if (this._overlay) this._overlay.style.display = 'flex'; }
  _hide() { if (this._overlay) this._overlay.style.display = 'none'; }

  _setStatus(type, text) {
    if (!this._status) return;
    this._status.textContent = text;
    if (type === 'waiting') this._status.style.color = '#F59E0B';
    else if (type === 'error') this._status.style.color = '#EF4444';
    else this._status.style.color = '#6B7280';
  }

  async _requestAccess() {
    this._btn.disabled = true;
    this._btn.textContent = 'Requesting...';
    this._setStatus('info', '');

    try {
      if (!this._hwFingerprint) {
        try { this._hwFingerprint = await generateFingerprint(); } catch (_) { /* best-effort */ }
      }

      var res = await fetch(this._tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', device_id: this._deviceId, fingerprint: this._hwFingerprint || '' }),
      });

      var data = await res.json();
      if (!res.ok) {
        this._setStatus('error', data.error || 'Request failed');
        this._btn.disabled = false;
        this._btn.textContent = 'Request Access';
        return;
      }

      if (data.token) {
        this._accessToken = data.token;
        localStorage.setItem('cb_token', this._accessToken);
        this._hide();
        this._onGranted();
        return;
      }

      this._requestId = data.request_id;
      localStorage.setItem('cb_request_id', this._requestId);
      this._showEmailForm();
    } catch (err) {
      this._setStatus('error', 'Could not reach server. Try again.');
      this._btn.disabled = false;
      this._btn.textContent = 'Request Access';
    }
  }

  _showEmailForm() {
    this._btn.style.display = 'none';
    this._setStatus('info', '');

    var title = this._overlay.querySelector('.chatbot-gate-title');
    var desc = this._overlay.querySelector('.chatbot-gate-desc');
    if (title) title.textContent = 'Almost There';
    if (desc) desc.textContent = "Enter your email and we\u2019ll notify you as soon as access is granted.";

    var form = document.createElement('div');
    form.style.cssText = 'display:flex;gap:8px;width:100%;max-width:320px;';

    var emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'you@example.com';
    emailInput.required = true;
    emailInput.style.cssText =
      'flex:1;padding:10px 14px;border-radius:8px;border:1px solid var(--border-light);' +
      'background:var(--bg-input);color:var(--text-primary);font-size:0.875rem;outline:none;';

    var submitBtn = document.createElement('button');
    submitBtn.textContent = 'Submit';
    submitBtn.className = 'btn-primary';
    submitBtn.style.cssText =
      'padding:10px 20px;border-radius:8px;color:white;font-weight:600;font-size:0.875rem;border:none;cursor:pointer;';

    form.appendChild(emailInput);
    form.appendChild(submitBtn);
    this._overlay.insertBefore(form, this._status);

    var self = this;
    submitBtn.addEventListener('click', function () {
      var email = emailInput.value.trim();
      if (!email || !emailInput.validity.valid) {
        self._setStatus('error', 'Please enter a valid email.');
        return;
      }
      self._submitEmail(email, submitBtn, emailInput);
    });

    emailInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submitBtn.click();
    });

    emailInput.focus();
  }

  async _submitEmail(email, submitBtn, emailInput) {
    submitBtn.disabled = true;
    emailInput.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      var res = await fetch(this._tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_email', request_id: this._requestId, email: email }),
      });

      var data = await res.json();
      if (!res.ok) {
        this._setStatus('error', data.error || 'Failed to submit email.');
        submitBtn.disabled = false;
        emailInput.disabled = false;
        submitBtn.textContent = 'Submit';
        return;
      }

      submitBtn.parentElement.style.display = 'none';
      this._setStatus('waiting', "Thanks! We\u2019ll email you when access is granted.");
      this._startPolling();
    } catch {
      this._setStatus('error', 'Could not reach server. Try again.');
      submitBtn.disabled = false;
      emailInput.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  }

  _startPolling() {
    if (this._pollTimer) clearInterval(this._pollTimer);
    this._pollTimer = setInterval(() => this._pollForApproval(), this._pollInterval);
  }

  _stopPolling() {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
    }
  }

  async _pollForApproval() {
    if (!this._requestId) { this._stopPolling(); return; }

    try {
      var res = await fetch(this._tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'poll', request_id: this._requestId }),
      });

      var data = await res.json();

      if (data.status === 'approved' && data.token) {
        this._stopPolling();
        this._accessToken = data.token;
        localStorage.setItem('cb_token', this._accessToken);
        localStorage.removeItem('cb_request_id');
        this._requestId = null;
        this._hide();
        this._onGranted();
      } else if (data.status === 'denied') {
        this._stopPolling();
        localStorage.removeItem('cb_request_id');
        this._requestId = null;
        this._setStatus('error', 'Access denied.');
        this._btn.disabled = false;
        this._btn.textContent = 'Request Access';
      } else if (data.status === 'expired') {
        this._stopPolling();
        localStorage.removeItem('cb_request_id');
        this._requestId = null;
        this._setStatus('error', 'Token expired. Request again.');
        this._btn.disabled = false;
        this._btn.textContent = 'Request Access';
      }
    } catch {
      // Silently retry on network errors
    }
  }

  async _validateToken(token) {
    try {
      var res = await fetch(this._tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', token: token }),
      });
      var data = await res.json();
      return data.valid === true;
    } catch {
      return false;
    }
  }
}
