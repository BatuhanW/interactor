import { AnyObject, Interactor } from './interactor';

interface InteractorClassType extends Function {
  new (context: AnyObject): Interactor;
}

export class Organizer extends Interactor {
  public Interactors: InteractorClassType[] = [];

  async call(): Promise<void> {
    for (const InteractorClass of this.Interactors!) {
      await InteractorClass.call(this.context, false);
    }
  }
}
