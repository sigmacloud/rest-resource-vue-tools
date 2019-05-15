<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import Resource from 'rest-resource'
import { ResourceLike, ResourceClassLike, ResourceClassDict } from 'rest-resource/types'
import LoadingCells from './LoadingCells.vue'
import Loading from './Loading.vue'
const { uniqBy } = require('lodash')
const assert = require('assert')

@Component({
    components: {
        LoadingCells,
        Loading,
    },
    data() {
        return {
            loading: true,
            loadedInitial: false,
            resources: [],
            selected: [],
            selectedAction: undefined,
            page: 1,
            pages: 1,
            perPage: undefined,
            totalResources: undefined,
            queryObj: {},
        }
    },
})
export default class ResourceList extends Vue {
    @Prop({ type: Function, required: true })
    resourceClass: ResourceClassLike

    @Prop({ type: Object, required: true })
    fields: any[]

    @Prop({ type: Boolean, default: false })
    renewResourceOnClick: boolean

    @Prop({ type: Array, default: () => new Array() })
    actions?: ListAction[]

    @Prop({ type: Array })
    links: string[]

    @Prop({ type: Boolean, default: false })
    deep?: boolean

    @Prop({ type: Object, default: () => {} })
    query?: any

    @Prop({ type: Boolean, default: false })
    deselectAfterAction?: boolean

    getFields() {
        return this.$props.fields
    }

    onClick(item: any) {
        if (this.$props.renewResourceOnClick) {
            const ResourceClass: ResourceClassLike = this.$props.resourceClass
            ResourceClass.detail(item.id).then((cachedResource: ResourceLike) => {
                this.$emit('onClick', cachedResource)
                this.$emit('onSelect', cachedResource)
            })
        } else {
            let resource = this.$data.resources.find((resourceItem: ResourceLike) => String(resourceItem.id) === String(item.id))
            this.$emit('onClick', resource)
            this.$emit('onSelect', resource)
        }
    }

    onActionFormSubmit(e: Event) {
        e.preventDefault()
        let action: ListAction = this.$data.selectedAction
        if (action && this.$data.selected.length > 0) {
            // Run the action handler
            action.handler(this.$data.selected)
            // Appearance-wise, it's just nicer to show what action was selected for a second
            setTimeout(() => this.resetActions(action.reset), 1000)
        } else if (action) {
            throw new Error(`Can't run action "${action.name}": no resources were selected`)
        } else {
            throw new Error('Action criteria is invalid!')
        }
    }

    selectAll() {
        this.$data.selected = uniqBy(this.$data.selected.concat(this.$data.resources), (resource: ResourceLike) => resource.id)
    }

    resetActions(clearSelected: boolean = true) {
        this.$data.selectedAction = undefined
        if (clearSelected) {
            this.$data.selected = []
        }
    }

    getField(resource: ResourceLike, key: string) {
        try {
            return resource.get(key)
        } catch (e) {
            return ''
        }
    }

    getResourceClass() {
        const ResourceClass: ResourceClassLike = this.$props.resourceClass
        assert(ResourceClass.prototype instanceof Resource, `Component resource property must be instance of ${Resource.name} class`)
        return ResourceClass
    }

    pageChange(page: number) {
        this.$data.queryObj.page = page
        return this.fetch()
    }

    fetch() {
        this.$data.loading = true

        let listOpts = {
            query: this.$data.queryObj,
        }

        return this.getResourceClass()
            .list(listOpts)
            .then(result => {
                const promises: Promise<any>[] = []
                result.resources.forEach((resource: Resource) => {
                    for (const key in this.$props.fields) {
                        promises.push(resource.getAsync(key))
                    }
                })
                return Promise.all(promises).then(() => result)
            })
            .then(result => {
                this.$data.loading = false
                this.$data.resources = result.resources
                this.$data.page = result.currentPage()
                this.$data.pages = result.pages()
                this.$data.perPage = result.perPage()
                this.$data.totalResources = result.count()
            })
    }

    getClasses() {
        let classes = ['table', 'table-resource-list', 'table-striped', 'table-sm']
        if (this.$data.loading) {
            classes.push('loading')
        }
        return classes
    }

    beforeMount() {
        this.$data.queryObj = this.$props.query || {}
        this.fetch().then(() => {
            this.$data.loadedInitial = true
        })
    }
}

export class ListAction {
    name: string
    reset: boolean
    handlerFn: (resources: ResourceLike[]) => void

    constructor(name: string, options: { reset?: boolean; handler?: (resources: ResourceLike[]) => void } = {}) {
        this.name = name
        this.handlerFn = options.handler || function() {}
        this.reset = !!options.reset
    }

    handler(resources: ResourceLike[]): void {
        if (this.isValid(resources)) {
            this.handlerFn.call(this, resources)
        }
    }

    isValid(resources: ResourceLike[]) {
        return resources.length > 0
    }

    toString() {
        return this.name
    }
}
</script>

<template>
<div class="resource-table-wrapper">
    <!-- <b-row align-h="end" class="mb-3">
        <b-col cols="auto">
            
        </b-col>
    </b-row> -->
    <table :class="getClasses()" v-if="loadedInitial">
        <tr>
            <th v-if="actions.length > 0" width="10">&nbsp;</th>
            <th v-for="(title, key) in fields" :key="key">
                <span v-if="'object' === typeof title">
                    {{ title.label }}
                </span>
                <span v-else>
                    {{ title }}
                </span>
            </th>
        </tr>
        <tbody>
            <tr v-for="(resource, i) in resources" :key="i" :class="Object.keys(resource.changes).length ? 'pending' : ''">
                <td v-if="actions.length > 0">
                    <input type="checkbox" v-model="selected" :value="resource" />
                </td>
                <td v-for="(field, key) in fields" :key="key">
                    <span v-if="'object' === typeof field">
                        <a v-if="field.link" :href="field.link(resource)" @click.stop.prevent="onClick(resource)">{{ field.render(resource.get(key)) }}</a>
                        <span v-else>{{ field.render(getField(resource, key)) }}</span>
                    </span>
                    <span v-else>
                        {{ getField(resource, key) }}
                    </span>
                </td>
            </tr>
        </tbody>
    </table>

    <loading-cells v-else :rows="20" :cols="8" />

    <div class="with-selected" v-if="actions.length > 0 && loadedInitial">
        <form class="form-inline" @submit="onActionFormSubmit" v-if="selected.length > 0">
            <select v-if="actions.length > 0" v-model="selectedAction" class="form-control form-control-sm mr-2 col-md-3 col-lg-6">
                <option :value="undefined" disabled>With Selected ({{ (selected.length === 1) ? `${selected.length} item` : `${selected.length} items` }})</option>
                <option
                    v-for="(action, i) in actions"
                    :value="action"
                    :key="i"
                    :disabled="!action.isValid(selected)">
                    {{ action.name }}
                </option>
            </select>
            <div class="btn-group" role="group" aria-label="Basic example">
                <input type="submit" class="btn btn-primary btn-sm" value="Go" :disabled="!selectedAction" />
                <input type="button" @click="selectAll()" class="btn btn-light btn-sm" value="Select All" />
                <input type="button" @click="resetActions()" class="btn btn-light btn-sm" value="Reset" />
            </div>
        </form>
        <div v-else class="btn-group" role="group" aria-label="Basic example">
            <input type="button" @click="selectAll()" class="btn btn-light btn-sm" value="Select All" />
        </div>
    </div>

    <loading v-if="loading" />

    <b-pagination
        v-if="pages > 1"
        :disabled="loading"
        :total-rows="totalResources"
        :per-page="perPage"
        @change="pageChange"
        :hide-ellipsis="true"
        size="sm"
        next-text="Next"
        prev-text="Prev"
        align="center"
        class="mt-3" />
    <p v-else>&nbsp;</p>
</div>
</template>

<style lang="scss" scoped>
.resource-table-wrapper {
    position: relative;

    .with-selected {
        position: absolute;
        left: 0;
        bottom: 0px;

        select {
            width: 400px;
        }
    }
}
.table-resource-list tr {
    transition: background-color 0.25s ease-out;
}
.table-resource-list tr.pending {
    background-color: #fffbe5 !important;
    border-color: #fef4c2 !important;
}
.table-resource-list.loading {
    opacity: 0.5;
}
</style>
