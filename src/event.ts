class EventEmitter {
    private _fns: {
        [type in string]: EventHandler[]
    } = {

        }
    on(type: string, listener: EventHandler): EventEmitter {
        if (typeof listener === 'function') {
            const listenerList = this._fns[type] || (this._fns[type] = [])
            listenerList.push(listener)
        }

        return this
    }
    off(type: string, listener?: EventHandler): EventEmitter {
        if (typeof listener === 'function') {
            const listenerList = this._fns[type]

            if (!listenerList) return this

            let idx = listenerList.indexOf(listener)

            if (idx > -1) {
                listenerList.splice(idx, 1)
            }
        } else {
            this._fns[type] = []
        }
        return this

    }
    offAll() {
        this._fns = {}
    }
    once(type: string, listener: EventHandler): EventEmitter {

        this.on(type, listener)
            .on(type, () => {
                this.off(type, listener)
            })

        return this
    }
    emit(type: string, ...args: any[]): EventEmitter {
        const listenerList = this._fns[type]

        if (listenerList) {
            for (let index = 0; index < listenerList.length; index++) {
                const fn = listenerList[index];
                fn(...args)
            }
        }

        return this
    }
}

export type EventHandler = (...args: any[]) => void

export default EventEmitter