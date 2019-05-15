import { InputField } from './input'

export class NumberField extends InputField {
    constructor(label: string, required: boolean = false) {
        super(label, required)
        this.props = {
            formatter: this.format.bind(this),
            'lazy-formatter': true,
            ...this.props,
        }
    }

    format(value: string, event: any) {
        return Number(value.replace(/[^\d.-]/g, '')).toFixed(2)
    }
}

export class AmountField extends NumberField {
    constructor(label: string, required: boolean = false) {
        super(label, required)
        this.props = {
            style: 'text-align: right',
            ...this.props,
        }
    }
}
