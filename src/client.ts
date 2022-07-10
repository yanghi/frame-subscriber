import EventEmitter from "./event";
import { BaseOptions, expect, isSameSpecifiedBlockOptions, isSpecifiedBlockOptions, uniqueOption, UniqueOptions } from "./options";
import { isPayload, Payload } from "./payload";
import Subscriber, { SubscriberOptions } from "./subscriber";

export interface ClientOptions extends BaseOptions {
    emit?: BaseOptions
}

export const Events = {
    /**
     * message event, not include client emited
     */
    MESSAGE: 'message',
    /**
     * original message event
     */
    ORIGIN_MESSAGE: 'originmessage',
    /**
     * when the client was created
     */
    CREATED: 'created'
}


class Client {
    private _win = window;
    private _root: Window
    private _isRoot: boolean
    private _unique: string
    private _namespace: string | undefined
    private _options: UniqueOptions<ClientOptions>

    get options() {
        return this._options
    }
    private _event = new EventEmitter()
    private _origin: string
    private _child: Client[] = []

    get isRoot(): boolean {
        return this._isRoot
    }

    constructor(options: ClientOptions = {}) {
        this._root = this.getRoot(window)

        this._options = uniqueOption(options)

        this._unique = this._options.unique
        this._namespace = options.namespace

        this._isRoot = this._root === window

        this._origin = window.origin || window.location.origin

        window['__FS__'] = this
        this._root['__FS__'] && this._root['__FS__']._child.push(this)

        this._resgiterEvent()

        this.emit(Events.CREATED, null)

    }
    private _resgiterEvent() {
        this._win.addEventListener('message', (e) => {
            const raw = e.data

            if (isPayload(raw)) {

                this._broadcast(raw)
            } else {
                this._event.emit(Events.MESSAGE, e)
            }

            this._event.emit(Events.ORIGIN_MESSAGE, e)

        })
    }
    getRoot(win: Window): Window {
        const parent = win.parent

        if (parent && parent !== win) {
            return this.getRoot(parent)
        }

        return parent || win
    }
    getAllIns(): Client[] {
        return this._root['__FS__'] && this._root['__FS__']._child
    }
    private _broadcast(payload: Payload) {

        let frames = this._win.frames
        for (let i = 0; i < frames.length; i++) {
            let frame = frames[i]
            frame.postMessage(payload, payload.to?.origin || '*')
        }
        this._emit(payload)
    }
    private _emit(payload: Payload) {

        // ignore emit if it's itself
        if (payload.from.unique === this._unique) return

        if (expect(payload.to || {}, this._options)) {
            this._event.emit(payload.type, payload)
        }

        if (isSpecifiedBlockOptions(payload.to)) {


            this._event.emit(payload.type, payload)


            for (let i = 0; i < this._subscribers.length; i++) {
                let subscriber = this._subscribers[i]

                if (subscriber.expect(payload.to)) {
                    subscriber.emit(payload.type, payload)
                }
            }
        }
    }


    send(message: any, targetOrigin?: string) {
        this._win.postMessage(message, targetOrigin || '*')
    }
    emit(type: string, data: any, option?: BaseOptions): this {
        const payload: Payload = {
            data,
            type,
            __: true,
            from: {
                unique: this._unique,
                namespace: this._namespace,
                origin: this._origin
            }

        }

        let _options = option || this.options.emit
        if (isSpecifiedBlockOptions(_options)) {
            payload.to = {
                unique: _options.unique,
                namespace: _options.namespace,
                origin: _options.origin
            }
        }

        this._root.postMessage(payload, option?.origin || '*')

        return this
    }
    private _on<T = any>(type: string, listener: EventHandler<T>, options?: SubscriberOptions, once?: boolean): this {

        if (isSpecifiedBlockOptions(options)) {
            let sc = new Subscriber(options)

            if (once) {

                sc.once(type, listener)
            } else {

                sc.on(type, listener)
            }
            this.addSubscriber(sc)
        } else {

            if (once) {
                this._event.once(type, listener)

            } else {

                this._event.on(type, listener)
            }
        }

        return this
    }
    on<T = any>(type: string, listener: EventHandler<T>, options?: SubscriberOptions): this {
        return this._on(type, listener, options, false)
    }
    once<T = any>(type: string, listener: EventHandler<T>, options?: SubscriberOptions): this {
        return this._on(type, listener, options, true)
    }
    private _subscribers: Subscriber[] = []
    off(type: string, listener: EventHandler, options?: BaseOptions) {
        let off = !!options

        if (options) {
            let sbs = this.getSubscriber(options)
            sbs.forEach(sub => sub.off(type, listener))
            off = !sbs.length
        }

        if (!off) {
            this._event.off(type, listener)
        }
        return this
    }
    /**
     * @internal
     */
    _addSubscriber(sc: Subscriber) {
        if (!this.hasSubscriber(sc)) {
            this._subscribers.push(sc)
            return true
        }

    }
    addSubscriber(sc: Subscriber) {
        sc.addTo(this)
    }
    removeSubscriber(sc: Subscriber) {
        sc.remove()
    }
    /**
     * @internal
     */
    _removeSubscriber(sc: Subscriber) {
        let idx = this._subscribers.indexOf(sc)

        if (idx !== -1) {
            this._subscribers.splice(idx, 1)
        }
    }
    hasSubscriber(sc: Subscriber): boolean {
        return this._subscribers.includes(sc)
    }
    getSubscriber(options: BaseOptions): Subscriber[] {
        return this._subscribers.filter(s => isSameSpecifiedBlockOptions(s.options, options))
    }
}

export type EventHandler<T = any> = (event: Payload<T>) => void

export default Client


