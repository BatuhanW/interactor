# Interactor

![CI](https://github.com/BatuhanW/interactor/workflows/main/badge.svg)
[![Maintainability](https://api.codeclimate.com/v1/badges/4315aa36678fe4181b77/maintainability)](https://codeclimate.com/github/BatuhanW/interactor/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/4315aa36678fe4181b77/test_coverage)](https://codeclimate.com/github/BatuhanW/interactor/test_coverage)

Typescript implementation of [collectiveidea/interactor](https://github.com/collectiveidea/interactor) Ruby gem.

## Installation

```bash
npm i @batuhanw/interactor
```

or

```bash
yarn add @batuhanw/interactor
```

## Getting Started

Interactors are simple, single-purpose objects used to encapsulate your application's business logic. Each interactor represents one thing your application does.

### Interactor

To define an interactor, simply create a class that extends from `Interactor` and add `call()` instance method.

```typescript
class CreateOrder extends Interactor {
  async call() {
    // Do something
  }
}
```

An interactor is used by invoking its `static call()` method.

```typescript
CreateOrder.call();
```

When an `Interactor`'s `static call()` method is invoked, it builds an instance of `Context` from given object.

```typescript
CreateOrder.call({ params: { sku: 'sku', userId: 1 } });
```

And `Context` is accessible within the interactor's `call()` instance method.

```typescript
class CreateOrder extends Interactor {
  async call() {
    const { params } = this.context;

    params.sku; // => 'sku'
    params.userId; // => 1
  }
}
```

An interactor can also mutate its `Context`.

```typescript
class CreateOrder extends Interactor {
  async call() {
    const { params } = this.context;

    this.context.order = await OrderService.create(params);

    this.context.order; // => Order { id: 1, sku: 'sku', userId: 1 }
  }
}
```

When completed, interactor return its `Context` under `result` key of the object.

```typescript
const { result } = await CreateOrder.call({ params: { sku: 'sku', userId: 1 } });

result.params; // { sku: 'sku', userId: 1 }
result.order; // Order { id: 1, sku: 'sku', userId: 1 }
```

If something goes wrong in your interactor, you can mark context as failed.

```typescript
class CreateOrder extends Interactor {
  async call() {
    const { params } = this.context;

    try {
      this.context.order = await OrderService.create(params);
    } catch (error) {
      this.context.fail();
    }
  }
}
```

If you pass an object to the `fail()` method, it also updates the context. The followings are equivalent:

```typescript
this.context.error = 'invalid SKU';
this.context.fail();
```

or

```typescript
this.context.fail({ error: 'invalid SKU' });
```

You can ask a context if it's a failure.

```typescript
const { result } = CreateOrder.call({ sku: 'sku', userId: 1 });

result.isFailure(); // => false
result.error; // => 'invalid SKU'
```

or if it's a success

```typescript
const { result } = CreateOrder.call({ sku: 'sku', userId: 1 });

result.isSuccess(); // => true
result.order; // => Order { id: 1, sku: 'sku', userId: 1 }
```

When `Context` is failed with `this.context.fail({ .. })` method, it throws `InteractorFailure` exception.

By default, `InteractorFailure` exception is swallowed by interactor.

It's possible to change this behaviour.

Calling the Interactor with `catchInteractorFailure: false` will throw `InteractorFailure` error.
This error has `context` field that gets populated with current context at the time of failure.

```typescript
try {
  const { result } = await CreateOrder.call(
    { params: { sku: 'sku', userId: 1 } },
    { catchInteractorFailure: false },
  );
} catch (e) {
  if (e instanceof InteractorFailure) {
    e.context; // Context { params: { sku: 1, userId: 1 }, error: 'invalid SKU' }
  }
}
```

### Organizer

Organizer is a variation of interactor. It can run multiple interactors in order.

```typescript
class PlaceOrder extends Organizer {
  Interactors = [CreateOrder, ReserveProduct];
}
```

And these interactors share the same context.

```typescript
class CreateOrder extends Interactor {
  async call() {
    this.context.order = await OrderService.create(this.context.params);
  }
}

class ReserveProduct extends Interactor {
  async call() {
    const { order } = this.context;

    this.context.reservation = await ReservationService.create({ order });
  }
}
```

If any of the interactors fails, `Organizer` calls `rollback()` instance method on successfully called interactors in reverse order.
Organizer won't call `rollback()` on the failed interactor itself.

```typescript
class PlaceOrder extends Organizer {
  Interactors = [CreateOrder, ReserveProduct, ChargeCustomer];
}

class CreateOrder extends Interactor {
  // Called 1st
  async call() {
    this.context.order = await OrderService.create(this.context.params);
  }

  // Called 5th
  async rollback() {
    const { order } = this.context;

    await OrderService.markAsFailed({ order });
  }
}

class ReserveProduct extends Interactor {
  // Called 2nd
  async call() {
    const { order } = this.context;

    this.context.reservation = await ReservationService.create({ order });
  }

  // Called 4th
  async rollback() {
    const { id } = this.context.reservation;

    await ReservationService.destroy(id);
  }
}

class ChargeCustomer extends Interactor {
  // # Called 3rd
  async call() {
    const { user, order } = this.context;

    const payment = await PaymentService.charge({ user, order });

    this.context.fail({ error: 'payment failed' });
  }
}
```
