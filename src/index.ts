
import Client, { Events, ClientOptions } from './client'
import Subscriber, { SubscriberOptions } from './subscriber'


let _client: Client | undefined


function client(options?: ClientOptions) {
    return _client || (_client = new Client(options))
}

client.Events = Events

export default client

export function subscriber(options: SubscriberOptions) {

    const subscriber = new Subscriber(options)

    client(options).addSubscriber(subscriber)

    return subscriber
}

export { Events }
export { EventHandler } from './client'

