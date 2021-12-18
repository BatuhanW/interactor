import { InteractorFailure } from './failure';
import { AnyObject, Interactor } from './interactor';

const buildDefinePropertiesDescriptor = (context: AnyObject, writable = true) =>
  Object.entries(context).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: {
        enumerable: true,
        configurable: true,
        value,
        writable,
      },
    };
  }, {});

export class Context {
  static build<Params = AnyObject>(context: Context | AnyObject) {
    if (context instanceof Context) {
      return context as Context & Params;
    } else {
      return new this(context) as Context & Params;
    }
  }

  private _isFailure: boolean = false;
  private _calledInteractors: Interactor[] = [];
  private _isRolledBack: boolean = false;

  constructor(context: AnyObject = {}) {
    Object.defineProperties(this, buildDefinePropertiesDescriptor(context));
  }

  public isSuccess(): boolean {
    return !this.isFailure();
  }

  public isFailure(): boolean {
    return this._isFailure;
  }

  public fail(context: AnyObject = {}): Promise<void> {
    Object.defineProperties(this, buildDefinePropertiesDescriptor(context, false));

    this._isFailure = true;

    throw new InteractorFailure(this);
  }

  _markAsCalled(interactor: Interactor) {
    this._calledInteractors.push(interactor);
  }

  async _rollback() {
    if (this._isRolledBack) return false;

    for (const interactor of this._calledInteractors.reverse()) {
      await interactor.rollback();
    }

    this._isRolledBack = true;
  }
}
