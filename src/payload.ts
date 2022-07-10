
export interface Target {
    unique?: string
    namespace?: string
    origin?: string
}

export interface FromTarget {
    unique: string
    namespace?: string
    origin: string
}

export interface Payload<T = any> {
    from: FromTarget
    to?: Target
    data: T
    type: string
    /**
     * @internal
     */
    __: true
}

export function isPayload(data: any): data is Payload {
    return data && typeof data === 'object' && data.__ === true
}