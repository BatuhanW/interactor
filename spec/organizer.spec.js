import {
  buildContext,
  buildInteractor,
  buildInteractorMock,
  buildOrganizer,
  buildThreeInteractors,
  callPusherFn,
  initializeOrganizer,
  rollbackPusherFn,
} from './factories';
import { Organizer } from '../src';
import { assertRollbackContext } from './utils';
import { Context } from '../src/context';

describe('Organizer', () => {
  describe('organize', () => {
    it('accepts interactors', () => {
      const interactor1 = buildInteractorMock('1');
      const interactor2 = buildInteractorMock('2');

      const organizer = initializeOrganizer(interactor1, interactor2);

      expect(organizer.Interactors).toStrictEqual([interactor1, interactor2]);
    });
  });

  describe('call', () => {
    it('works', async () => {
      expect.assertions(3);
      const interactor1 = buildInteractorMock('1');
      const interactor2 = buildInteractorMock('2');
      const interactor3 = buildInteractorMock('3');

      const organizer = initializeOrganizer(interactor1, interactor2, interactor3);

      const context = buildContext();

      const spy1 = jest.spyOn(interactor1, 'call');
      const spy2 = jest.spyOn(interactor2, 'call');
      const spy3 = jest.spyOn(interactor2, 'call');

      await organizer.call(context);

      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
      expect(spy3).toHaveBeenCalled();
    });
  });

  describe('rollback', () => {
    describe('single organizer', () => {
      describe('when InteractorFailure error', () => {
        it('with safeCall', async () => {
          expect.assertions(8);
          const interactors = buildThreeInteractors({ throwsInteractorFailure: true });

          const organizer = buildOrganizer(...interactors);

          const { result } = await organizer.safeCall({ initialValue: true });

          assertRollbackContext(result);
        });

        it('with call', async () => {
          expect.assertions(8);

          const interactors = buildThreeInteractors({ throwsInteractorFailure: true });

          const organizer = buildOrganizer(...interactors);

          try {
            await organizer.call({ initialValue: true });
          } catch (error) {
            assertRollbackContext(error.context);
          }
        });
      });

      describe('when Any other error', () => {
        describe('with safeCall', () => {
          it('it throws', async () => {
            expect.assertions(8);

            const interactors = buildThreeInteractors({ throwsInteractorFailure: false });

            const organizer = buildOrganizer(...interactors);

            const context = Context.build({ initialValue: true });

            try {
              await organizer.safeCall(context);
            } catch (e) {
              expect(e.message).toStrictEqual('TestError');

              assertRollbackContext(context, { withInteractorFailure: false });
            }
          });
        });

        describe('with call', () => {
          it('it throws again', async () => {
            expect.assertions(8);

            const interactors = buildThreeInteractors({ throwsInteractorFailure: false });

            const organizer = buildOrganizer(...interactors);

            const context = Context.build({ initialValue: true });

            try {
              await organizer.call(context);
            } catch (e) {
              expect(e.message).toStrictEqual('TestError');

              assertRollbackContext(context, { withInteractorFailure: false });
            }
          });
        });
      });
    });

    describe('multiple organizers', () => {
      it('works', async () => {
        const interactor1 = buildInteractor(callPusherFn(1), rollbackPusherFn(1));
        const interactor2 = buildInteractor(callPusherFn(2), rollbackPusherFn(2));
        const interactor3 = buildInteractor(callPusherFn(3), rollbackPusherFn(3));
        const interactor4 = buildInteractor(callPusherFn(4), rollbackPusherFn(4));
        const interactor5 = buildInteractor(callPusherFn(5), rollbackPusherFn(5));
        const interactor6 = buildInteractor(
          callPusherFn(6, { throwsInteractorFailure: true }),
          rollbackPusherFn(6),
        );

        const subOrganizer1 = buildOrganizer(interactor1, interactor2);
        const subOrganizer2 = buildOrganizer(interactor3, interactor4);
        const subOrganizer3 = buildOrganizer(interactor5, interactor6);

        const mainOrganizer = buildOrganizer(subOrganizer1, subOrganizer2, subOrganizer3);

        const { result } = await mainOrganizer.safeCall({ called: [], rolledBack: [] });

        expect(result.called).toStrictEqual([1, 2, 3, 4, 5, 6]);

        expect(result.rolledBack).toStrictEqual([5, 4, 3, 2, 1]);
      });
    });
  });
});
