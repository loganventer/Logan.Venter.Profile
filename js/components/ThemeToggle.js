import { IComponent } from '../contracts/IComponent.js';

/**
 * Dark/light theme toggle with localStorage persistence.
 */
export class ThemeToggle extends IComponent {
  constructor(eventBus) {
    super();
    this._eventBus = eventBus;
    this._cleanups = [];
  }

  mount() {
    // Expose globally for inline onclick in HTML
    window.toggleTheme = () => this._toggle();

    // Set initial icon state
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    this._updateIcons(theme);
  }

  unmount() {
    this._cleanups.forEach(fn => fn());
    this._cleanups = [];
    delete window.toggleTheme;
  }

  _toggle() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    this._updateIcons(next);

    // Notify other modules (neural background colors, mermaid theme)
    this._eventBus.emit('theme-change', next);
  }

  _updateIcons(theme) {
    const cls = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    const icon = document.getElementById('theme-icon');
    const iconMobile = document.getElementById('theme-icon-mobile');
    if (icon) icon.className = cls;
    if (iconMobile) iconMobile.className = cls;
  }
}
