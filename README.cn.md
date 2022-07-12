## frame-subscriber

基于postMessage 在不同iframe之间的通信

### 基本用法
一个iframe下只有一个client 总线实例,所以`initializeClient`返回的总是同一个对象

```js
// 首先在所有的iframe中使用 frame-subscriber

// iframe one
import initializeClient, {subscriber} from 'frame-subscriber'

let client = initializeClient()
client.on('say', function(payload){
    console.log('say ', payload.data, payload.from)
})
// iframe two
import initializeClient from 'frame-subscriber'

let client = initializeClient()
client.emit('say', 'hello')

// iframe one 将打印 'say hello'
```
### 订阅事件

``` js
import initializeClient from 'frame-subscriber'

let client = initializeClient()

client.on('some-event', function (payload) {
    console.log('some event fired', payload.data)
})

// 仅触发一次
client.once('some-event', function (payload) {
    console.log('only run once', payload.data)
})
/**
 * 所有监听了'foo' 的iframe订阅器都将调用
 */
client.emit('foo', 'hello')

// 主要方法都可以链式使用
client.once('some-event', handler)
.on('other-event', handler)
.emit('my-emit', 'hello')
```

### 指定订阅

``` js

// 有时候,我们需要指定某些iframe的事件被触发,而不仅仅是根据事件名,这里就需要用到订阅器

let sub = subscriber({namespace: 'cool'})
// 现在这个namespace 为cool的订阅器仅仅会在emit指定相同的namespace时才会被触发

sub.on('test', handler)
// 其他iframe下,这样才能触发上一个订阅器的cool事件
client.emit('test', 'realy cool', { namespace: 'cool'})
/**
 * 仅namespace为'awesome'的订阅器的foo事件会被触发
 */
client.emit('foo', 'hello', {namespace: 'awesome'})


function handler(payload){
    console.log(`${payload.type} fired`, payload.data, payload.from, payload.to)
}
// on方法也有指定订阅功能
// 仅为namespace
client.on('foo', handler, {namespace: 'love'})

// other iframe
// 上一个指定namespace love 的订阅监听将会触发,并且payload.to也会有数据
client.emit('foo', 'hello', { namespace: 'love'})


```

### Client
`initializeClient(options?: ClientOptions): Client`
事件总线
#### Type
**`ClientOptions`**

```ts
{
    /**
     * client唯一标识,你可以指定它,否则将自动生成
     */
    unique?: string
    /**
     * client的命名空间
     */
    namespace?: string
    /**
     * client允许被通信的origin
     */
    origin?: string
    /**
     * emit方法使用的默认option
     */
     emit?: BaseOptions
     /**
     * 控制是否接收消息,返回false则不接收
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

监听事件,如果提供了有效`options`,内部会创建对应的`Subscriber`,更推荐手动创建`Subscriber`去监听对应事件,这更利于管理

**`once<T = any>(type: string, listener: EventHandler<T>, options?: SubscriberOptions): Client`**

类似于`on`,但只监听一次

**`off(type: string, listener: EventHandler, options?: BaseOptions): Client`**

移除监听事件

**`emit(type: string, data: any, options?: BaseOptions): Client`**

触发事件

**`whenReady(callback: EventHandler): Client`**

当其他frame下的Client被创建时(或者已经创建)运行

**`whenReady(unique: string | string[], callback: EventHandler): Client`**

当指定的frame下的Client被创建时(或者已经创建)运行

**`send(message: any, targetOrigin?: string)`**

同postMessage

### Subscriber

基于Client的订阅器,订阅器在client上接受特定的事件,可以认为`Client`是`Subscriber`的中转站,`Subscriber`只订阅`Client`转发的部分消息

`subscriber(options?: SubscriberOptions): Subscriber`

```ts
SubscriberOptions {
    unique?: string
    namespace?: string
    origin?: string
}
```
这三个参数与client作用一致,需要注意的是,如果client已经指定了某一个,限制了消息的订阅,那么订阅器就会失效

```
var myClient = initializeClient()

// 其他 client 发送给`subscriber-namespace`
var mySubscriber = subscriber({namespace: 'subscriber-namespace'})


// in other frame
var otherClient = initializeClient()

// mySubscriber将收到消息
otherClient.emit('test', 'data', {namespace: 'subscriber-namespace})
```


### Method
`Subscriber`同样拥有 `on`,`once`,`off`, `offAll`方法,于`Client`不同的是, 没有`options`参数

**`remove`**

从client上移出这个订阅器,并移出它的所有事件监听