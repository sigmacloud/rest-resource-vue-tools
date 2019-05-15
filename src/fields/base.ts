import Vue, { VueConstructor } from 'vue'

export default class BaseField {
    component: typeof Vue | VueConstructor
    boundComponent?: Vue
    label: string
    props: any = {}
    events: any = {}
    validators: Function[] = []
    invalidText: string = ''
    validText: string = ''

    /**
     * This is where you need to set your validations -- throw any errors here and set any component 
     *   properties using `this.props` to change field validity color/state
     * @param value 
     * @param key?
     */
    validate(value: string, key?: string): void {
        // Raise exceptions here...
    }

    handleValidationError(exception?: Error): void {
        // This only works if this component is using the validationErrorsMixin
        if(this.boundComponent && 'undefined' !== typeof this.boundComponent.$data.validationErrors) {
            this.boundComponent.$data.validationErrors.push(exception)
        } else {
            throw exception
        }
    }

    bindComponent<V extends Vue>(component: V) {
        this.boundComponent = component
    }
}
