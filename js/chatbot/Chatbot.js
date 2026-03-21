import { IComponent } from '../contracts/IComponent.js';
import { AccessGate } from './AccessGate.js';
import { MessageRenderer } from './MessageRenderer.js';
import { StreamHandler } from './StreamHandler.js';

/**
 * Chatbot orchestrator. Implements IComponent lifecycle.
 * Composes AccessGate, MessageRenderer, and StreamHandler.
 */
export class Chatbot extends IComponent {
  constructor() {
    super();
    this._container = null;
    this._input = null;
    this._sendBtn = null;
    this._gate = null;
    this._renderer = null;
    this._stream = null;
    this._cleanups = [];
  }

  mount() {
    this._container = document.getElementById('chatbot-container');
    if (!this._container) return;

    var scrollArea = this._container.querySelector('.chatbot-scroll-area');
    var messages = document.getElementById('chatbot-messages');
    this._input = document.getElementById('chatbot-input');
    this._sendBtn = document.getElementById('chatbot-send');

    // Compose sub-modules
    this._renderer = new MessageRenderer(messages, scrollArea);
    this._stream = new StreamHandler(this._renderer, {
      chatUrl: '/.netlify/functions/chat',
    });

    this._gate = new AccessGate(this._container, {
      tokenUrl: '/.netlify/functions/token',
      pollInterval: 3000,
      onGranted: () => this._onAccessGranted(),
    });

    // Wire up send
    var sendHandler = () => this._handleSend();
    this._sendBtn.addEventListener('click', sendHandler);
    this._cleanups.push(() => this._sendBtn.removeEventListener('click', sendHandler));

    var keyHandler = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this._handleSend();
      }
    };
    this._input.addEventListener('keydown', keyHandler);
    this._cleanups.push(() => this._input.removeEventListener('keydown', keyHandler));

    // Suggestion chip clicks
    var sugHandler = () => this._handleSend();
    this._input.addEventListener('suggestion-click', sugHandler);
    this._cleanups.push(() => this._input.removeEventListener('suggestion-click', sugHandler));

    // Prompt chips
    var chips = document.querySelectorAll('.chatbot-prompt-chip');
    chips.forEach((chip) => {
      var handler = () => {
        if (this._stream.streaming) return;
        this._input.value = chip.textContent;
        this._handleSend();
      };
      chip.addEventListener('click', handler);
      this._cleanups.push(() => chip.removeEventListener('click', handler));
    });

    // Quick action buttons
    var actions = document.querySelectorAll('.chatbot-action');
    actions.forEach((btn) => {
      var handler = () => {
        if (this._stream.streaming) return;
        this._input.value = btn.getAttribute('data-query');
        this._handleSend();
      };
      btn.addEventListener('click', handler);
      this._cleanups.push(() => btn.removeEventListener('click', handler));
    });

    // Init gate (checks token, shows gate or chat)
    this._gate.init();
  }

  unmount() {
    this._cleanups.forEach(fn => fn());
    this._cleanups = [];
    if (this._gate) this._gate.destroy();
    if (this._renderer) this._renderer.destroy();
  }

  _onAccessGranted() {
    this._renderer.addMessage(
      'assistant',
      "Hi! I'm Logan's portfolio agent. Ask me anything about his experience, skills, or projects."
    );
  }

  async _handleSend() {
    var text = this._input.value.trim();
    if (!text || this._stream.streaming) return;

    if (!this._gate.accessToken) {
      this._gate.showAndReset();
      return;
    }

    this._renderer.addMessage('user', text);
    this._stream.addToHistory('user', text);
    this._input.value = '';

    var chipsContainer = document.getElementById('chatbot-chips');
    if (chipsContainer) chipsContainer.style.display = 'none';
    var actionsContainer = document.getElementById('chatbot-actions');
    if (actionsContainer) actionsContainer.style.display = 'none';

    var result = await this._stream.send(text, this._gate.accessToken, this._input, this._sendBtn);

    if (result && result.expired) {
      this._gate.clearToken();
      setTimeout(() => this._gate.showAndReset(), 1500);
    }
  }
}
