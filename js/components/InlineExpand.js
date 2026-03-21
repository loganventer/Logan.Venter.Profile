import { IComponent } from '../contracts/IComponent.js';

/**
 * Inline expandable links within sentences.
 * Clicking a .exp-toggle reveals/hides its associated .exp-detail-content sibling.
 */
export class InlineExpand extends IComponent {
  constructor() {
    super();
    this._handler = null;
  }

  mount() {
    this._handler = (e) => {
      // Let real links (external, section-link) work without interference
      if (e.target.closest('a')) return;

      const toggle = e.target.closest('.exp-toggle');
      if (!toggle) return;
      e.preventDefault();

      // Find the next .exp-detail-content sibling after this specific toggle
      let content = null;
      let sibling = toggle.nextElementSibling;
      while (sibling) {
        if (sibling.classList.contains('exp-detail-content')) {
          content = sibling;
          break;
        }
        sibling = sibling.nextElementSibling;
      }
      if (!content) return;

      const isOpen = content.style.display !== 'none' && content.style.display !== '';
      const showAs = content.tagName === 'SPAN' ? 'inline' : 'block';
      content.style.display = isOpen ? 'none' : showAs;
      toggle.classList.toggle('active', !isOpen);
    };
    document.addEventListener('click', this._handler);
  }

  unmount() {
    if (this._handler) {
      document.removeEventListener('click', this._handler);
      this._handler = null;
    }
  }
}
