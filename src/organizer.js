import { Interactor } from './interactor';

export class Organizer extends Interactor {
  interactors = [];

  async call() {
    for (const interactor of this.interactors) {
      await interactor.call(this.context);
    }
  }
}
