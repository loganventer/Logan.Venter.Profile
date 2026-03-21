import { IComponent } from '../contracts/IComponent.js';

/**
 * Navigation bar: mobile menu, dropdown a11y, keyboard support.
 */
export class Navbar extends IComponent {
  constructor(eventBus) {
    super();
    this._eventBus = eventBus;
    this._cleanups = [];
  }

  mount() {
    const menuButton = document.getElementById('mobile-menu-button');
    const menuContainer = document.getElementById('mobile-menu-container');
    const menu = document.getElementById('mobile-menu');
    const menuClose = document.getElementById('mobile-menu-close');

    this._menuButton = menuButton;
    this._menuContainer = menuContainer;
    this._menu = menu;
    this._menuClose = menuClose;

    // Mobile menu toggle
    if (menuButton) {
      const handler = () => this._toggleMenu();
      menuButton.addEventListener('click', handler);
      this._cleanups.push(() => menuButton.removeEventListener('click', handler));
    }
    if (menuClose) {
      const handler = () => this._toggleMenu();
      menuClose.addEventListener('click', handler);
      this._cleanups.push(() => menuClose.removeEventListener('click', handler));
    }

    // Close on backdrop click
    if (menuContainer) {
      const handler = (e) => {
        if (e.target === menuContainer) this._toggleMenu();
      };
      menuContainer.addEventListener('click', handler);
      this._cleanups.push(() => menuContainer.removeEventListener('click', handler));
    }

    // Escape key closes menu and dropdowns
    const keyHandler = (e) => {
      if (e.key === 'Escape') {
        if (menuContainer && menuContainer.classList.contains('menu-open')) {
          this._toggleMenu();
        }
        document.querySelectorAll('.dropdown').forEach(d => {
          d.classList.remove('dropdown-open');
          const btn = d.querySelector('[aria-haspopup]');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      }
    };
    document.addEventListener('keydown', keyHandler);
    this._cleanups.push(() => document.removeEventListener('keydown', keyHandler));

    // Keyboard-accessible dropdowns
    document.querySelectorAll('.dropdown [aria-haspopup]').forEach(btn => {
      const keydownHandler = (e) => {
        const dropdown = btn.closest('.dropdown');
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          const isOpen = dropdown.classList.toggle('dropdown-open');
          btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          if (isOpen) {
            const firstLink = dropdown.querySelector('.dropdown-content a');
            if (firstLink) firstLink.focus();
          }
        }
      };
      btn.addEventListener('keydown', keydownHandler);
      this._cleanups.push(() => btn.removeEventListener('keydown', keydownHandler));

      const focusoutHandler = (e) => {
        const dropdown = btn.closest('.dropdown');
        setTimeout(() => {
          if (!dropdown.contains(document.activeElement)) {
            dropdown.classList.remove('dropdown-open');
            btn.setAttribute('aria-expanded', 'false');
          }
        }, 0);
      };
      btn.closest('.dropdown').addEventListener('focusout', focusoutHandler);
      this._cleanups.push(() => btn.closest('.dropdown').removeEventListener('focusout', focusoutHandler));
    });
  }

  unmount() {
    this._cleanups.forEach(fn => fn());
    this._cleanups = [];
  }

  _toggleMenu() {
    const isOpen = this._menuContainer.classList.toggle('menu-open');
    this._menu.classList.toggle('menu-open');
    document.body.classList.toggle('body-no-scroll', isOpen);

    if (this._menuButton) {
      this._menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    if (isOpen && this._menuClose) {
      this._menuClose.focus();
    } else if (!isOpen && this._menuButton) {
      this._menuButton.focus();
    }

    // Notify effects (e.g. neural background pause)
    this._eventBus.emit('menu-toggle', { isOpen });
  }
}
