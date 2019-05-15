import { ValidationError, BaseField } from './index'
import { validationErrorsMixin } from '@/mixins'
import ResourceFieldSelect from '@/components/ResourceFieldSelect.vue'
// @ts-ignore
import { OPTIONS_DEFAULT, ViewerOptions } from '@/components/ResourceViewer.vue'
import store from '@/store'
import BaseResource from '@/resources';

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
        let component = this.boundComponent
        let Ctor: typeof BaseResource = this.props.resourceClass
        let resource = new Ctor(attributes)
        let FieldSetClass = Ctor.defaultFieldSetClass
        let viewerOptions: ViewerOptions = {
            width: 480,
            height: 480,
            onSave() {
                // @ts-ignore
                component.setSelected(resource)
                this.close()
            }
        }
        
        if(FieldSetClass && component) {
            store.commit('viewResource', {
                resource,
                fieldsetClass: FieldSetClass,
                options: viewerOptions,
            })
        }
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
