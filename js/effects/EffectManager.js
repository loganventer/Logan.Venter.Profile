/**
 * Registers and lifecycle-manages all visual effects.
 */
export class EffectManager {
  constructor() {
    this._effects = [];
    this._resizeHandler = () => this._onResize();
    window.addEventListener('resize', this._resizeHandler, { passive: true });
  }

  register(effect) {
    this._effects.push(effect);
    return this;
  }

  initAll() {
    this._effects.forEach(effect => effect.init());
  }

  _onResize() {
    this._effects.forEach(effect => effect.onResize());
  }

  destroy() {
    window.removeEventListener('resize', this._resizeHandler);
    this._effects.forEach(effect => effect.destroy());
    this._effects = [];
  }
}
