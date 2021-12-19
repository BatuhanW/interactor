import { Interactor, Organizer } from '../dist';

class CreateOrder extends Interactor {
  async call() {
    const { params } = this.context;

    this.context.order = OrderService.create(params);
  }
}

class ValidateStock extends Interactor {
  async call() {
    const { sku } = this.context.order;

    const inStock = await StockService.checkStock({ sku });

    if (!inStock) {
      this.context.fail({ error: 'No stock!' });
    }
  }
}

class CreateReservation extends Interactor {
  async call() {
    const { order } = this.context;
    const reservation = ReservationService.create({ order });

    this.context.reservation = reservation;
  }
}

class ReserveProduct extends Organizer {
  Interactors = [ValidateStock, CreateReservation];
}

class SendEmail extends Interactor {
  async call() {
    const { user, order } = this.context;

    await NotificationService.sendEmail('OrderConfirmation', user, { order });
  }
}

class SendPush extends Interactor {
  async call() {
    const { user, order } = this.context;

    await NotificationService.sendPush('OrderConfirmation', user, { order });
  }
}

class SendSMS extends Interactor {
  async call() {
    const { user, order } = this.context;

    await NotificationService.sendSMS('OrderConfirmation', user, { order });
  }
}

class SendNotifications extends Organizer {
  Interactors = [SendEmail, SendPush, SendSMS];
}

class PlaceOrder extends Organizer {
  Interactors = [
    CreateOrder, // => CreateOrder
    ReserveProduct, // => [ValidateStock, CreateReservation]
    SendNotifications, // => [SendEmail, SendPush, SendSMS]
  ];
}

const test = async () => {
  const { result } = await PlaceOrder.call({
    params: { userId: 1, sku: 'SKU' },
  });

  const { order, reservation } = result;

  console.log(order);
  console.log(reservation);
};
