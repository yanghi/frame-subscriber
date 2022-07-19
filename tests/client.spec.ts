import Client, { Events } from "../src/client";
import { eventExpecter, mockPost } from "./util";

describe('Client', () => {

    it("emit", (done) => {
        const expectEventDone = eventExpecter(done)
        expectEventDone.willCall(Events.CREATED)

        const client = new Client()


        const iframe = document.createElement("iframe");
        document.body.appendChild(iframe);


        iframe.contentWindow!.addEventListener("message", function (event) {
            expectEventDone(event.data)
        }, false);


        const spy = jest.fn()

        client.on('foo', spy)
        expectEventDone.willCall('foo', 'hello')
        client.emit('foo', 'hello');
        expect(spy).not.toHaveBeenCalled()

        expectEventDone.willCall('bar', 'yes')
        client.emit('bar', 'yes')


    });

    it('on', (done) => {
        const expectEventDone = eventExpecter(done)

        const client = new Client({
            unique: 'foo',
            namespace: 'foo-ns'
        })

        const mp = mockPost()


        client.on('foo', expectEventDone)

        expectEventDone.willCall('foo', 'bar')
        expectEventDone.willCall('foo', 'zoo', (payload) => {
            expect(payload.to?.unique).toBe('foo')
        })


        mp.post({ type: 'foo', data: 'bar' })
        // not emited
        mp.post({ type: 'foo', data: 'zero', to: { unique: 'not-exsit' } })
        mp.post({ type: 'foo', data: 'zoo', to: { unique: 'foo' } })


        client.on('event-1', expectEventDone)
        expectEventDone.willCall('event-1', 'foo', (payload) => {
            expect(payload.to?.namespace).toBe('foo-ns')
        })
        client.on('event-2', expectEventDone)

        mp.post({ type: 'event-1', data: 'foo', to: { namespace: 'foo-ns' } })
        // not emited
        mp.post({ type: 'event-2', data: 'zero', to: { namespace: 'not-exsit' } })


    })
    it('on with options', (done) => {
        const expectEventDone = eventExpecter(done)

        const client = new Client()
        const mp = mockPost()


        client.on('foo', expectEventDone, { namespace: 'foo' })
        expectEventDone.willCall('foo', 'data-1')

        client.on('foo', expectEventDone, { namespace: 'bar' })
        expectEventDone.willCall('foo', 'data-3')


        mp.post({ type: 'foo', data: 'data-1', to: { namespace: 'foo' } })
        // not emited
        mp.post({ type: 'foo', data: 'data-2', to: { namespace: 'not-exsit' } })
        mp.post({ type: 'foo', data: 'data-3', to: { namespace: 'bar' } })

        client.on('bar', expectEventDone, { namespace: 'bar', unique: 'bar' })
        expectEventDone.willCall('bar', 'data-4')

        // not emited
        mp.post({ type: 'bar', data: 'data-3', to: { namespace: 'bar' } })
        mp.post({ type: 'bar', data: 'data-4', to: { namespace: 'bar', unique: 'bar' } })

    })
    it('whenReady', (done) => {
        const expectEventDone = eventExpecter(done)

        const client = new Client({
            unique: 'foo'
        })

        const mp = mockPost()

        client.whenReady(expectEventDone)

        expectEventDone.willCall(Events.CREATED, undefined, (payload) => {
            expect(payload.from.unique).toBe('itsme')
        })

        mp.post({ type: Events.CREATED, from: { unique: 'itsme' } })


        client.whenReady(['any', 'foo', 'bar'], expectEventDone)

        expectEventDone.willCall(Events.CREATED, undefined, (payload) => {
            expect(payload.from.unique).toBe('foo')
        })

        mp.post({ type: Events.CREATED, from: { unique: 'foo' } })

    })
    it('off', (done) => {
        const expectEventDone = eventExpecter(done)

        const client = new Client()

        const mp = mockPost()

        const spy = expectEventDone.spyDone(), spy_1 = expectEventDone.spyDone()

        client.on('foo', spy).on('foo', spy_1)

        client.off('foo', spy)

        expectEventDone.willCall('foo', undefined, () => {
            expect(spy_1).toHaveBeenCalled()
            expect(spy).not.toHaveBeenCalled()
        })

        mp.post({ type: 'foo' })


    })
    it('off with options', (done) => {
        const expectEventDone = eventExpecter(done)

        const client = new Client()

        const mp = mockPost()

        const spy = expectEventDone.spyDone(), spy_1 = expectEventDone.spyDone()

        const options = {
            namespace: 'foo'
        }

        client.on('foo', spy, options).on('foo', spy_1, options)

        expect(client.getSubscriber(options).length).toBe(2)
        client.off('foo', spy, { ...options })


        expectEventDone.willCall('foo', undefined, () => {
            expect(spy_1).toHaveBeenCalled()
            expect(spy).not.toHaveBeenCalled()
        })

        mp.post({ type: 'foo', to: options })

        const options_1 = {
            unique: 'zero',
            namespace: 'bar'
        }

        const spy_2 = expectEventDone.spyDone(), spy_3 = expectEventDone.spyDone()

        client.on('bar', spy_2, options_1).on('bar', spy_2, options_1)
        client.on('bar', spy_3, options_1)

        client.off('bar', spy_2, options_1)

        expectEventDone.willCall('bar', undefined, () => {
            expect(spy_3).toHaveBeenCalled()
            expect(spy_2).not.toHaveBeenCalled()
        })

        mp.post({ type: 'bar', to: options_1 })

        const spy_4 = expectEventDone.spyDone(), spy_5 = expectEventDone.spyDone()

        client.on('zero', spy_4, options_1)
            .on('zero', spy_5, options_1)

        // should'nt remove event listener
        client.off('zero', spy_4)
        client.off('zero', spy_5, { namespace: 'notTarget' })

        // expectEventDone.willCall('zero')
        expectEventDone.willCallTimes(2, () => {
            expect(spy_4).toBeCalledTimes(1)
            expect(spy_5).toBeCalledTimes(1)
        })

        mp.post({ type: 'zero', to: options_1 })


    })
    it('offAll', (done) => {
        const expectEventDone = eventExpecter(done)

        const client = new Client()

        const mp = mockPost()

        const spy = expectEventDone.spyDone(), spy_1 = expectEventDone.spyDone(), spy_2 = expectEventDone.spyDone(), spy_3 = expectEventDone.spyDone()

        const opt = { namespace: 'foo' }

        client.on('foo', spy, opt)
            .on('bar', spy_1)


        client.offAll()


        client.on('foo', spy_2, opt)
            .on('bar', spy_3)

        expectEventDone.whenAllCalled(() => {
            expect(spy).not.toHaveBeenCalled()
            expect(spy_1).not.toHaveBeenCalled()

            expect(spy_2).toHaveBeenCalledTimes(1)
            expect(spy_3).toHaveBeenCalledTimes(1)
        })

        expectEventDone.willCallTimes(2)


        mp.post({ type: 'foo', to: opt })
        mp.post({ type: 'bar' })

    })
})