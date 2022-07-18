
export interface Target {
    unique?: string
    namespace?: string
    origin?: string
}

export interface FromTarget {
    /**
     * Automatic generated
     */
    uid: string
    unique?: string
    namespace?: string
    origin: string
}

export interface Payload<T = any> {
    from: FromTarget
    to?: Target
    data: T
    type: string
}

export interface InternalPayload<T = any> extends Payload<T> {
    __: true
}

export function isPayload(data: any): data is Payload {
    return data && typeof data === 'object' && data.__ === true
}