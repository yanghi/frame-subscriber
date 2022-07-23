
import Client from "./client";
import EventEmitter from "./event";

import { BaseOptions, strictExpect } from "./options";


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
    expect(options: BaseOptions) {
        return strictExpect(this._options, options)
    }
    /**
    * @internal
    */
    _emit(type: string, ...args: any[]) {
        return super.emit(type, ...args)
    }
    /**
     * its same as client's emit totally
     */
    emit(type: string, data: any, options?: BaseOptions) {
        if (this._client) {
            this._client.emit(type, data, options)
        }

        return this
    }
    private _client: Client | undefined

    get client() {
        return this._client
    }
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



export default Subscriber
