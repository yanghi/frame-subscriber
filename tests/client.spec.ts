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
        expectEventDone.willCall('foo', 'zoo', (payload)=>{
            expect(payload.to?.unique).toBe('foo')
        })


        mp.post({ type: 'foo', data: 'bar' })
        // not emited
        mp.post({ type: 'foo', data: 'zero', to: { unique: 'not-exsit' } })
        mp.post({ type: 'foo', data: 'zoo', to: { unique: 'foo' } })


        client.on('event-1', expectEventDone)
        expectEventDone.willCall('event-1', 'foo', (payload)=>{
            expect(payload.to?.namespace).toBe('foo-ns')
        })
        client.on('event-2', expectEventDone)

        mp.post({ type: 'event-1', data: 'foo', to: { namespace: 'foo-ns' } })
        // not emited
        mp.post({ type: 'event-2', data: 'zero', to: { namespace: 'not-exsit' } })


    })
    it('on with options', (done)=>{
        const expectEventDone = eventExpecter(done)

        const client = new Client()
        const mp = mockPost()


        client.on('foo', expectEventDone, {namespace: 'foo'})
        expectEventDone.willCall('foo', 'data-1')

        client.on('foo', expectEventDone, {namespace: 'bar'})
        expectEventDone.willCall('foo', 'data-3')


        mp.post({ type: 'foo', data: 'data-1', to: { namespace: 'foo'}})
        // not emited
        mp.post({ type: 'foo', data: 'data-2', to: { namespace: 'not-exsit' } })
        mp.post({ type: 'foo', data: 'data-3', to: { namespace: 'bar'}})

        client.on('bar', expectEventDone, {namespace: 'bar', unique: 'bar'})
        expectEventDone.willCall('bar', 'data-4')

        // not emited
        mp.post({ type: 'bar', data: 'data-3', to: { namespace: 'bar'}})
        mp.post({ type: 'bar', data: 'data-4', to: { namespace: 'bar',unique: 'bar'}})

    })
    it('whenReady', (done)=>{
        const expectEventDone = eventExpecter(done)

        const client = new Client({
            unique: 'foo'
        })

        const mp = mockPost()

        client.whenReady(expectEventDone)

        expectEventDone.willCall(Events.CREATED, undefined, (payload)=>{
            expect(payload.from.unique).toBe('itsme')
        })

        mp.post({ type: Events.CREATED, from: {unique: 'itsme'}})


        client.whenReady(['any','foo', 'bar'], expectEventDone)

        expectEventDone.willCall(Events.CREATED, undefined, (payload)=>{
            expect(payload.from.unique).toBe('foo')
        })

        mp.post({ type: Events.CREATED, from: {unique: 'foo'}})
        
    })
})