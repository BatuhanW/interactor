import { Organizer } from '../../src';

export const initializeOrganizer = (...interactors) => {
  class TestOrganizer extends Organizer {
    interactors = [...interactors];
  }

  return new TestOrganizer();
};
export const buildOrganizer = (...interactors) => {
  class TestOrganizer extends Organizer {
    interactors = [...interactors];
  }

  return TestOrganizer;
};
