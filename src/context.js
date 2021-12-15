import { InteractorFailure } from './failure';

export class Context {
  static build(context = {}) {
    if (context instanceof Context) {
      return context;
    } else {
      return new this(context);
    }
  }

  _isFailure = false;
  _calledInteractors = [];
  _isRolledBack = false;

  constructor(context = {}) {
    Object.defineProperties(
      this,
      Object.entries(context).reduce((acc, [key, value]) => {
        return {
          ...acc,
          [key]: {
            enumerable: true,
            configurable: true,
            value,
            writable: true,
          },
        };
      }, {}),
    );
  }

  isSuccess() {
    return !this.isFailure();
  }

  isFailure() {
    return this._isFailure;
  }

  fail(context = {}) {
    Object.defineProperties(
      this,
      Object.entries(context).reduce((acc, [key, value]) => {
        return {
          ...acc,
          [key]: {
            enumerable: true,
            configurable: true,
            value,
            writable: false,
          },
        };
      }, {}),
    );

    this._isFailure = true;

    throw new InteractorFailure(this);
  }

  _markAsCalled(interactor) {
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
