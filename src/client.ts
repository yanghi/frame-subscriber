import EventEmitter from "./event";
import { BaseOptions, isSameSpecifiedBlockOptions, isSpecifiedBlockOptions, looseExpect, uniqueOption, UniqueOptions } from "./options";
import { InternalPayload, isPayload, Payload } from "./payload";
import Subscriber, { SubscriberOptions } from "./subscriber";
import { uid } from "./utils";

export interface ClientOptions extends BaseOptions {
    emit?: BaseOptions
    /**
     * Controls whether the client triggers the event when messages received
     */
    shouldReceive?: (payload: Payload) => boolean
}

export const Events = {
    /**
     * message event, not include client emited
     */
    MESSAGE: '@message',
    /**
     * original message event
     */
    ORIGIN_MESSAGE: '@originmessage',
    /**
     * when the other client was created
     */
    CREATED: '@created',
    /**
     * when the client's shouldReceive option return false
     */
    DECLINE: '@decline',
    /**
     * Receive messages from other iframes, includle all messages, not filtered
     */
    ORIGIN_RECEIVE: '@originreceive',
    /**
     * Expected messages from other iframes
     */
    EXPECT_RECEIVE: '@expectreceive'
} as const

const InternalEvents = Object.keys(Events).map(key => Events[key])

function isInternalEvent(type: string) {
    return InternalEvents.includes(type)
}
class Client {
    private _win = window;
    private _root: Window
    private _isRoot: boolean
    private _unique?: string
    private _namespace: string | undefined
    private _options: ClientOptions

    private _loaded: Record<string, Payload> = {}
    private _uid = uid()

    get uid() { return this._uid }
    get options() {
        return this._options
    }
    private _event = new EventEmitter()
    private _origin: string

    get isRoot(): boolean {
        return this._isRoot
    }

    constructor(options: ClientOptions = {}) {
        this._root = this.getRoot(window)

        this._options = options

        this._unique = this._options.unique
        this._namespace = options.namespace

        this._isRoot = this._root === window

        this._origin = window.origin || window.location.origin

        this._resgiterEvent()

        this.emit(Events.CREATED, null)

    }
    private _resgiterEvent() {
        this.on(Events.CREATED, (payload) => {
            if (payload.from.unique) {
                this._loaded[payload.from.unique] = payload
            }
        })

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
    /**
     * invoke callback when every client was created
     */
    whenReady(callback: EventHandler): this
    /**
     * invoke callback when the specified client was created
     */
    whenReady(unique: string | string[], callback: EventHandler): this
    whenReady(uniqueOrCb: any, callback?: EventHandler): this {
        let targets: string[] | undefined

        if (typeof uniqueOrCb === 'function') {
            callback = uniqueOrCb

            this._event.on(Events.CREATED, uniqueOrCb)
            targets = Object.keys(this._loaded)
            uniqueOrCb = undefined
        }

        if (targets === undefined && uniqueOrCb) {
            targets = Array.isArray(uniqueOrCb) ? uniqueOrCb : [uniqueOrCb]
        }

        if (!targets || !callback) return this

        for (let index = 0; index < targets.length; index++) {
            const clientUID = targets[index];

            if (this._loaded[clientUID]) {
                callback(this._loaded[clientUID])
            } else {
                this._event.on(Events.CREATED, (payload: Payload) => {
                    if (payload.from.unique === clientUID) {
                        callback!(payload)
                    }
                })
            }
        }

        return this
    }
    getRoot(win: Window): Window {
        const parent = win.parent

        if (parent && parent !== win) {
            return this.getRoot(parent)
        }

        return parent || win
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
        if (payload.from.uid === this._uid) return

        this._event.emit(Events.ORIGIN_RECEIVE, payload)

        const type = payload.type
        let internalEmited = false, _isInternalEvent = isInternalEvent(type)

        if (isInternalEvent(type)) {
            internalEmited = true
            this._event.emit(type, payload)
        } else {
            if (this._options.shouldReceive) {
                const shouldReceive = this._options.shouldReceive(payload)

                if (!shouldReceive) return this._event.emit(Events.DECLINE, payload)
            }
        }

        if (looseExpect(this._options, payload.to || {})) {

            !internalEmited && this._event.emit(payload.type, payload)

            this._event.emit(Events.EXPECT_RECEIVE, payload)

            if (isSpecifiedBlockOptions(payload.to)) {

                for (let i = 0; i < this._subscribers.length; i++) {
                    let subscriber = this._subscribers[i]

                    if (subscriber.expect(payload.to)) {
                        subscriber.emit(payload.type, payload)
                    } else {
                    }
                }
            }
        }
    }


    send(message: any, targetOrigin?: string) {
        this._win.postMessage(message, targetOrigin || '*')
    }
    emit(type: string, data: any, option?: BaseOptions): this {
        const payload: InternalPayload = {
            data,
            type,
            __: true,
            from: {
                unique: this._unique,
                namespace: this._namespace,
                origin: this._origin,
                uid: this._uid
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
    off(type: string, listener?: EventHandler, options?: BaseOptions) {
        if (options) {
            let sbs = this.getSubscriber(options)
            sbs.forEach(sub => sub.off(type, listener))
        } else {
            this._event.off(type, listener)
        }

        return this
    }
    /**
     * remove all event listeners out of client and all subscribers
     */
    offAll() {
        this._event.offAll()
        this._subscribers.forEach(sub => sub.offAll())
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


