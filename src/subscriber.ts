
import Client from "./client";
import EventEmitter from "./event";

import { BaseOptions, isSpecifiedBlockOptions, strictExpect } from "./options";
import { InternalPayload } from "./payload";
import { uid } from "./utils";


export interface SubscriberOptions extends BaseOptions {

}

class Subscriber extends EventEmitter {
    private _options: SubscriberOptions
    private _uid = uid()

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
        const payload: InternalPayload = {
            data,
            type,
            __: true,
            from: {
                unique: this.options.unique,
                namespace: this.options.namespace,
                origin: window.origin || window.location.origin,
                uid: this._uid
            }
        }

        let _options = { namespace: this.options.namespace, ...options }
        
        if (isSpecifiedBlockOptions(_options)) {
            payload.to = {
                unique: _options.unique,
                namespace: _options.namespace,
                origin: _options.origin
            }
        }


        this._client?.getRoot(window).postMessage(payload, _options?.origin || '*')

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
