import Vue from 'vue'
import { BaseField, ValidationError } from './index'
import FieldInput from '@/components/FieldInput.vue'

export class InputField extends BaseField {
    component = FieldInput

    constructor(label: string, required: boolean = false) {
        super()
        this.label = label
        this.component = FieldInput.extend({
            props: {
                required: {
                    type: Boolean,
                    default: required
                }
            }
        })
    }
}

export class InputRequiredField extends InputField {
    constructor(label: string) {
        super(label, true)
    }

    validate(value: any, key: string = undefined) {
        let isValid = !!value
        if(!isValid) {
            throw new ValidationError(key, this.invalidText)
        }
    }
}
