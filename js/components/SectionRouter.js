import { IComponent } from '../contracts/IComponent.js';

/**
 * Section show/hide routing with hash-based navigation.
 */
export class SectionRouter extends IComponent {
  constructor() {
    super();
    this._currentSection = 'about';
    this._isProgrammatic = false;
    this._cleanups = [];
  }

  mount() {
    // Expose showSection globally for inline onclick attributes in HTML
    window.showSection = (sectionId, element) => this._showSection(sectionId, element);
    window.toggleMobileMenu = window.toggleMobileMenu || (() => {});

    // Handle browser back/forward
    const popstateHandler = () => {
      if (this._isProgrammatic) return;
      const hash = window.location.hash.slice(1);
      if (hash && document.getElementById(hash)) {
        this._showSection(hash);
      } else {
        this._showSection('about');
      }
    };
    window.addEventListener('popstate', popstateHandler);
    this._cleanups.push(() => window.removeEventListener('popstate', popstateHandler));

    // Show initial section
    this._showSection('about');
  }

  unmount() {
    this._cleanups.forEach(fn => fn());
    this._cleanups = [];
    delete window.showSection;
  }

  _showSection(sectionId, element) {
    if (sectionId === this._currentSection && document.querySelector('.section.active')) {
      return;
    }

    // Fade out current
    const currentSection = document.querySelector('.section.active');
    if (currentSection) {
      currentSection.style.opacity = '0.5';
    }

    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
      section.style.opacity = '1';
    });

    // Show target
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add('active');
      targetSection.style.opacity = '0';
      setTimeout(() => {
        targetSection.style.opacity = '1';
      }, 50);
    }
    this._currentSection = sectionId;

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('nav-item-active');
    });

    if (element && !element.closest('.dropdown')) {
      element.classList.add('nav-item-active');
    } else if (element) {
      const parentDropdown = element.closest('.dropdown');
      if (parentDropdown) {
        parentDropdown.querySelector('.nav-item').classList.add('nav-item-active');
      }
    } else {
      const aboutLink = document.querySelector('a.nav-item[onclick*="\'about\'"]');
      if (aboutLink) {
        aboutLink.classList.add('nav-item-active');
      }
    }

    // Update URL hash
    if (history.pushState) {
      this._isProgrammatic = true;
      history.pushState(null, null, '#' + sectionId);
      setTimeout(() => {
        this._isProgrammatic = false;
      }, 100);
    }
  }
}
