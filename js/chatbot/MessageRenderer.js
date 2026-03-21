/**
 * Message rendering: markdown parsing, mermaid diagrams, message DOM creation.
 */
export class MessageRenderer {
  constructor(messagesEl, scrollArea) {
    this._messages = messagesEl;
    this._scrollArea = scrollArea;

    // Event delegation for copy + mermaid download buttons
    this._copyHandler = (e) => this._handleCopy(e);
    this._downloadHandler = (e) => this._handleMermaidDownload(e);
    document.addEventListener('click', this._copyHandler);
    document.addEventListener('click', this._downloadHandler);
  }

  destroy() {
    document.removeEventListener('click', this._copyHandler);
    document.removeEventListener('click', this._downloadHandler);
  }

  addMessage(role, text) {
    var shouldScroll = this._isNearBottom();

    var wrapper = document.createElement('div');
    wrapper.className = 'chat-msg chat-msg-' + role;

    var avatar = document.createElement('div');
    avatar.className = 'chat-msg-avatar';
    avatar.innerHTML = role === 'assistant'
      ? '<i class="fas fa-robot"></i>'
      : '<i class="fas fa-user"></i>';

    var bubble = document.createElement('div');
    bubble.className = 'chat-msg-bubble';

    var content = document.createElement('div');
    content.className = 'chat-msg-content';
    if (text) {
      content.innerHTML = this.renderMarkdown(text);
    }

    var time = document.createElement('div');
    time.className = 'chat-msg-time';
    time.textContent = this._formatTime();

    bubble.appendChild(content);
    bubble.appendChild(time);
    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    this._messages.appendChild(wrapper);

    if (shouldScroll) this.scrollToBottom();
    if (text) this.renderMermaidBlocks(content);
    return wrapper;
  }

  renderMarkdown(text) {
    var result = '';
    var parts = text.split('```');
    for (var i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        var lines = this._escapeHtml(parts[i]).split('\n');
        var html = '';
        var inList = false;
        var listType = '';

        for (var j = 0; j < lines.length; j++) {
          var line = lines[j];

          var headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
          if (headingMatch) {
            if (inList) { html += '</' + listType + '>'; inList = false; }
            var level = headingMatch[1].length;
            var sizes = { 1: '1.3em', 2: '1.15em', 3: '1em', 4: '0.9em' };
            html += '<div style="font-weight:700;font-size:' + sizes[level] + ';margin:8px 0 4px;color:var(--text-heading);">' + this._renderInline(headingMatch[2]) + '</div>';
            continue;
          }

          if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
            if (inList) { html += '</' + listType + '>'; inList = false; }
            html += '<hr style="border:none;border-top:1px solid var(--border-light);margin:8px 0;">';
            continue;
          }

          if (line.match(/^&gt;\s?(.*)$/)) {
            if (inList) { html += '</' + listType + '>'; inList = false; }
            var quoteContent = line.replace(/^&gt;\s?/, '');
            html += '<div style="border-left:3px solid var(--text-dim);padding:2px 12px;margin:4px 0;color:var(--text-muted);">' + this._renderInline(quoteContent) + '</div>';
            continue;
          }

          var ulMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
          if (ulMatch) {
            if (!inList || listType !== 'ul') {
              if (inList) html += '</' + listType + '>';
              html += '<ul style="margin:4px 0;padding-left:20px;list-style:disc;">';
              inList = true;
              listType = 'ul';
            }
            html += '<li>' + this._renderInline(ulMatch[2]) + '</li>';
            continue;
          }

          var olMatch = line.match(/^(\s*)\d+[.)]\s+(.+)$/);
          if (olMatch) {
            if (!inList || listType !== 'ol') {
              if (inList) html += '</' + listType + '>';
              html += '<ol style="margin:4px 0;padding-left:20px;list-style:decimal;">';
              inList = true;
              listType = 'ol';
            }
            html += '<li>' + this._renderInline(olMatch[2]) + '</li>';
            continue;
          }

          if (inList) { html += '</' + listType + '>'; inList = false; }

          if (line.trim() === '') {
            html += '<br>';
            continue;
          }

          html += this._renderInline(line) + '<br>';
        }

        if (inList) html += '</' + listType + '>';
        html = html.replace(/(<br>)+$/, '');
        result += html;
      } else {
        var block = parts[i];
        var lang = '';
        var newlineIdx = block.indexOf('\n');
        if (newlineIdx !== -1) {
          var firstLine = block.substring(0, newlineIdx).trim();
          if (firstLine && /^[a-zA-Z0-9+#_-]+$/.test(firstLine)) {
            lang = firstLine;
            block = block.substring(newlineIdx + 1);
          }
        }
        if (block.endsWith('\n')) block = block.slice(0, -1);

        if (lang === 'mermaid') {
          var dlBtn = '<button class="chat-mermaid-download" title="Download as PNG"><i class="fas fa-download"></i></button>';
          result += '<div class="chat-mermaid-block">' + dlBtn + '<pre class="mermaid">' + this._escapeHtml(block) + '</pre></div>';
        } else {
          var langAttr = lang ? ' data-lang="' + this._escapeHtml(lang) + '"' : '';
          var langLabel = lang ? '<span class="chat-code-lang">' + this._escapeHtml(lang) + '</span>' : '';
          var copyBtn = '<button class="chat-code-copy" title="Copy"><i class="fas fa-copy"></i></button>';
          result += '<div class="chat-code-block"' + langAttr + '><div class="chat-code-header">' + langLabel + copyBtn + '</div><pre><code>' + this._escapeHtml(block) + '</code></pre></div>';
        }
      }
    }
    return result;
  }

  renderMermaidBlocks(container) {
    if (typeof mermaid === 'undefined') return;
    setTimeout(function () {
      var nodes = container.querySelectorAll('pre.mermaid:not([data-processed])');
      if (nodes.length === 0) return;
      try { mermaid.run({ nodes: nodes }); } catch (e) { /* fallback: leave raw text */ }
      setTimeout(function () {
        if (typeof window.updateMermaidTheme === 'function') {
          var theme = document.documentElement.getAttribute('data-theme') || 'dark';
          window.updateMermaidTheme(theme);
        }
      }, 500);
    }, 150);
  }

  isNearBottom() { return this._isNearBottom(); }
  scrollToBottom() {
    var el = this._scrollArea || this._messages;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }

  _isNearBottom() {
    var el = this._scrollArea || this._messages;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }

  _formatTime() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
  }

  _escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  _renderInline(line) {
    var codes = [];
    line = line.replace(/`([^`]+)`/g, function (_, code) {
      codes.push(code);
      return '\x00CODE' + (codes.length - 1) + '\x00';
    });
    line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    line = line.replace(/__(.+?)__/g, '<strong>$1</strong>');
    line = line.replace(/\*(.+?)\*/g, '<em>$1</em>');
    line = line.replace(/(?:^|(?<=\s))_(.+?)_(?=\s|$)/g, '<em>$1</em>');
    line = line.replace(/~~(.+?)~~/g, '<del>$1</del>');
    line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, text, url) {
      var safeUrl = /^(https?:|mailto:|#)/.test(url.trim().toLowerCase()) ? url : '#';
      return '<a href="' + safeUrl + '" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:underline">' + text + '</a>';
    });
    line = line.replace(/\x00CODE(\d+)\x00/g, function (_, idx) {
      return '<code class="chat-inline-code">' + codes[parseInt(idx)] + '</code>';
    });
    return line;
  }

  _handleCopy(e) {
    var btn = e.target.closest('.chat-code-copy');
    if (!btn) return;
    var block = btn.closest('.chat-code-block');
    if (!block) return;
    var code = block.querySelector('code');
    if (!code) return;
    navigator.clipboard.writeText(code.textContent).then(function () {
      btn.innerHTML = '<i class="fas fa-check"></i>';
      setTimeout(function () { btn.innerHTML = '<i class="fas fa-copy"></i>'; }, 1500);
    });
  }

  _handleMermaidDownload(e) {
    var btn = e.target.closest('.chat-mermaid-download');
    if (!btn) return;
    var block = btn.closest('.chat-mermaid-block');
    if (!block) return;
    var svg = block.querySelector('svg');
    if (!svg) return;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    var scale = 4;
    var clone = svg.cloneNode(true);
    var bbox = svg.getBoundingClientRect();
    var w = bbox.width;
    var h = bbox.height;

    var origEls = svg.querySelectorAll('*');
    var cloneEls = clone.querySelectorAll('*');
    for (var si = 0; si < origEls.length; si++) {
      var cs = getComputedStyle(origEls[si]);
      var style = '';
      for (var pi = 0; pi < cs.length; pi++) {
        style += cs[pi] + ':' + cs.getPropertyValue(cs[pi]) + ';';
      }
      cloneEls[si].setAttribute('style', style);
    }

    var vb = svg.getAttribute('viewBox') || ('0 0 ' + w + ' ' + h);
    clone.setAttribute('viewBox', vb);
    clone.setAttribute('width', w * scale);
    clone.setAttribute('height', h * scale);
    clone.removeAttribute('style');
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    var svgData = new XMLSerializer().serializeToString(clone);
    var blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = function () {
      var canvas = document.createElement('canvas');
      canvas.width = w * scale;
      canvas.height = h * scale;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(function (pngBlob) {
        var link = document.createElement('a');
        link.download = 'diagram.png';
        link.href = URL.createObjectURL(pngBlob);
        link.click();
        URL.revokeObjectURL(link.href);
        btn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(function () { btn.innerHTML = '<i class="fas fa-download"></i>'; }, 1500);
      }, 'image/png');
    };

    img.onerror = function () {
      URL.revokeObjectURL(url);
      btn.innerHTML = '<i class="fas fa-download"></i>';
    };

    img.src = url;
  }
}
