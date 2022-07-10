
import Client from "./client";
import EventEmitter from "./event";

import { BaseOptions, expect } from "./options";


export interface SubscriberOptions extends BaseOptions {

}

class Subscriber extends EventEmitter {
    private _options: SubscriberOptions

    constructor(options: SubscriberOptions) {
        super()
        this._options = options

    }
    get options() {
        return this._options
    }
    expect(optioins: BaseOptions) {
        return expect(optioins, this._options)
    }
    private _client: Client | undefined

    addTo(client: Client) {
        this._client = client
        client._addSubscriber(this)
    }
    remove() {
        if (this._client) {
            this._client._removeSubscriber(this)
            this._client = undefined
            this.offAll()
        }
    }

}

interface Subscriber extends EventEmitter {
    /**
     * @internal
     */
    emit: (type: string, ...args: any[]) => this
}

export default Subscriber
