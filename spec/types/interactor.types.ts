import { Interactor } from '../../src';

interface Input {
  numberInput: number;
  strInput: string;
  boolInput: boolean;
}

interface Output {
  numberOutput: number;
  strOutput: string;
  boolOutput: boolean;
}

class InvalidTestInteractor extends Interactor<Input, Output> {
  async call() {
    this.context.fail();

    this.context.dontExist = this.context.dontExistAtAll;

    this.context.numberOutput = numberTest(this.context.boolInput);
    this.context.strOutput = strTest(this.context.numberInput);
    this.context.boolOutput = boolTest(this.context.strInput);
  }
}

const testInvalidInteractor = async () => {
  // Invalid
  const { result } = await InvalidTestInteractor.call<Input, Output>({
    numberInput: true,
    strInput: 1,
    boolInput: 'bool',
  });

  const dontExist: string = result.dontExist;

  numberTest(result.isSuccess());
  numberTest(result.isFailure());

  numberTest(result.boolOutput);
  strTest(result.numberOutput);
  boolTest(result.strOutput);
};

const testValid = async () => {
  const { result } = await InvalidTestInteractor.call<Input, Output>({
    numberInput: 1,
    strInput: 'str',
    boolInput: true,
  });

  boolTest(result.isFailure());
  boolTest(result.isSuccess());

  numberTest(result.numberOutput);
  numberTest(result.numberInput);

  strTest(result.strOutput);
  strTest(result.strOutput);

  boolTest(result.boolOutput);
  boolTest(result.boolOutput);
};

const numberTest = (n: number): number[] => {
  console.log(n);
  return [n, n];
};

const strTest = (str: string): string[] => {
  console.log(str);

  return [str, str];
};

const boolTest = (bool: boolean): boolean[] => {
  console.log(bool);

  return [bool, bool];
};
