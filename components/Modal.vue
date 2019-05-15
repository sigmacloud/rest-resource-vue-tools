<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

@Component({
    components: {},
    data() {
        return {}
    },
})
export default class Modal extends Vue {
    @Prop({ type: String, default: undefined })
    title: string

    @Prop({ type: String, default: 'md' })
    size: string

    getModalRef() {
        return this.$refs.modal as Modal
    }

    show() {
        this.getModalRef().show()
    }

    hide() {
        this.getModalRef().hide()
    }

    submit() {
        this.$emit('submit')
    }
}
</script>

<template>
<b-modal
    no-fade
    ref="modal"
    :size="size">
    <template slot="modal-header">
        <slot name="modal-header">
            <h5 class="modal-title">{{ title }}</h5>
            <button type="button" aria-label="Close" class="close" @click="hide()">&times;</button>
        </slot>
    </template>
    <template slot="modal-footer">
        <slot name="modal-footer">
            <button type="button" class="btn btn-default" @click="hide()">Cancel</button>
            <button type="button" class="btn btn-primary" @click="submit()">Submit</button>
        </slot>
    </template>
    <slot>
    </slot>
</b-modal>
</template>

<style lang="scss">
</style>
