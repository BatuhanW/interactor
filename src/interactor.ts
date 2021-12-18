import { Context } from './context';
import { InteractorFailure } from './failure';

interface InteractorResult<
  Input extends AnyObject = AnyObject,
  Output extends AnyObject = AnyObject,
> {
  result: Input & Output & Context;
}

export type AnyObject = Record<string, any>;

export class Interactor<Input extends AnyObject = AnyObject, Output extends AnyObject = AnyObject> {
  static async safeCall(context = {}) {
    const interactor = new this(context);

    await interactor._safeRun();

    return { result: interactor.context };
  }

  static async call<Params extends AnyObject = AnyObject, Result extends AnyObject = AnyObject>(
    context: Params,
  ): Promise<InteractorResult<Params, Result>> {
    const interactor: Interactor<Params, Result> = new this(context);

    await interactor._run();

    return { result: interactor.context };
  }

  public context: Context & Input & Output;

  constructor(context: Input) {
    this.context = Context.build<Input & Output>(context);
  }

  async _safeRun() {
    try {
      await this._run();
    } catch (e) {
      if (e instanceof InteractorFailure) return;

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

  async call(): Promise<void> {}

  async rollback(): Promise<void> {}
}
