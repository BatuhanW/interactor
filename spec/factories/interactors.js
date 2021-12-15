import { Interactor } from '../../src';

export const buildInteractor = (callFn, rollbackFn) => {
  return class TestInteractor extends Interactor {
    async call() {
      callFn(this.context);
    }

    async rollback() {
      rollbackFn(this.context);
    }
  };
};

export const buildMultipleInteractors = (number = 1, start = 1, callFn, rollbackFn) => {
  const interactors = [];

  for (let i = start; i <= number; i++) {
    interactors.push(buildInteractor(callFn, rollbackFn));
  }

  return interactors;
};

export const callPusherFn =
  (number, errorType = undefined) =>
  (context) => {
    context.called.push(number);

    if (!errorType) return;

    buildFailureFn(errorType)(context)();
  };

export const rollbackPusherFn = (number) => (context) => {
  context.rolledBack.push(number);
};

const buildFailureFn =
  ({ throwsInteractorFailure }) =>
  (context) => {
    if (throwsInteractorFailure) {
      context.fail({ error: 'TestError' });
    } else {
      throw new Error('TestError');
    }
  };

export const buildThreeInteractors = ({ throwsInteractorFailure }) => {
  const interactor1 = buildInteractor(
    (context) => {
      context.called1 = true;
    },
    (context) => {
      context.rolledBack1 = true;
    },
  );

  const interactor2 = buildInteractor(
    (context) => {
      context.called2 = true;
    },
    (context) => {
      context.rolledBack2 = true;
    },
  );

  const failureInteractor = buildInteractor(
    (context) => {
      context.called3 = true;
      if (throwsInteractorFailure) {
        context.fail({ error: 'TestError' });
      } else {
        throw new Error('TestError');
      }
    },
    (context) => {
      context.rolledBack3 = true;
    },
  );

  return [interactor1, interactor2, failureInteractor];
};

export const buildInteractorMock = jest.fn().mockImplementation((name) => {
  return {
    name: name,
    call: jest.fn().mockImplementation(() => {}),
    rollback: jest.fn().mockImplementation(() => {}),
  };
});
