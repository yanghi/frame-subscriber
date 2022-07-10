import { isObject, uid } from "./utils"

export interface BaseOptions {
    unique?: string
    namespace?: string
    origin?: string
}

export type UniqueOptions<O extends BaseOptions> = O & { unique: string }

export function uniqueOption<T extends BaseOptions>(options?: T): UniqueOptions<T> {
    return Object.assign({ unique: uid() }, options)
}

export function expect(a: BaseOptions, b: BaseOptions) {

    return uniqueExpect(a.unique, b.unique) && namespaceExpect(a.namespace, b.namespace) && originExpect(a.origin, b.origin)
}

export function namespaceExpect(a: string | undefined, b: string | undefined) {
    return a === undefined || a === b
}

export function originExpect(a: string | undefined, b: string | undefined) {
    return a === undefined || a === '*' || a === b
}

export function uniqueExpect(a: string | undefined, b: string | undefined) {
    return a === undefined || a === b
}

export function isSpecifiedBlockOptions(option?: any): option is BaseOptions {
    return option && !!(option.namespace || option.unique)
}

export function isSameSpecifiedBlockOptions(a?: BaseOptions, b?: BaseOptions): boolean {
    let result = false

    if (isObject(a) && isObject(b)) {
        ['namespace', 'unique', 'origin'].forEach(field => {
            result = a[field] === b[field]
        })
    }

    return result
}