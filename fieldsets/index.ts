import Resource from 'rest-resource/src'
import BaseField from '@/fields/base'

export class BaseFieldSet {
    static ordering: string[] = []
    constructor(resource?: Resource) {}
    
    /**
     * Generator to allow easy iteration over fields except in order as defined
     *   on static member BaseFieldSet.ordering
     */
    *iterator(): IterableIterator<[BaseField, string]> {
        let FieldSetCtor = this.constructor as typeof BaseFieldSet

        for(let orderedKey of FieldSetCtor.ordering) {
            yield [this[orderedKey], orderedKey]
        }

        for(let key in this) {
            if(~FieldSetCtor.ordering.indexOf(key)) {
                continue
            }

            yield [this[key], key]
        }
    }
}

export class AutoFieldSet extends BaseFieldSet {}

export interface BaseFieldSet {
    [index:string]: BaseField | any
}
