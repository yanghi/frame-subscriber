import { expect as expectOption, isSameSpecifiedBlockOptions, isSpecifiedBlockOptions } from "../src/options"

describe('options', () => {
    it('expect', () => {
        expect(expectOption({}, { namespace: 'foo', origin: 'some', unique: 'bar' })).toBeTruthy()
        expect(expectOption({ namespace: 'foo' }, { namespace: 'foo', origin: 'some', unique: 'bar' })).toBeTruthy()
        expect(expectOption({ namespace: 'foo', origin: 'some' }, { namespace: 'foo', origin: 'some', unique: 'bar' })).toBeTruthy()
        expect(expectOption({ namespace: 'foo', origin: '*' }, { namespace: 'foo', origin: 'some', unique: 'bar' })).toBeTruthy()
        expect(expectOption({ namespace: 'foo', origin: '*', unique: 'bar' }, { namespace: 'foo', origin: 'some', unique: 'bar' })).toBeTruthy()

        expect(expectOption({ namespace: 'bar' }, { namespace: 'foo', origin: 'some', unique: 'bar' })).toBeFalsy()
        expect(expectOption({ namespace: 'foo', origin: 'bar' }, { namespace: 'foo', origin: 'some', unique: 'bar' })).toBeFalsy()
        expect(expectOption({ namespace: 'foo', origin: 'some', unique: 'foo' }, { namespace: 'foo', origin: 'some', unique: 'bar' })).toBeFalsy()
        expect(expectOption({ namespace: 'any', origin: '*', unique: 'any' }, { namespace: 'foo', origin: 'some', unique: 'bar' })).toBeFalsy()


    })
    it('isSameSpecifiedBlockOptions', () => {
        expect(isSameSpecifiedBlockOptions(undefined, {})).toBeFalsy()
        expect(isSameSpecifiedBlockOptions({}, {})).toBeTruthy()

        expect(isSameSpecifiedBlockOptions({ namespace: 'foo' }, { namespace: 'foo' })).toBeTruthy()
        expect(isSameSpecifiedBlockOptions({ namespace: 'foo', origin: 'any' }, { namespace: 'foo', origin: 'any' })).toBeTruthy()

        expect(isSameSpecifiedBlockOptions({ namespace: 'foo', origin: 'any' }, { namespace: 'foo' })).toBeFalsy()
        expect(isSameSpecifiedBlockOptions({ namespace: 'foo', origin: 'any', unique: 'uni' }, { namespace: 'foo', origin: 'any' })).toBeFalsy()


    })
    it('isSpecifiedBlockOptions', ()=>{
        expect(isSpecifiedBlockOptions({})).toBeFalsy()
        expect(isSpecifiedBlockOptions(undefined)).toBeFalsy()
        expect(isSpecifiedBlockOptions(null)).toBeFalsy()
        expect(isSpecifiedBlockOptions({namespace: undefined})).toBeFalsy()
        expect(isSpecifiedBlockOptions({unique: undefined})).toBeFalsy()
        expect(isSpecifiedBlockOptions({origin: 'foo'})).toBeFalsy()
        
        expect(isSpecifiedBlockOptions({unique: 'uni'})).toBeTruthy()
        expect(isSpecifiedBlockOptions({namespace: 'foo'})).toBeTruthy()

    })
})