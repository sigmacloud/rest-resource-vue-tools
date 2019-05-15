<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import BaseResource from '@/resources'
import ResourceForm from '@/components/ResourceForm.vue'
import { BaseFieldSet } from '@/fieldsets'

export interface ViewerOptions {
    onSave?: (this: ViewerItem, resource: BaseResource) => void
    onError?: (this: ViewerItem, err: Error, resource: BaseResource) => void
    onClose?: (this: ViewerItem, resource: BaseResource) => void
    minimized?: boolean
    width?: number
    height?: number
    spacing?: number
    saving?: boolean
}

export interface ViewerItem {
    resource: BaseResource
    options: ViewerOptions
    fieldsetClass: typeof BaseFieldSet
    close(): void
}

export const OPTIONS_DEFAULT: ViewerOptions = {
    minimized: false,
    width: 350,
    height: 450,
    spacing: 10,
    saving: false,
}

@Component({
    components: {
        ResourceForm,
    },
    data() {
        return {
            spanningWidth: 0,
            views: [],
            defaults: <ViewerOptions>{
                minimized: false,
                width: 350,
                height: 450,
                spacing: 10,
                saving: false,
            },
        }
    },
})
export default class ResourceViewer extends Vue {
    getResources() {
        return this.getResourceOpts().map((dict: any) => dict.resource)
    }

    getResourceOpts() {
        return this.$store.getters.viewingResources
    }

    remove(item: ViewerItem) {
        this.$store.commit('viewerRemoveItem', item)
    }

    save(resource: BaseResource) {
        let item = this.getItemByResource(resource)
        item.options.saving = true
        resource
            .save()
            .then(() => {
                if ('object' === typeof item.options && 'function' === typeof item.options.onSave) {
                    item.options.onSave.call(item, resource)
                }
            })
            .catch(e => {
                if ('object' === typeof item.options && 'function' === typeof item.options.onError) {
                    item.options.onError.call(item, e, resource)
                }
            })
            .finally(() => {
                item.options.saving = false
            })
    }

    getItemByResource(resource: BaseResource): ViewerItem {
        let allOpts = this.$store.getters.viewingResources
        for (let optIndex in allOpts) {
            let opts: ViewerItem = allOpts[optIndex]
            if (opts.resource === resource) {
                return opts
            }
        }

        throw new TypeError('Expected resource to be registered in viewer')
    }

    getStyle(index: number, viewer: ViewerItem) {
        let right = viewer.options.spacing + index * viewer.options.width
        if (index > 0) {
            right += viewer.options.spacing * index
        }

        return {
            right: `${right}px`,
            width: `${viewer.options.width}px`,
            height: `${viewer.options.height}px`,
        }
    }

    beforeMount() {
        this.$data.views = this.getResourceOpts()
    }
}
</script>

<template>
  <div class="viewer-pane">
      <div class="card resource-viewer" v-for="(item, idx) in views" :key="idx" :style="getStyle(idx, item)">
        <header class="card-header">
            <h6 class="mb-0">{{ item.resource.toString() }}</h6>
        </header>
        <div class="card-body">
            <resource-form
                :resources="item.resource"
                :fieldsetClass="item.fieldsetClass"
                :buttons="false"
                :horizontal="true">
            </resource-form>
        </div>
        <footer class="card-footer">
            <em><button type="button" class="btn btn-primary btn-sm" @click="save(item.resource)" :disabled="item.options.saving">Save</button>
            <button type="button" class="btn btn-link btn-sm" @click="remove(item)">Close</button></em>
        </footer>
    </div>
</div>
</template>

<style lang="scss">
.viewer-pane {
    // position: fixed !important;
    // bottom: 0;
    right: 5px;

    .card.resource-viewer {
        border-bottom: 0;
        box-shadow: 1px 0px 3px #eee;
        width: 350px;
        vertical-align: bottom !important;
        position: fixed;
        bottom: 0;
        right: 0;
        z-index: 1000;

        .card-body {
            overflow: scroll;
        }
    }
}
</style>
