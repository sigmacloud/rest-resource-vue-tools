<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import App from '../App.vue'
import ResourceList, { ListAction } from '@/components/ResourceList.vue'
import TodoResource from '@/resources/todo'
import { TodoFieldSet } from '@/fieldsets/todos'
import { OPTIONS_DEFAULT } from '@/components/ResourceViewer.vue'
import { mapResources } from '@/util'

@Component({
    components: {
        'resource-list': ResourceList,
    },
    computed: {
        ...mapResources(['todo']),
    },
    data() {
        return {
            resource: undefined,
            selectedTab: 0,
        }
    },
})
export default class HomeComponent extends Vue {
    getFields() {
        return {
            title: {
                label: 'Task Title',
                link: (resource: TodoResource) => '/todos/' + resource.id,
                render: (val: any) => val,
            },
            'userId.name': 'User',
            completed: {
                label: 'Completed',
                render: (val: any) => (val ? 'Yes' : 'No'),
            },
        }
    }

    getActions() {
        return [new CustomAction()]
    }

    getSelectedResource() {
        return this.$data.resource
    }

    switchTabs(tabIndex: number) {
        this.$data.selectedTab = tabIndex
    }

    beforeMount() {
        // @ts-ignore
        window['store'] = this.$store
    }

    async logItem(resource: TodoResource) {
        await resource.getRelatedDeep()
        this.$store.commit('viewResource', {
            resource,
            fieldsetClass: TodoFieldSet,
            options: OPTIONS_DEFAULT,
        })
        // @ts-ignore
        window['resource'] = resource
        //let ledger: LedgerResource = await LedgerResource.detail('1')
    }
}

export class CustomAction extends ListAction {
    constructor() {
        super('Mark as Completed')
    }

    handler(resources: any) {
        resources.forEach((resource: TodoResource) => {
            resource.set('completed', true)
            resource.save()
        })
    }

    isValid(resources: any) {
        for (let resource of resources) {
            if (resource.get('status') === 'AUDITED') {
                return false
            }
        }

        return true
    }
}
</script>

<template>
<b-container class="content" fluid>
    <b-row>
        <b-col>
            <resource-list
                class="table-sm mt-4 table-striped table-hover"
                :resourceClass="TodoResource"
                :fields="getFields()"
                :actions="getActions()"
                @onClick="logItem">
            </resource-list>
        </b-col>
    </b-row>
</b-container>
</template>

<style scoped>
.content h1 {
    text-align: center;
}
</style>
