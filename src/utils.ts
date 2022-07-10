export function uid(){
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function isEmptyObj(obj: Record<any, any>): boolean {
    for(let _k in obj){
        return false
    }

    return true;
}
export function isObject(obj: any): obj is Record<any, any> {
    return obj && typeof obj === 'object' 
}