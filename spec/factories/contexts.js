import { Context } from '../../src/context';

export const contextInput = {
  name: 'Pop',
  color: 'white',
  birthday: '12.04.2019',
};

export const buildContext = (input) => Context.build(input || contextInput);
