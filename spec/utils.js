export const assertRollbackContext = (context, { withInteractorFailure } = { withInteractorFailure: true }) => {
  expect(context.initialValue).toStrictEqual(true);

  expect(context.called1).toStrictEqual(true);
  expect(context.called2).toStrictEqual(true);
  expect(context.called3).toStrictEqual(true);
  expect(context.rolledBack1).toStrictEqual(true);
  expect(context.rolledBack2).toStrictEqual(true);

  expect(context.rolledBack3).toBeUndefined();

  if (withInteractorFailure) {
    expect(context.error).toStrictEqual('TestError');
  }
};
