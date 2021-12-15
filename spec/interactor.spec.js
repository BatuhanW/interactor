import { Interactor, InteractorFailure } from '../src';
import { Context } from '../src/context';
import { buildContext, buildInteractor, buildThreeInteractors } from './factories';
import { assertRollbackContext } from './utils';

describe('Interactor', () => {
  describe('call', () => {
    describe('when success', () => {
      it('returns context', async () => {
        const { result } = await Interactor.call({ test: 1 });

        expect(result).toBeInstanceOf(Context);

        expect(result.test).toEqual(1);
      });
    });

    describe('when failure', () => {
      describe('when InteractorFailure error', () => {
        it('throws with merged context', async () => {
          expect.assertions(4);
          const callFn = (context) => context.fail({ error: 'test' });
          const rollbackFn = (context) => (context.rolledBack = true);

          const interactor = buildInteractor(callFn, rollbackFn);

          try {
            await interactor.call({ test: 1 });
          } catch (e) {
            expect(e).toBeInstanceOf(InteractorFailure);
            expect(e.context.error).toStrictEqual('test');
            expect(e.context.test).toStrictEqual(1);
            expect(e.context.rolledBack).toBeUndefined();
          }
        });
      });

      describe('when random error', () => {
        it('throws', async () => {
          expect.assertions(2);
          const callFn = () => {
            throw new Error('TestError');
          };

          const interactor = buildInteractor(callFn);

          try {
            await interactor.call({ test: 1 });
          } catch (e) {
            expect(e).toBeInstanceOf(Error);
            expect(e.message).toStrictEqual('TestError');
          }
        });
      });
    });
  });

  describe('safeCall', () => {
    describe('when success', () => {
      it('returns context', async () => {
        expect.assertions(2);
        const { result } = await Interactor.safeCall({ test: 1 });

        expect(result).toBeInstanceOf(Context);

        expect(result.test).toEqual(1);
      });
    });

    describe('when failure', () => {
      describe('when InteractorFailure', () => {
        it('doesnt throw', async () => {
          expect.assertions(4);
          const callFn = (context) => context.fail({ error: 'test' });

          const interactor = buildInteractor(callFn);

          const { result } = await interactor.safeCall({ test: 1 });

          expect(result).toBeInstanceOf(Context);
          expect(result.isFailure()).toStrictEqual(true);
          expect(result.test).toStrictEqual(1);
          expect(result.error).toStrictEqual('test');
        });
      });

      describe('when any other error', () => {
        it('throws', async () => {
          expect.assertions(2);

          const failure = () => {
            throw new Error('TestError');
          };

          const interactor = buildInteractor(failure);

          try {
            await interactor.safeCall({ test: 1 });
          } catch (e) {
            expect(e).toBeInstanceOf(Error);
            expect(e.message).toStrictEqual('TestError');
          }
        });
      });
    });
  });

  describe('rollback', () => {
    describe('when called on 1', () => {
      it('doesnt call rollback', async () => {
        const context = buildContext({ initialValue: true });

        const failureInteractor = buildInteractor(
          (context) => {
            context.called = true;
            context.fail({ error: 'TestError' });
          },
          (context) => {
            context.rolledBack = true;
          },
        );

        try {
          await failureInteractor.call(context);
        } catch (e) {
          expect(e.context.initialValue).toStrictEqual(true);

          expect(e.context.called).toStrictEqual(true);
          expect(e.context.rolledBack).toBeUndefined();
        }
      });
    });

    describe('when multiple', () => {
      describe('when InteractorFailure', () => {
        it('triggers rollback for previous', async () => {
          expect.assertions(24);

          const [interactor1, interactor2, failureInteractor] = buildThreeInteractors({
            throwsInteractorFailure: true,
          });

          const { result: result1 } = await interactor1.call({ initialValue: true });
          const { result: result2 } = await interactor2.call(result1);

          try {
            await failureInteractor.call(result2);
          } catch (e) {
            assertRollbackContext(e.context);
          }

          [result1, result2].forEach((result) => {
            assertRollbackContext(result);
          });
        });
      });

      describe('when different error', () => {
        it('triggers rollback for previous', async () => {
          expect.assertions(14);

          const [interactor1, interactor2, failureInteractor] = buildThreeInteractors({
            throwsInteractorFailure: false,
          });

          const { result: result1 } = await interactor1.call({ initialValue: true });
          const { result: result2 } = await interactor2.call(result1);

          try {
            await failureInteractor.call(result2);
          } catch (e) {}

          [result1, result2].forEach((result) => {
            assertRollbackContext(result, { withInteractorFailure: false });
          });
        });
      });
    });
  });

  describe('constructor', () => {
    it('initializes context from object', () => {
      const interactor = new Interactor({ test: 1 });

      expect(interactor.context).toBeInstanceOf(Context);
    });
  });
});
