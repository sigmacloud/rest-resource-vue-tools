import { InputField } from './input'
import moment from 'moment'

export class DateField extends InputField {
    dateFormat: string = 'YYYY-MM-DD'

    constructor(label: string, required: boolean = false) {
        super(label, required)
        this.props = {
            formatter: this.format.bind(this),
            'lazy-formatter': true,
            ...this.props,
        }
    }

    format(value: string, event: any) {
        let date = moment(value)
        if(date.isValid()) {
            return date.format(this.dateFormat)
        } else {
            return moment().format(this.dateFormat)
        }
    }
}
