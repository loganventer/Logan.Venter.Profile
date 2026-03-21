/**
 * SSE streaming handler for chatbot responses.
 * Handles tool indicators, delta text, suggestion parsing.
 */
export class StreamHandler {
  constructor(renderer, config) {
    this._renderer = renderer;
    this._chatUrl = config.chatUrl;
    this._history = [];
    this._streaming = false;

    this._toolLabels = {
      search_knowledge: 'Searching knowledge base',
      get_project_details: 'Looking up project details',
      get_experience: 'Looking up work experience',
      get_skills: 'Looking up technical skills',
      get_portfolio_info: 'Looking up portfolio architecture',
      microsoft_docs_search: 'Searching Microsoft docs',
      microsoft_docs_fetch: 'Fetching Microsoft article',
      microsoft_code_sample_search: 'Searching code samples'
    };
  }

  get history() { return this._history; }
  get streaming() { return this._streaming; }

  addToHistory(role, content) {
    this._history.push({ role, content });
  }

  async send(message, accessToken, input, sendBtn) {
    this._streaming = true;
    sendBtn.disabled = true;
    input.disabled = true;

    var msgEl = this._renderer.addMessage('assistant', '');
    var contentEl = msgEl.querySelector('.chat-msg-content');
    contentEl.innerHTML =
      '<span class="typing-indicator"><i class="fas fa-search" style="font-size:10px;color:#64748b;margin-right:6px;"></i><span></span><span></span><span></span></span>';

    var body = JSON.stringify({
      message: message,
      history: this._history.slice(0, -1),
      token: accessToken,
    });

    try {
      var response = await fetch(this._chatUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
      });

      if (!response.ok) {
        var errData;
        try { errData = await response.json(); } catch { errData = {}; }

        if (response.status === 403 &&
          (errData.error === 'token_expired' || errData.error === 'token_revoked' || errData.error === 'access_required')) {
          contentEl.textContent = 'Access expired. Please request access again.';
          this._streaming = false;
          sendBtn.disabled = false;
          input.disabled = false;
          return { expired: true };
        }

        if (response.status === 429 && errData.error === 'demo_limit') {
          contentEl.textContent = "You've reached the demo message limit. The admin can reset your limit if needed.";
          this._streaming = false;
          sendBtn.disabled = false;
          input.disabled = false;
          return {};
        }

        throw new Error(errData.error || 'HTTP ' + response.status);
      }

      var reader = response.body.getReader();
      var decoder = new TextDecoder();
      var fullText = '';
      var buffer = '';
      var showingTyping = true;
      var receivedText = false;

      while (true) {
        var result = await reader.read();
        if (result.done) break;

        buffer += decoder.decode(result.value, { stream: true });
        var lines = buffer.split('\n');
        buffer = lines.pop();

        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          if (!line.startsWith('data: ')) continue;
          var raw = line.substring(6);

          var evt;
          try { evt = JSON.parse(raw); } catch {
            if (raw === '[DONE]') continue;
            if (raw.startsWith('[ERROR]')) {
              contentEl.textContent = 'Something went wrong. Please try again.';
              break;
            }
            if (showingTyping) { contentEl.innerHTML = ''; showingTyping = false; }
            fullText += raw;
            contentEl.innerHTML = this._renderer.renderMarkdown(fullText);
            if (this._renderer.isNearBottom()) this._renderer.scrollToBottom();
            continue;
          }

          if (evt.type === 'tool') {
            if (showingTyping) { contentEl.innerHTML = ''; showingTyping = false; }
            var label = this._toolLabels[evt.name] || evt.name;
            var indicator = document.createElement('div');
            indicator.className = 'chat-tool-indicator';
            indicator.innerHTML = '<i class="fas fa-cog fa-spin"></i> ' + label + '...';
            contentEl.appendChild(indicator);
            if (this._renderer.isNearBottom()) this._renderer.scrollToBottom();
          } else if (evt.type === 'delta') {
            if (!receivedText) { contentEl.innerHTML = ''; receivedText = true; }
            fullText += evt.text;
            var displayText = fullText.replace(/\n*<<SUGGESTIONS>>[\s\S]*$/, '');
            contentEl.innerHTML = this._renderer.renderMarkdown(displayText);
            if (this._renderer.isNearBottom()) this._renderer.scrollToBottom();
          } else if (evt.type === 'error') {
            contentEl.textContent = 'Something went wrong. Please try again.';
            break;
          }
        }
      }

      if (fullText) {
        var parsed = this._parseSuggestions(fullText);
        this._history.push({ role: 'assistant', content: parsed.text });
        contentEl.innerHTML = this._renderer.renderMarkdown(parsed.text);
        this._renderer.renderMermaidBlocks(contentEl);
        if (parsed.suggestions.length > 0) {
          this._renderSuggestionChips(msgEl, parsed.suggestions, input);
        }
      } else if (!receivedText) {
        contentEl.textContent = 'No response received. Please try again.';
      }
    } catch (err) {
      contentEl.textContent = err.message.includes('Rate limit')
        ? 'Too many requests. Please wait a moment.'
        : 'Could not reach the agent. Please try again.';
    } finally {
      this._streaming = false;
      sendBtn.disabled = false;
      input.disabled = false;
      input.focus();
    }

    return {};
  }

  _parseSuggestions(text) {
    var marker = '<<SUGGESTIONS>>';
    var idx = text.lastIndexOf(marker);
    if (idx === -1) return { text: text, suggestions: [] };
    var before = text.substring(0, idx).replace(/\n+$/, '');
    var sugStr = text.substring(idx + marker.length).trim();
    var suggestions = sugStr.split('||').map(function (s) { return s.trim(); }).filter(Boolean);
    return { text: before, suggestions: suggestions };
  }

  _renderSuggestionChips(msgEl, suggestions, input) {
    var self = this;
    var wrapper = document.createElement('div');
    wrapper.className = 'chat-suggestions';
    for (var i = 0; i < suggestions.length; i++) {
      var chip = document.createElement('button');
      chip.className = 'chat-suggestion-chip';
      chip.textContent = suggestions[i];
      chip.addEventListener('click', (function (text) {
        return function () {
          if (self._streaming) return;
          input.value = text;
          // Trigger send via the chatbot orchestrator
          input.dispatchEvent(new Event('suggestion-click'));
        };
      })(suggestions[i]));
      wrapper.appendChild(chip);
    }
    var bubble = msgEl.querySelector('.chat-msg-bubble');
    if (bubble) bubble.appendChild(wrapper);
    if (this._renderer.isNearBottom()) this._renderer.scrollToBottom();
  }
}
