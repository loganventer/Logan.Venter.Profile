/**
 * Component interface contract.
 * All interactive components must implement: mount(), unmount().
 */
export class IComponent {
  mount() {
    throw new Error('IComponent.mount() must be implemented');
  }

  unmount() {
    throw new Error('IComponent.unmount() must be implemented');
  }
}
