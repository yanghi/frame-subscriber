### 基本用法
一个iframe下只有一个client 总线实例,所以`createClient`返回的总是同一个对象

```js
// 首先在所有的iframe中使用 frame-subscriber

// iframe one
import createClient, {subscriber} from 'frame-subscriber'

let client = createClient()
client.on('say', function(payload){
    console.log('say ', payload.data)
})
// iframe two
import createClient from 'frame-subscriber'

let client = createClient()
client.emit('say', 'hello')

// iframe one 将打印 'say hello'
```
### 订阅事件

``` js
import createClient from 'frame-subscriber'

let client = createClient()

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