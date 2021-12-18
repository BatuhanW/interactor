import { Context } from './context';

export class InteractorFailure extends Error {
  constructor(context: Context) {
    super('InteractorFailure');

    Object.defineProperty(this, 'context', { value: context });
    Object.defineProperty(this, 'name', { value: 'InteractorFailure' });
  }

  public context!: Context;
}
