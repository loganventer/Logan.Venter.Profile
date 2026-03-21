/**
 * IntersectionObserver wrapper for scroll-triggered reveals.
 */
export class ScrollObserver {
  constructor(options = {}) {
    this._threshold = options.threshold || 0.1;
    this._rootMargin = options.rootMargin || '0px 0px 50px 0px';
    this._observer = null;
    this._init();
  }

  _init() {
    this._observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
          }
        });
      },
      {
        threshold: this._threshold,
        rootMargin: this._rootMargin,
      }
    );
  }

  observe(element) {
    if (element) {
      this._observer.observe(element);
    }
  }

  observeAll(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => this.observe(el));
  }

  destroy() {
    if (this._observer) {
      this._observer.disconnect();
    }
  }
}
