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
  static async call<Params extends AnyObject = AnyObject, Result extends AnyObject = AnyObject>(
    context: Params,
    catchInteractorFailure: boolean = true,
  ): Promise<InteractorResult<Params, Result>> {
    const interactor: Interactor<Params, Result> = new this(context);

    await interactor._run(catchInteractorFailure);

    return { result: interactor.context };
  }

  public context: Context & Input & Output;

  constructor(context: Input) {
    this.context = Context.build<Input & Output>(context);
  }

  async _run(catchInteractorFailure: boolean) {
    try {
      await this.call();
      this.context._markAsCalled(this);
    } catch (e) {
      await this.context._rollback();

      if (catchInteractorFailure && e instanceof InteractorFailure) return;

      throw e;
    }
  }

  async call(): Promise<void> {}

  async rollback(): Promise<void> {}
}
