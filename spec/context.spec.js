import { Context } from '../src/context';
import { InteractorFailure } from '../src';
import { buildContext, buildInteractorMock, contextInput } from './factories';

const errorMessage = 'Oh :(';

describe('Context', () => {
  describe('static#build', () => {
    it('builds context without parameter', () => {
      const context = Context.build();

      expect(context).toBeInstanceOf(Context);
    });

    it('builds context from object', () => {
      const context = buildContext();

      expect(context).toBeInstanceOf(Context);
    });

    it('doesnt build new context if built context is passed', () => {
      const context1 = buildContext();
      const context2 = buildContext(context1);

      expect(context1.color).toStrictEqual('white');
      expect(context2.color).toStrictEqual('white');

      expect(context1.name).toStrictEqual('Pop');
      expect(context2.name).toStrictEqual('Pop');

      context1.color = 'pink';
      context2.name = 'Popita';

      expect(context1.name).toStrictEqual('Popita');
      expect(context2.color).toStrictEqual('pink');
    });

    it('doesnt modify input parameter', () => {
      const input = { key: 'value' };

      const context = Context.build(input);

      context.key = 'newValue';

      expect(input.key).toStrictEqual('value');
    });
  });

  describe('instance', () => {
    it('#enumerable', () => {
      const context = buildContext();

      Object.keys(context).map((key) => {
        expect(context.propertyIsEnumerable(key)).toStrictEqual(true);
      });
    });

    describe('#default', () => {
      it('#isSuccess true and #isFailure false', () => {
        const context = buildContext();

        expect(context.isSuccess()).toStrictEqual(true);
        expect(context.isFailure()).toStrictEqual(false);
      });
    });

    describe('#fail', () => {
      it('sets success to false and failure to true', () => {
        const context = buildContext();

        try {
          context.fail();
        } catch (e) {}

        expect(context.isSuccess()).toStrictEqual(false);
        expect(context.isFailure()).toStrictEqual(true);
      });

      it('preserves existing context and add new fields', () => {
        const context = buildContext();

        try {
          context.fail({ error: errorMessage });
        } catch (e) {}

        expect(context.name).toStrictEqual(contextInput.name);
        expect(context.color).toStrictEqual(contextInput.color);
        expect(context.birthday).toStrictEqual(contextInput.birthday);
        expect(context.error).toStrictEqual(errorMessage);
      });

      it('raises InteractorFailure error', () => {
        const context = buildContext();

        try {
          context.fail({ error: errorMessage });
        } catch (e) {
          expect(e).toBeInstanceOf(InteractorFailure);
          expect(e.context.name).toStrictEqual(contextInput.name);
          expect(e.context.color).toStrictEqual(contextInput.color);
          expect(e.context.birthday).toStrictEqual(contextInput.birthday);
          expect(e.context.error).toStrictEqual(errorMessage);
          expect(e.context).toStrictEqual(context);
        }
      });
    });

    describe('#rollback', () => {
      it('marks as called', () => {
        const context = buildContext();

        expect(context._calledInteractors).toStrictEqual([]);

        const interactor1 = buildInteractorMock('1');
        const interactor2 = buildInteractorMock('2');

        context._markAsCalled(interactor1);
        context._markAsCalled(interactor2);

        expect(context._calledInteractors).toStrictEqual([interactor1, interactor2]);
      });

      it('marks as called and rollbacks', async () => {
        const context = buildContext();

        const interactor1 = buildInteractorMock('1');
        const interactor2 = buildInteractorMock('2');

        context._markAsCalled(interactor1);
        context._markAsCalled(interactor2);

        const spy1 = jest.spyOn(interactor1, 'rollback');
        const spy2 = jest.spyOn(interactor2, 'rollback');

        expect(context._isRolledBack).toStrictEqual(false);

        await context._rollback();

        expect(spy2).toHaveBeenCalled();
        expect(spy1).toHaveBeenCalled();
        expect(context._isRolledBack).toStrictEqual(true);

        spy1.mockClear();
        spy2.mockClear();

        await context._rollback();

        expect(spy2).not.toHaveBeenCalled();
        expect(spy1).not.toHaveBeenCalled();
      });
    });
  });
});
