<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import BaseResource from '@/resources'

@Component({
    components: {},
    data() {
        return {
            fieldValue: null,
            options: [],
            validationErrors: [],
            showOptions: false,
            timeoutTypeaheadId: undefined,
            timeoutAutoOpenId: undefined,
            focused: false,
            loading: false,
            hasChanged: false,
            selected: null,
            toCreateValue: null,
        }
    },
})
export default class ResourceFieldSelect extends Vue {
    @Prop({})
    resourceClass: typeof BaseResource

    @Prop({ required: false, default: undefined })
    value: any

    @Prop({ type: String, required: true })
    labelKey: string

    @Prop({ type: Function, required: false })
    format: Function

    @Prop({ type: String, required: false, default: '' })
    placeholder: string | Function

    @Prop({ default: 300, type: Number })
    timeout: number

    @Prop({ default: 'md', type: String })
    size: string

    @Prop({ default: 200, type: Number })
    timeoutClose: number

    @Prop({ default: 500, type: Number })
    timeoutAutoOpen: number

    @Prop({ default: 300, type: Number })
    typeInterval: number

    @Prop({ default: false, type: Boolean })
    required: boolean

    @Prop({ default: true, type: Boolean })
    allowCreate: boolean

    @Watch('selected')
    watchSelected() {
        if (!this.$data.hasChanged) {
            return false
        }
        this.$emit('input', this.$data.selected)
        this.$emit('change', this.$data.selected)
    }

    @Watch('focused')
    watchFocus() {
        // We don't want the menu to close immediately, but after n milliseconds
        let shouldClose = !this.$data.focused

        if (shouldClose) {
            setTimeout(() => {
                this.$data.showOptions = false
            }, this.$props.timeoutClose)
        } else {
            this.$data.showOptions = true
        }
    }

    @Watch('loading')
    watchLoading() {
        this.$emit('loading', this.$data.loading)
    }

    search(): Promise<any> {
        if (!this.$data.fieldValue) {
            this.$data.selected = null
        }

        let ResourceClass: typeof BaseResource = this.$props.resourceClass
        this.$data.loading = true

        return ResourceClass.list({
            query: {
                search: this.$data.fieldValue,
            },
        }).then(result => {
            this.$data.options = result.resources.sort(this.sort.bind(this))
            this.$data.loading = false
            if (!this.$data.fieldValue && !this.$data.required) {
                this.$data.fieldValue = ''
            } else if (this.$data.hasChanged) {
                this.$data.selected = this.$data.options[0]
                setTimeout(() => {
                    if (!this.$data.focused && this.$data.selected) {
                        this.$data.fieldValue = this.resourceToLabel(this.$data.selected)
                    }
                }, this.$props.typeInterval)
            }

            if (!this.$data.selected && this.$props.allowCreate) {
                this.$data.toCreateValue = this.$data.fieldValue
            }

            return result
        })
    }

    sort(resourceA: BaseResource, resourceB: BaseResource) {
        if (this.resourceToLabel(resourceA) > this.resourceToLabel(resourceB)) {
            return 1
        } else {
            return -1
        }
    }

    onChange() {
        this.$data.hasChanged = true
        this.$data.validationErrors = []
        let typeahead = this.$refs.typeahead as HTMLInputElement
        this.$data.fieldValue = typeahead.value
        this.$data.toCreateValue = null
        // If the field value is empty, make sure fieldValue is never "undefined" because "undefined" gets cast as a string and then sent as the search query
        if (!this.$data.fieldValue) {
            this.$data.fieldValue = undefined
        }
        // Any time this field is updated, the selected field is invalidated
        this.$data.selected = null
        // Clear pending timeout because we need to start a new timeout
        clearTimeout(this.$data.timeoutTypeaheadId)
        // Set loading
        this.$data.loading = true
        // Search after user stops typing for n seconds
        this.$data.timeoutTypeaheadId = setTimeout(() => {
            this.$data.loading = false
            this.search()
        }, this.$props.timeout)
    }

    onFocus() {
        this.$data.focused = true
        if (!this.$data.fieldValue && !this.$data.timeoutAutoOpenId) {
            this.$data.timeoutAutoOpenId = setTimeout(() => {
                this.$data.timeoutAutoOpenId = undefined
                if (this.$data.focused) {
                    this.onChange()
                }
            }, this.$props.timeoutAutoOpen)
        }
        this.$emit('focus')
    }

    onBlur() {
        this.$data.focused = false
        if (this.$data.selected) {
            this.$data.fieldValue = this.resourceToLabel(this.$data.selected)
        } else if (this.$data.fieldValue) {
            this.search()
        } else {
            this.$data.fieldValue = undefined
        }

        this.$emit('blur')
    }

    onClick(resource: BaseResource) {
        this.$data.selected = resource
        this.$data.fieldValue = this.resourceToLabel(this.$data.selected)
    }

    onCreate(value: string) {
        this.$data.toCreateValue = null
        this.$data.fieldValue = null
        this.$emit('create', {
            [this.$props.labelKey]: value,
        })
    }

    beforeMount() {
        this.$nextTick().then(async () => {
            if (this.$props.value) {
                this.$data.loading = true
                this.$data.selected = await this.resourceClass.detail(this.$props.value)
                this.$data.fieldValue = this.resourceToLabel(this.$data.selected)
                this.$data.loading = false
            }
        })
    }

    getClasses() {
        let classes = ['form-control', 'resource-typeahead']

        if (this.$data.validationErrors.length > 0) {
            classes.push('is-invalid')
        }

        return classes
    }

    getFormClasses() {
        let classes = ['input-group typeahead-body']
        classes.push(`input-group-${this.$props.size}`)
        if (this.$data.showOptions && this.$data.options.length) {
            classes.push('open')
        }

        return classes
    }

    setSelected(resource: BaseResource) {
        this.$data.selected = resource
        this.$data.fieldValue = this.resourceToLabel(resource)
    }

    resourceToLabel(resource: BaseResource) {
        if ('function' === typeof this.$props.format) {
            return this.$props.format.call({}, resource, Object.create(this.$data))
        } else {
            return resource.get(this.$props.labelKey)
        }
    }
}
</script>

<template>
<div :class="getFormClasses()"> <!-- .input-group .typeahead-body -->
    <input
        type="text"
        :class="getClasses()"
        autocomplete="off"
        ref="typeahead"
        :value="fieldValue"
        :required="required"
        :placeholder="placeholder"
        @input="onChange"
        @focus="onFocus"
        @blur="onBlur" />
    <div class="typeahead-contents" v-if="(showOptions && options.length) || (allowCreate && toCreateValue && showOptions && resourceClass.defaultFieldSetClass)">
        <ul>
            <li v-for="(resource, idx) in options" :key="idx" :class="selected && resource && resource.id === selected.id ? 'selected' : ''">
                <a href="javascript:{};" @click="onClick(resource)" tabindex="-1">{{ resourceToLabel(resource) }}</a>
            </li>
            <li v-if="allowCreate && toCreateValue && showOptions && resourceClass.defaultFieldSetClass">
                <a href="javascript:{};" @click="onCreate(toCreateValue)" tabindex="-1">Create "{{ toCreateValue }}"</a>
            </li>
        </ul>
    </div>
</div>
</template>

<style lang="scss">
@import '@/assets/main.scss';

.typeahead-body {
    position: relative;

    ul {
        margin: 0;
        padding: 0;

        li {
            list-style: none;
            cursor: pointer;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            a {
                display: block;
                padding: 0.5em;
            }

            &:hover,
            &.selected {
                background: $primary;
                color: #fff;

                a {
                    text-decoration: none;
                    color: #fff;
                }
            }
        }
    }

    &.open {
        input {
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            border-bottom: 0;
        }

        .typeahead-contents {
            border-top-left-radius: 0;
            border-top-right-radius: 0;
            border-top: 0;
        }
    }

    .resource-typeahead {
        width: 100%;
        position: relative;
        z-index: 1;
    }

    .typeahead-contents {
        position: absolute;
        z-index: 100;
        top: 116%;
        left: 0;
        width: 100%;
        min-width: 250px;
        background: #fff;
        max-height: 140px;
        overflow-y: scroll;
        border-left: 1px solid $input-border-color;
        border-right: 1px solid $input-border-color;
        border-bottom: 1px solid $input-border-color;
        box-shadow: $input-focus-box-shadow;
        outline: 0;
        -webkit-animation: fadeinout 0.25s linear forwards;
        animation: fadeinout 0.25s linear forwards;
    }
}

@-webkit-keyframes fadeinout {
    0%,
    50% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

@keyframes fadeinout {
    0%,
    50% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
</style>
