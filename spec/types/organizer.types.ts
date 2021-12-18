import { Organizer, Interactor } from '../../src';

interface Input1 {
  numberInput1: number;
  strInput1: string;
  boolInput1: boolean;
}

interface Output1 {
  numberOutput1: number;
  strOutput1: string;
  boolOutput1: boolean;
}

interface Input2 {
  numberInput2: number;
  strInput2: string;
  boolInput2: boolean;
}

interface Output2 {
  numberOutput2: number;
  strOutput2: string;
  boolOutput2: boolean;
}

class Interactor1 extends Interactor<Input1, Output1> {
  async call() {
    this.context.boolOutput1 = boolTest(this.context.boolInput1);
  }
}

class Interactor2 extends Interactor<Input1 & Input2, Output2> {
  async call() {}
}

class TestOrganizer extends Organizer {
  interactors = [Interactor1, Interactor2];
}

const testInvalid = async () => {
  const { result } = await TestOrganizer.call<Input1 & Input2, Output1 & Output2>({
    numberInput1: true,
    numberInput2: false,
    strInput1: 1,
    strInput2: 2,
    boolInput1: 'true',
    boolInput2: 'false',
  });

  const dontExist: string = result.dontExist;

  numberTest(result.isFailure());
  numberTest(result.isSuccess());

  numberTest(result.boolOutput1);
  numberTest(result.boolOutput2);

  strTest(result.numberOutput1);
  strTest(result.numberOutput2);

  boolTest(result.strOutput1);
  boolTest(result.strOutput2);
};

const testValid = async () => {
  const { result } = await TestOrganizer.call({
    numberInput1: 1,
    numberInput2: 2,
    strInput1: 'strInput1',
    strInput2: 'strInput2',
    boolInput1: true,
    boolInput2: false,
  });

  boolTest(result.isFailure());
  boolTest(result.isSuccess());

  numberTest(result.numberOutput1);
  numberTest(result.numberOutput1);

  strTest(result.strOutput1);
  strTest(result.strOutput2);

  boolTest(result.boolOutput1);
  boolTest(result.boolOutput2);
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
