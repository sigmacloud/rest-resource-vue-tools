<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import App from '../App.vue'
import ResourceList, { ListAction } from '@/components/ResourceList.vue'
import UserResource from '@/resources/user'
import { UserFieldSet } from '@/fieldsets/users'
import { OPTIONS_DEFAULT } from '@/components/ResourceViewer.vue'
import { mapResources } from '@/util'

@Component({
    components: {
        'resource-list': ResourceList,
    },
    computed: {
        ...mapResources(['user']),
        UserFieldSet() {
            return UserFieldSet
        },
    },
    data() {
        return {}
    },
})
export default class UsersComponent extends Vue {
    getFields() {
        return {
            name: {
                label: 'Name',
                linked: true,
                render: (val: any) => val,
            },
            username: 'Username',
            email: 'Email',
            phone: 'Phone',
            website: 'Website',
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

    async logItem(resource: UserResource) {
        await resource.getRelatedDeep()
        this.$store.commit('viewResource', {
            resource,
            fieldsetClass: UserFieldSet,
            options: OPTIONS_DEFAULT,
        })
        // @ts-ignore
        window['resource'] = resource
        //let ledger: LedgerResource = await LedgerResource.detail('1')
    }
}

export class CustomAction extends ListAction {
    constructor() {
        super('Log Items')
    }

    handler(resources: any) {
        console.log(resources)
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
                :resourceClass="UserResource"
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
