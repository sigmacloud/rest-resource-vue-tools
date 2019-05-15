import { ValidationError, BaseField } from './index'
import { validationErrorsMixin } from '../mixins'
// @ts-ignore
import ResourceFieldSelect from '../components/ResourceFieldSelect.vue'
// @ts-ignore
import { OPTIONS_DEFAULT, ViewerOptions } from '@/components/ResourceViewer.vue'
import BaseResource from 'rest-resource';

export interface SelectResourceOptions {
    required?: boolean,
    viewerOptions?: ViewerOptions
    allowCreate?: boolean
}

export class SelectResource extends BaseField {
    component = ResourceFieldSelect.extend({
        mixins: [validationErrorsMixin]
    })
 
    constructor(label: string, labelKey: string | Function, resourceClass: typeof BaseResource, { required = false, viewerOptions = OPTIONS_DEFAULT, allowCreate = false }: SelectResourceOptions = {}) {
        super()
        this.label = label
        this.props = {
            labelKey: labelKey, 
            resourceClass,
            viewerOptions,
            allowCreate,
            required,
            ...this.props,
        }

        this.events.input = this.onSelect.bind(this)
        
        if(allowCreate) {
            this.events.create = this.onCreate.bind(this)
        }
    }

    validate(value: string, key: string = undefined) {
        if(!value && this.props.required) {
            throw new ValidationError(key)
        }
    }

    onSelect(resource: BaseResource) {
        // Do nothing for now
    }

    onCreate(attributes: any) {
        // Do nothing for now
    }
}

// @sigma-only
export class SelectResourceCoded extends SelectResource {
    constructor(label: string, resourceClass: typeof BaseResource, { required = false, viewerOptions = OPTIONS_DEFAULT }: SelectResourceOptions = {}) {
        super(label, 'code', resourceClass, { required })
        this.props.format = this.format
    }

    format(resource: BaseResource, state: any) {
        if(state.focused) {
            return `${resource.get('code')} - ${resource.get('name')}`
        }
        return resource.get('code')
    }
}
