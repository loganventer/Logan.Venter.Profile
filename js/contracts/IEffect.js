/**
 * Effect interface contract.
 * All visual effects must implement: init(), destroy(), onResize().
 */
export class IEffect {
  init() {
    throw new Error('IEffect.init() must be implemented');
  }

  destroy() {
    throw new Error('IEffect.destroy() must be implemented');
  }

  onResize() {
    // Optional — default no-op
  }
}
