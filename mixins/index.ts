import Vue from 'vue'
export const FormInputComponent = require('bootstrap-vue/es/components/form-input/form-input').default

/**
 * This is a useful mixin when working with certain components in Bootstrap-Vue that support "contextual states"
 * An example of this would be the FormInput component:
 * @url https://bootstrap-vue.js.org/docs/components/form-input#contextual-states
 * This mixin simply overrides the default stateClass behavior and only returns is-invalid if we change the $data.hasValidationError to true
 */
export const validationErrorsMixin = {
    data: function() {
        return {
            validationErrors: new Array()
        }
    },
    methods: {
        onInput: function(this: Vue, ...args: any[]) {
            // Call to original onInput
            FormInputComponent.methods.onInput.apply(this, args)
            // Now just reset validationErrors
            this.$data.validationErrors = []
        }
    },
    computed: {
        // We're overriding the default stateClass mixin here -- we just simply want to check if hasValidationError is true
        stateClass: function(this: Vue) {
            if(this.$data.validationErrors.length > 0) {
                return 'is-invalid'
            }
        }
    }
}