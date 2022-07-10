import EventEmitter from "../src/event";

describe("EventEmitter", () => {

    it("emit", () => {
        const event = new EventEmitter();

        const spy = jest.fn()

        event.on('test', spy)

        event.emit('test', 'foo', 'bar')

        expect(spy).toHaveBeenCalledTimes(1)
        // expect(spy.mock.calls[0])
        expect(spy).lastCalledWith('foo', 'bar')
    })
    it('off', () => {
        const event = new EventEmitter();

        const spy = jest.fn(), spy_1 = jest.fn()

        event.on('test', spy).on('test', spy_1)

        event.emit('test')
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy_1).toHaveBeenCalledTimes(1)


        event.off('test', spy)

        event.emit('test')
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy_1).toHaveBeenCalledTimes(2)

        // off(type)
        const spy_2 = jest.fn(), spy_3 = jest.fn()

        event.on('test', spy_2)
        event.on('test', spy_3)

        event.emit('test')
        expect(spy_2).toHaveBeenCalledTimes(1)
        expect(spy_3).toHaveBeenCalledTimes(1)

        event.off('test')
        event.emit('test')
        expect(spy_2).toHaveBeenCalledTimes(1)
        expect(spy_3).toHaveBeenCalledTimes(1)
    })
    it('once', () => {
        const event = new EventEmitter();
        const spy = jest.fn()

        event.once('test', spy)
        event.emit('test')
        event.emit('test')
        expect(spy).toHaveBeenCalledTimes(1)

    })

    it('offAll', () => {
        const event = new EventEmitter();

        const spy = jest.fn(), spy_1 = jest.fn(), spy_2 = jest.fn()

        event.on('test', spy).on('test', spy_1).on('foo', spy_2)

        event.emit('test').emit('foo')
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy_1).toHaveBeenCalledTimes(1)
        expect(spy_2).toHaveBeenCalledTimes(1)

        event.offAll()

        event.emit('test').emit('foo')
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy_1).toHaveBeenCalledTimes(1)
        expect(spy_2).toHaveBeenCalledTimes(1)
    })
})