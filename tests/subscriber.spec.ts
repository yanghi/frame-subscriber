import Client from '../src/client'
import Subscriber from '../src/subscriber'
import { eventExpecter, mockPost } from './util'

describe('subscriber', () => {
    it('on and once', (done) => {
        const expectEventDone = eventExpecter(done)

        const mp = mockPost()

        const sub = new Subscriber({ namespace: 'cool' })

        new Client().addSubscriber(sub)


        sub.on('foo', expectEventDone)
        expectEventDone.willCall('foo', 'ha')
        mp.post({ type: 'foo', data: 'ha', to: { namespace: 'cool' } })

        const spy_1 = expectEventDone.spyDone(), spy_2 = expectEventDone.spyDone()
        sub.on('bar', spy_1)
            .on('ant', spy_2)

        // expectEventDone.willCallTimes(1)
        expectEventDone.willCall('ant')

        expectEventDone.whenAllCalled(() => {
            expect(spy_1).not.toHaveBeenCalled()
            expect(spy_2).toReturnTimes(1)
        })

        mp.post({ type: 'bar', to: { namespace: 'haha' } })
        mp.post({ type: 'ant', to: { namespace: 'cool' } })


        const spy_3 = expectEventDone.spyDone()

        sub.once('zero', spy_3)


        expectEventDone.whenAllCalled(() => {
            expect(spy_3).toReturnTimes(1)
        })

        mp.post({ type: 'zero', to: { namespace: 'cool' } })
        mp.post({ type: 'zero', to: { namespace: 'cool' } })

    })

    it('offAll', (done) => {
        const expectEventDone = eventExpecter(done)

        const mp = mockPost()

        const sub = new Subscriber({ namespace: 'cool' })

        new Client().addSubscriber(sub)

        const spy_4 = expectEventDone.spyDone(), spy_5 = expectEventDone.spyDone()

        sub.on('good', spy_4)
            .on('good', spy_5)


        sub.offAll()

        expectEventDone.whenAllCalled(() => {
            expect(spy_4).not.toHaveBeenCalled()
            expect(spy_5).not.toHaveBeenCalled()
        })

    })
    it('remove', (done) => {
        const expectEventDone = eventExpecter(done)

        const mp = mockPost()

        const sub = new Subscriber({ namespace: 'cool' })

        new Client().addSubscriber(sub)

        sub.on('foo', expectEventDone)

        sub.remove()

        mp.post({ type: 'foo', to: { namespace: 'cool' } })

        sub.on('foo', expectEventDone)

        mp.post({ type: 'foo', to: { namespace: 'cool' } })

        expectEventDone.whenAllCalled(() => {
            expect(expectEventDone).not.toHaveBeenCalled()
        })
    })
})