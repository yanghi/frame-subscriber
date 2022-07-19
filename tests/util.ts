import { Payload, Target } from '../src/payload';

export function eventExpecter(endCb: () => void) {

    let called: Payload[] = [], expected: Array<((p: Payload) => void)> = [], endCbs: Array<((p: Payload[]) => void)> = [];
    let flag = 0

    let spy = jest.fn()

    function done(payload: Payload) {

        let cb = expected[flag]

        called.push(payload)


        if (cb) {
            cb(payload);

        }
        if (flag === expected.length - 1) {
            endCb()
            endCbs.forEach(fn => {
                fn(called)
            })
        }
        flag++

    }

    spy.mockImplementation(done)


    done.willCall = (type: string, data?: string, cb?: ((p: Payload, spyFn: jest.Mock<any, any>) => void)) => {
        expected.push((p) => {
            expect(type).toBe(p.type)

            if (data !== undefined) {

                expect(p.data).toBe(data)
            }

            cb && cb(p, spy)
        })
    }
    done.willCallAny = () => {
        expected.push(() => { })
    }
    done.spyDone = (fn?: ((...args: any[]) => any)) => {
        let mock = jest.fn()

        let run = (p) => {
            done(p)
            fn && fn(p)
        }
        mock.mockImplementation(run)

        return mock
    }

    done.willCallTimes = (time: number, cb?: (called: Payload[]) => void) => {

        let start = expected.length, end = start + time

        for (let i = 0; i < time - 1; i++) {
            done.willCallAny()
        }
        expected.push(() => {
            cb && cb(called.slice(start, end))
        })

    }

    done.whenAllCalled = (cb: (called: Payload[]) => void) => {
        endCbs.push(cb)
    }

    Object.assign(spy, done)

    return spy as typeof spy & typeof done
}


export function mockPost() {

    const top = window

    return {
        post(payload: {
            type: string,
            to?: Target
            data?: string
            from?: Target
        }) {

            let from = {
                uid: Symbol(),
                unique: Symbol(),
                ...payload.from
            }
            top.postMessage({
                __: true,
                ...payload,
                from
            }, '*')
        },
        postOrigin(data: any, origin?: string) {
            top.postMessage(data, origin || '*')

        }
    }
}