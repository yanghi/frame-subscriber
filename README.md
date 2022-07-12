## [中文文档](./README.cn.md)

## frame-subscriber

Communication between different iframes based on postMessage

### Basic usage

There is only one instance of the client bus under an iframe, so `initializeClient` always returns the same object

```js
// iframe one
import initializeClient, { subscriber } from "frame-subscriber";

let client = initializeClient();

client.on("say", function (payload) {
  console.log("say ", payload.data, payload.from);
});
// iframe two
import initializeClient from "frame-subscriber";

let client = initializeClient();
client.emit("say", "hello");
// iframe one log 'say hello'
```

### Subscribe to events

```js
import initializeClient from "frame-subscriber";

let client = initializeClient();

client.on("some-event", function (payload) {
  console.log("some event fired", payload.data);
});

// can only be called once
client.once("some-event", function (payload) {
  console.log("only run once", payload.data);
});
/**
 * emit all subscribed 'foo' listener
 */
client.emit("foo", "hello");

// chain invoke
client
  .once("some-event", handler)
  .on("other-event", handler)
  .emit("my-emit", "hello");
```

### Specify subscribe

```js
import initializeClient, { subscriber } from "frame-subscriber";

let client = initializeClient();

// Now the subscriber with the namespace cool will only be fired when emit with the same namespace
let sub = subscriber({
  namespace: "cool",
  // In addition to namespace, there are `origin` and `unique` parameters that can be specified
  unique: "very cool",
});

sub.on("test", handler);
// on method can also specify subscription, it's same as above
client.on("test", handler, { namespace: "cool", unique: "very cool" });

// in other frame
// the sub will receive message
otherClient.emit("test", "realy cool", { namespace: "cool" });
//the sub nothing will happen
otherClient.emit("foo", "hello", { namespace: "awesome" });
//the sub nothing will happen too
otherClient.emit("test", "realy cool", { namespace: "cool", unique: "cool" });
```

## API

---

### Client

`initializeClient(options?: ClientOptions): Client`

event bus

#### Type

**`ClientOptions`**

```ts
ClientOptions {
    /**
     * Unique ID, you can specify it, otherwise it will be automatically generated
     */
    unique?: string
    /**
     * namespace
     */
    namespace?: string
    origin?: string
    /**
     * The default option used by the emit method
     */
     emit?: BaseOptions
    /**
     * Controls whether the client triggers the event when messages received
     */
    shouldReceive?: (payload: Payload) => boolean
}

let client = initializeClient({
    unique: 'foo',
    namespace: 'bar'
})

```

#### Method

**`on<T = any>(type: string, listener: EventHandler<T>, options?: SubscriberOptions): Client`**

add event listenerTo monitor events, if valid `options` is provided, the corresponding `Subscriber` will be created internally. It is more recommended to manually create a `Subscriber` to monitor the corresponding events, which is more convenient for management

**`once<T = any>(type: string, listener: EventHandler<T>, options?: SubscriberOptions): Client`**

Similar to `on`, but only listens once

**`off(type: string, listener: EventHandler, options?: BaseOptions): Client`**

remove event listener

**`emit(type: string, data: any, options?: BaseOptions): Client`**

trigger event

**`whenReady(callback: EventHandler): Client`**

Invoke callback when clients under other frames are created (or already created)

**`whenReady(unique: string | string[], callback: EventHandler): Client`**

Invoke when the Client under the specified frame is created (or already created)

**`send(message: any, targetOrigin?: string)`**

it's same as postMessage

### Subscriber

Client-based subscriber, the subscriber only receives events that provide the specified options on the client, and `Subscriber` can only subscribe to some messages forwarded by `Client`

`subscriber(options?: SubscriberOptions): Subscriber`

```ts
SubscriberOptions {
    unique?: string
    namespace?: string
    origin?: string
}

import { subscriber } from 'frame-subscriber'

let mySubscriber = subscriber({
    origin: 'http://example.com'
})
```

These three parameters are consistent with the role of the client. It should be noted that if the client has specified a certain one, which restricts the subscription of the message, the subscriber will become invalid.

### Method

`Subscriber` also has `on`, `once`, `off`, `offAll` methods, the only difference from `Client` is that there is no `options` parameter, because `Subscriber` already provides

**`remove`**

Remove this subscriber from the client and remove all its event listeners

