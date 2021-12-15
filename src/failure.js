export class InteractorFailure extends Error {
  constructor(context) {
    super('InteractorFailure');

    Object.defineProperty(this, 'context', { value: context });
    Object.defineProperty(this, 'name', { value: 'InteractorFailure' });
  }
}
