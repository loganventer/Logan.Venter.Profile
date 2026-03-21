import { EventBus } from './core/EventBus.js';
import { ScrollObserver } from './core/ScrollObserver.js';
import { EffectManager } from './effects/EffectManager.js';
import { NeuralBackground } from './effects/NeuralBackground.js';
import { Navbar } from './components/Navbar.js';
import { SectionRouter } from './components/SectionRouter.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import { MermaidTheme } from './components/MermaidTheme.js';
import { Chatbot } from './chatbot/Chatbot.js';
import { InlineExpand } from './components/InlineExpand.js';

/**
 * App entry point — composes and initialises all modules.
 */
function init() {
  // 1. Shared infrastructure
  const eventBus = new EventBus();
  const scrollObserver = new ScrollObserver();

  // 2. Effects
  const neuralBg = new NeuralBackground('neural-canvas');
  const effectManager = new EffectManager();
  effectManager.register(neuralBg);
  effectManager.initAll();

  // 3. Components
  const components = [
    new Navbar(eventBus),
    new SectionRouter(),
    new ThemeToggle(eventBus),
    new MermaidTheme(eventBus),
    new Chatbot(),
    new InlineExpand(),
  ];
  components.forEach(c => c.mount());

  // 4. Scroll reveals
  scrollObserver.observeAll('.section');

  // 5. Cross-module wiring via EventBus
  eventBus.on('theme-change', (theme) => {
    neuralBg.updateColors(theme);
  });

  eventBus.on('menu-toggle', ({ isOpen }) => {
    if (isOpen) neuralBg.pauseAnimation();
    else neuralBg.resumeAnimation();
  });

  // 6. Hide loading overlay
  setTimeout(() => {
    const loadingEl = document.getElementById('loading-overlay');
    if (loadingEl) {
      loadingEl.style.opacity = '0';
      setTimeout(() => loadingEl.remove(), 300);
    }
  }, 500);

  // 7. Preload critical images
  const img = new Image();
  img.src = 'assets/images/image.jpg';

  // 8. Cleanup on unload
  window.addEventListener('beforeunload', () => {
    effectManager.destroy();
    components.forEach(c => c.unmount());
  });

  // 9. Global error handler
  window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
  });
}

// Boot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
