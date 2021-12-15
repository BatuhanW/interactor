import { Context } from './context';

export class Interactor {
  static async safeCall(context = {}) {
    const interactor = new this(context);

    await interactor._safeRun();

    return { result: interactor.context };
  }

  static async call(context = {}) {
    const interactor = new this(context);

    await interactor._run();

    return { result: interactor.context };
  }

  constructor(context = {}) {
    this.context = Context.build(context);
  }

  async _safeRun() {
    try {
      await this._run();
    } catch (e) {
      if (e.name === 'InteractorFailure') return;

      throw e;
    }
  }

  async _run() {
    try {
      await this.call();
      this.context._markAsCalled(this);
    } catch (e) {
      await this.context._rollback();

      throw e;
    }
  }

  async call() {}

  async rollback() {}
}
