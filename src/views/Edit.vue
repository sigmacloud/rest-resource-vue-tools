<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import ResourceForm from '@/components/ResourceForm.vue'
import ResourceFieldSelect from '@/components/ResourceFieldSelect.vue'
import { UserFieldSet } from '@/fieldsets/users'
import { mapResources } from '@/util'
import UserResource from '../resources/user'

@Component({
    components: {
        ResourceForm,
        ResourceFieldSelect,
    },
    computed: {
        ...mapResources(['todo', 'user']),
        UserFieldSet() {
            return UserFieldSet
        },
    },
    data() {
        return {
            loading: true,
            instance: undefined,
        }
    },
})
export default class EditResourceComponent extends Vue {
    getFields() {
        return {}
    }

    onSubmit(r: any) {
        console.log(r.map((p: any) => p.errors.length))
    }

    async mounted() {
        let id = this.$route.params.id
        console.log(id)
        this.$data.instance = (await UserResource.detail(id)) as UserResource
        await this.$data.instance.getRelated()
        this.$data.loading = false
    }
}
</script>

<template>
<b-container class="mt-5">
    <resource-form
        :resources="instance"
        :fieldsetClass="UserFieldSet"
        v-if="!loading"
        horizontal>
    </resource-form>
</b-container>
</template>

<style lang="scss">
</style>
