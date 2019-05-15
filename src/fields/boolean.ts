import { BaseField, ValidationError } from './index'
import FieldCheckbox from '@/components/FieldCheckbox.vue'

export class BooleanField extends BaseField {
    component = FieldCheckbox

    constructor(label: string, required: boolean = false) {
        super()
        this.label = label
        this.component = FieldCheckbox.extend({
            props: {
                required: {
                    type: Boolean,
                    default: required
                }
            }
        })
    }
}
