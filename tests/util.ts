import { Payload, Target } from '../src/payload';

export function eventExpecter(endCb: () => void) {

    let called: Payload[] = [], expected: Array<((p: Payload) => void)> = [];
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
    Object.assign(spy, done)

    return spy as typeof spy & typeof done
}


export function mockPost() {
    const iframe = document.createElement("iframe");
    document.body.appendChild(iframe);

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