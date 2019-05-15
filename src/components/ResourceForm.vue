<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import Resource from 'rest-resource'
import { ResourceResponse } from 'rest-resource/types/client'
import { ValidationError } from 'rest-resource/src/exceptions'
import { logDebug, logTrace } from '@/logger'
import { BaseFieldSet } from '@/fieldsets'
import { BaseField } from '@/fields'
import BaseResource from '@/resources'
const assert = require('assert')

@Component({
    components: {},
    computed: {},
    data() {
        return {
            loading: false,
            loadingFields: false,
            validationRan: false,
            fieldset: undefined,
            instances: [],
            errors: [],
        }
    },
})
export default class ResourceForm extends Vue {
    @Prop({ type: [Object, Array], required: true })
    resources: BaseResource | BaseResource[]

    @Prop({ type: Function, required: false })
    fieldsetClass: typeof BaseFieldSet

    @Prop({ type: Boolean, default: false })
    horizontal: boolean

    @Prop({ type: String, default: 'sm' })
    size: string

    @Prop({ type: String, default: 'Save' })
    submitText: string

    @Prop({ type: String, default: 'Cancel' })
    cancelText: string

    @Prop({ type: Boolean, default: true })
    buttons: boolean

    @Prop({ type: Boolean, default: true })
    save: boolean

    @Prop({ type: Boolean, default: false })
    inline: boolean

    @Prop({ type: Boolean, default: true })
    labels: boolean

    submit(): Promise<FormValidationCollection> {
        return new Promise((resolve, reject) => {
            let validation = this.validate()
            this.$data.validationRan = true
            this.$emit('submit', validation)
            logDebug('Submit Form', validation)

            if (!this.canSave()) {
                return reject(new Error(`Error submitting form: ResourceForm.canSave() is false`))
            } else if (!validation.isValid()) {
                return reject(new FormIsInvalid(validation))
            }

            if (this.$props.save) {
                logDebug('Save Form', validation)
                validation.saveAll().then(() => {
                    if (validation.isValid()) {
                        resolve(validation)
                    } else {
                        reject(new FormIsInvalid(validation))
                    }
                })
            } else {
                resolve(validation)
            }
        })
    }

    async doSubmit() {
        try {
            await this.submit()
            this.$emit('save')
            this.$emit('input', this.$data.instances)
        } catch (e) {
            this.$emit('error', e)
            if (e instanceof FormIsInvalid) {
                let forms = e.validation
                forms.forEach(form => {
                    form.errors.forEach((err: ValidationError) => {
                        this.$notify({
                            type: 'warn',
                            text: err.message,
                        })

                        if (err.field && form.fieldset[err.field]) {
                            form.fieldset[err.field].handleValidationError(err)
                        }
                    })
                })
            } else {
                throw e
            }
        }
    }

    getChangedInstances() {
        return this.$data.instances.filter((instance: BaseResource) => Object.keys(instance.changes).length > 0)
    }

    getCreatedInstances() {
        return this.$data.instances.filter((instance: BaseResource) => instance.isNew())
    }

    getFieldSetOrdered() {
        let ordered: any = {}
        for (let [field, key] of this.$data.fieldset.iterator()) {
            ordered[key] = field
        }
        return ordered
    }

    getFieldSetClass() {
        let Ctor = this.$data.instances[0].getConstructor() as typeof BaseResource
        return this.$props.fieldsetClass || Ctor.defaultFieldSetClass
    }

    onCancel() {
        this.$emit('cancel')
    }

    onReset() {
        this.$emit('reset')
    }

    onChange(instance: BaseResource, key: string, value: any) {
        instance.attributes[key] = value
        this.$emit('input', this.$data.instances)
        this.$emit('change', instance, key, value)
        logTrace('Form Change', instance.changes)
    }

    isTabular() {
        return this.$props.inline && this.$data.instances.length > 0
    }

    isLoading() {
        return this.$data.loading || this.$data.loadingFields
    }

    validate(): FormValidationCollection {
        let toSave = this.$data.instances.map((resource: BaseResource) => new FormValidation(resource, this.$data.fieldset))
        return new FormValidationCollection(toSave)
    }

    canSave() {
        return !this.isLoading()
    }

    getClasses() {
        let classes = ['resource-form-wrapper']
        if (this.$data.loading) {
            classes.push('loading')
        }

        if (this.$data.loadingFields) {
            classes.push('loading-fields')
        }

        if (this.$props.inline) {
            classes.push('inline')
        }

        if (this.$data.instances.length > 1) {
            classes.push('many')
        }

        return classes
    }

    watchChildFields() {
        // Watch all child fields -- when the number of child fields that
        //   have loading=true equals 0, set this form's loadingFields status to false, else true
        let childFields = this.$refs.childFields as Vue[]
        let childFieldsLoading = 0
        childFields.forEach((component: Vue) => {
            if ('undefined' !== typeof component.$data.loading) {
                // When the status of child's field loading data property changes...
                this.$watch(
                    () => component.$data.loading,
                    () => {
                        // Every time this field changes, we need to update the childFieldsLoading count
                        if (component.$data.loading) {
                            childFieldsLoading++
                        } else {
                            childFieldsLoading--
                        }
                        // Whenever there are no child fields loading, re set self's loadingFields data property
                        if (childFieldsLoading === 0) {
                            this.$data.loadingFields = false
                        } else {
                            this.$data.loadingFields = true
                        }
                    }
                )
            }
        })
    }

    prepareResourcesProperty() {
        let resourceArray = [].concat(this.$props.resources)
        resourceArray.forEach((instance: BaseResource) => {
            assert(instance instanceof Resource, `Unexpected instance: ${instance} is not instance of Rest Resource`)
        })

        return resourceArray
    }

    @Watch('resources')
    resourceChanges() {
        // Vue.$props.resources isn't supposed to change, but there have been cases where it does -- it's also so we can trigger it manually
        this.$data.instances = this.prepareResourcesProperty()
    }

    beforeMount() {
        this.resourceChanges()
        assert(
            this.getFieldSetClass(),
            "Couldn't find FieldSet Class. You must define `fieldsetClass` property on ResourceForm component or define a `defaultFieldSetClass` static property on Resource Class"
        )
        const FieldSetClass = this.$props.fieldsetClass
        this.$data.fieldset = new FieldSetClass()
    }

    mounted() {
        if (this.$refs.childFields) {
            this.watchChildFields()
            let childFields = this.$refs.childFields as Vue[]
            childFields.forEach(component => {
                let attrs = component.$attrs as Record<string, any>
                let field: BaseField = attrs.boundField
                field.bindComponent(component)
            })
        }
    }
}

export class FormValidationCollection extends Array {
    constructor(saves: FormValidation[]) {
        // super(saves) // TypeScript doesn't like this for some reason
        // It also doesn't like this.concat(saves)... ? Using saves.forEach...push (for now) even though it's slower
        super()
        saves.forEach(save => {
            this.push(save)
        })
    }

    isValid(): boolean {
        for (let object of this) {
            if (object.errors.length !== 0) {
                return false
            }
        }
        return true
    }

    saveAll(options?: any): Promise<FormValidationCollection> {
        let items = this
        return new Promise((resolve, reject) => {
            let promises: Promise<void>[] = []
            this.forEach((form: FormValidation) => {
                promises.push(form.save(options))
            })
            // Now save all instances
            Promise.all(promises)
                .then(() => {
                    resolve(this)
                })
                .catch(reject)
        })
    }
}

export class FormValidation {
    // This class is just to group save events because we may not always want
    //   to use the save buttons/event -- we need some way to group them
    resource: BaseResource
    fieldset: BaseFieldSet
    isNew: boolean = false
    validationRan: boolean = false
    validationErrors: any[] = []
    responsePending: boolean = true
    responseErrors: any[] = []
    response: ResourceResponse['response'] | null = null

    constructor(resource: BaseResource, fieldset: BaseFieldSet) {
        assert(resource && fieldset, `new ${this.constructor.name}(resource, fieldset) parameters not met`)
        this.resource = resource
        this.fieldset = fieldset
        this.isNew = resource.isNew()
        this.validate()
    }

    /**
     * Run Resource's save() method and keep track of response and any errors
     * @param options ResourceSaveOptions
     */
    save(options?: any) {
        return this.resource
            .save(options)
            .then((result: ResourceResponse) => {
                this.response = result.response
            })
            .catch(e => {
                this.responseErrors.push(e)
                if (e.response) {
                    this.response = e.response
                }
            })
            .finally(() => {
                this.responsePending = false
            })
    }

    /**
     * Run validations on fields and append any errors into PendingSave's error list
     */
    validate() {
        // Resource validations
        let resourceErrors = this.resource.validate()
        this.validationErrors = this.validationErrors.concat(resourceErrors)
        // Field-specific validations
        for (let fieldKey in this.fieldset) {
            let field = this.fieldset[fieldKey] as BaseField
            let value = this.resource.attributes[fieldKey]
            try {
                field.validate(value, fieldKey)
            } catch (e) {
                if (ValidationError.isInstance(e)) {
                    this.validationErrors.push(e)
                    field.handleValidationError(e)
                } else {
                    throw e
                }
            }
        }

        this.validationRan = true
    }

    get errors() {
        return this.validationErrors.concat(this.responseErrors)
    }
}

export class FormIsInvalid extends Error {
    validation: FormValidationCollection
    constructor(validation: FormValidationCollection, message: string = 'Form is invalid') {
        super(message)
        this.name = 'FormIsInvalidError'
        this.validation = validation
    }
}
</script>

<template>
<div :class="getClasses()">
    <div>
        <div class="resource-form header" v-if="isTabular()">
            <div class="form-group" v-for="(field, key) in getFieldSetOrdered()" :key="key">
                <slot :name="`header-${key}`" :field="field">
                    {{ field.label }}
                </slot>
            </div>
        </div>
        
        <b-form
            v-for="(instance, instanceKey) in instances"
            :key="instanceKey"
            @submit="doSubmit()"
            @reset="onReset"
            :inline="inline"
            autocomplete="off"
            class="resource-form">
            <b-form-group 
                v-for="(field, key) in getFieldSetOrdered()"
                :key="key"
                :label="(labels) ? field.label : ''"
                :label-for="`field-${key}-${instanceKey}`"
                :horizontal="horizontal"
                :description="field.description"
                :invalid-feedback="field.invalidText"
                :valid-feedback="field.validText"
                ref="forms">
                <slot :name="`field-${key}`" :field="field" :index="key" :resource="instance">
                    <component 
                        :is="field.component"
                        v-bind="field.props"
                        :boundField="field"
                        :value="instance.attributes[key]"
                        @input="onChange(instance, key, arguments[0])"
                        v-on="field.events"
                        ref="childFields">
                    </component>
                </slot>
            </b-form-group>
            
            <!-- Buttons -- only show if there's 1 form -->
            <slot v-if="buttons && instances.length === 1" name="buttons" :submit="submit">
                <b-button @click="doSubmit()" :disabled="!canSave()" variant="primary">{{ submitText }}</b-button>
                <b-button @click="onCancel" variant="default">{{ cancelText }}</b-button>
            </slot>
        </b-form>
    </div>

    <!-- Buttons -- at bottom if there are many forms to show -->
    <slot v-if="buttons && instances.length > 1" name="buttons" :submit="submit">
        <footer class="mt-3">
            <b-button @click="doSubmit()" :disabled="!canSave()" variant="primary">{{ submitText }}</b-button>
            <b-button @click="onCancel" variant="default">{{ cancelText }}</b-button>
        </footer>
    </slot>
</div>
</template>

<style lang="scss">
.is-invalid .form-control {
    border-color: #dc3545;
}

.resource-form-wrapper.many.inline {
    // These are just CSS changes to make a component with many instances look like a table
    width: 100%;
    display: table;

    .resource-form {
        display: table-row;
        width: 100%;
        height: 35px;
        margin-bottom: 1px;
        border-bottom: 1px solid #ccc;
    }

    .form-group {
        display: table-cell !important;
        text-align: left;
        vertical-align: middle;
        background-color: #f9f9f9;
        padding: 3px;
    }

    .form-control.is-invalid,
    .is-invalid .form-control {
        background-image: none;
        background-color: #f1b9be;
        color: #fff;
    }

    input {
        border: none;
        height: auto;
        width: 100% !important;
        margin: 0;
        padding: 0 5px;
        border-radius: 0;
        box-shadow: none !important;
        background-color: transparent;
    }

    .invalid-feedback {
        display: none !important;
    }

    .header .form-group {
        border-bottom: 1px solid #ccc;
        font-weight: bold;
    }
}
</style>
