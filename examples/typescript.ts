import { Organizer, Interactor } from '../src';

interface PlaceOrderInput {
  params: {
    userId: number;
    sku: string;
  };
}

interface CreateOrderResult {
  order: { id: string; userId: number; sku: string };
  error?: string;
}

interface CreateReservationResult extends CreateOrderResult {
  reservation: { id: string; orderId: string };
}

class CreateOrder extends Interactor<PlaceOrderInput, CreateOrderResult> {
  async call() {
    const { params } = this.context;

    const order = await OrderService.create(params);

    this.context.order = order;
  }
}

class CreateReservation extends Interactor<CreateOrderResult, CreateReservationResult> {
  async call() {
    const { order } = this.context;

    const reservation = await ReservationService.create({ order });

    if (reservation) {
      this.context.reservation = reservation;
    } else {
      this.context.fail({ error: 'No stock!' });
    }
  }
}

class PlaceOrder extends Organizer {
  Interactors = [CreateOrder, CreateReservation];
}

const test = async () => {
  const { result } = await PlaceOrder.call<PlaceOrderInput, CreateReservationResult>({
    params: {
      userId: 1,
      sku: 'SKU',
    },
  });

  if (result.isSuccess()) {
    console.log(result.order); // => { id: 1, userId: 1, sku: 'SKU' }
    console.log(result.reservation); // => { id: 1, orderId: 1 }
  } else {
    console.error(result.error); // => No stock!
  }
};
