<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { getConfig } from '../config'
import Loading from '@/components/Loading.vue'

@Component({
    components: {
        Loading,
    },
    data() {
        return {
            selectedClientHostname: '',
            customClientHostname: 'https://',
            selectedInstanceUsername: '',
            selectedInstancePassword: '',
            loading: false,
            error: false,
            clients: [],
        }
    },
})
export default class LoginForm extends Vue {
    @Prop({ type: Boolean, default: false })
    adding: boolean

    @Prop({ type: Boolean, default: true })
    showSubmit: boolean

    async submit() {
        try {
            if (!this.isValid()) {
                throw new Error()
            }

            this.$data.loading = true
            let hostname = this.$data.customClientHostname && this.$data.customClientHostname !== 'https://' ? this.$data.customClientHostname : this.$data.selectedClientHostname
            this.$store.commit('addClientAndSelect', { hostname })
            let response = await this.$store.getters.client.post(getConfig('GET_TOKEN_PATH'), {
                username: this.$data.selectedInstanceUsername,
                password: this.$data.selectedInstancePassword,
            })

            this.$store.commit('addClientAndSelect', {
                hostname,
                token: response.data.token,
            })

            this.$emit('success')
        } catch (e) {
            this.$data.error = true
        } finally {
            this.$data.loading = false
        }
    }

    @Watch('selectedInstanceUsername')
    @Watch('selectedInstancePassword')
    resetError() {
        this.$data.error = false
    }

    onSubmit(e: any) {
        e.preventDefault()
        this.submit()
    }

    isValid() {
        return (
            (!!this.$data.selectedClientHostname || (!!this.$data.customClientHostname && this.$data.customClientHostname !== 'https://')) &&
            !!this.$data.selectedInstanceUsername &&
            !!this.$data.selectedInstancePassword
        )
    }

    getClass() {
        let classes = ['login-form']
        if (this.$data.loading) {
            classes.push('loading')
        }
        return classes
    }

    beforeMount() {
        let client = this.$store.getters.client

        if (!this.$props.adding && client) {
            this.$data.selectedClientHostname = client.hostname
        }

        this.$data.clients = this.$store.getters.clients
    }
}
</script>

<template>
<form :class="getClass()" @submit="onSubmit">
    <div class="form-group row">
        <label class="col-sm-3 col-form-label">Instance</label>
        <div class="col-sm-9">
            <select class="form-control" v-model="selectedClientHostname">
                <optgroup label="Recently Used">
                    <option
                        v-for="(clientObj, i) in clients"
                        :key="i"
                        :value="clientObj.hostname">
                        {{ clientObj.hostname }}
                    </option>
                </optgroup>
                <option value="">Add a New Instance</option>
            </select>
        </div>
    </div>
    <div class="form-group row" v-if="!selectedClientHostname">
        <label class="col-sm-3 col-form-label">URL</label>
        <div class="col-sm-9">
            <input type="text" class="form-control" v-model="customClientHostname">
        </div>
    </div>
    <div class="form-group row">
        <label class="col-sm-3 col-form-label">Username</label>
        <div class="col-sm-9">
            <input type="text" class="form-control" v-model="selectedInstanceUsername">
        </div>
    </div>
    <div class="form-group row">
        <label class="col-sm-3 col-form-label">Password</label>
        <div class="col-sm-9">
            <input type="password" class="form-control" v-model="selectedInstancePassword">
        </div>
    </div>
    <slot name="error-message" v-if="error">
        <div class="alert alert-danger">
            Couldn't log you in with those credentials, please try again.
        </div>
    </slot>
    <slot name="submit" v-if="showSubmit">
        <button type="submit" class="btn btn-primary" @click="submit()">Submit</button>
    </slot>
    <input type="submit" class="submitHidden" />
    <loading v-if="loading" />
</form>
</template>

<style lang="scss" scoped>
form.loading {
    opacity: 0.5;
}

.submitHidden {
    visibility: hidden;
    position: absolute;
    height: 0px;
    width: 0px;
    left: -9999px;
}
</style>
