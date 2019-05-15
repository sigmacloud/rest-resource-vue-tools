<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { getConfig } from '@/config'
import { hostnameToName } from '@/util'
import Modal from '@/components/Modal.vue'
import LoginForm from '@/components/LoginForm.vue'

const makeLink = (name: any, path: any) => ({ name, path })

@Component({
    components: {
        Modal,
        LoginForm,
    },
    data() {
        return {
            clients: [],
            selectedClientHostname: undefined,
        }
    },
})
export default class NavbarComponent extends Vue {
    object: { default: string } = { default: 'Default object property!' }

    connectTo(clientObj: any) {
        this.$store.commit('setClient', clientObj.hostname)
        this.goToHome()
    }

    getLoginModal() {
        return <Modal>this.$refs.addNewInstance
    }

    addNewInstance() {
        this.getLoginModal().show()
    }

    login() {
        let loginForm = <LoginForm>this.$refs.loginForm
        loginForm.submit()
    }

    logout(hostname: string) {
        this.$store.commit('addClient', { hostname: hostname, token: undefined })
        this.$router.push('/login')
    }

    hostnameToName(hostname: string) {
        return hostnameToName(hostname)
    }

    goToHome() {
        // Actually reload the app (don't use router push here)
        window.location.pathname = getConfig('HOME_ROUTE')
    }

    onLoggedIn() {
        this.getLoginModal().hide()
        this.goToHome()
    }

    beforeMount() {
        this.$data.clients = this.$store.getters.clients
        this.$data.selectedClientHostname = this.$store.getters.client.hostname
    }
}
</script>

<template>
<div>
    <b-navbar toggleable="md" type="dark" variant="dark" fixed="top">
        <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
        <b-navbar-brand href="#">Demo App</b-navbar-brand>
        <b-collapse is-nav id="nav_collapse">
            <b-navbar-nav>
                <b-nav-item-dropdown text="Component Examples" to="/" no-caret>
                    <b-dropdown-item to="/">Todos</b-dropdown-item>
                    <b-dropdown-item to="/users">Users</b-dropdown-item>
                    <b-dropdown-item to="/users/1">Edit a User</b-dropdown-item>
                    <b-dropdown-item to="/about">Static Page</b-dropdown-item>
                    <b-dropdown-divider></b-dropdown-divider>
                    <b-dropdown-item to="/about">Other Dropdown</b-dropdown-item>
                </b-nav-item-dropdown>
                <b-nav-item-dropdown text="Settings" no-caret>
                    <b-dropdown-item @click="addNewInstance()">Connect to New Instance</b-dropdown-item>
                    <b-dropdown-divider></b-dropdown-divider>
                    <b-dropdown-header>App Instances</b-dropdown-header>
                    <b-dropdown-item v-for="(client, i) in clients" :key="i" @click="connectTo(client)">
                        <span v-if="client.hostname == selectedClientHostname" class="checkmark">&check;</span> {{ hostnameToName(client.hostname) }}
                    </b-dropdown-item>
                    <b-dropdown-divider></b-dropdown-divider>
                    <b-dropdown-item @click="logout(selectedClientHostname)">Log out of {{ hostnameToName(selectedClientHostname) }} </b-dropdown-item>
                    <b-dropdown-divider></b-dropdown-divider>
                    <b-dropdown-item @click="goToHome()">Reload App</b-dropdown-item>
                </b-nav-item-dropdown>
            </b-navbar-nav>
        </b-collapse>
    </b-navbar>
    <modal ref="addNewInstance" title="Connect to a New Instance" @submit="login()">
        <login-form :adding="true" :showSubmit="false" ref="loginForm" @success="onLoggedIn()" />
    </modal>
</div>
</template>

<style lang="scss">
nav.navbar {
    margin: 0 0;
    padding: 0 1rem;
    background: linear-gradient(135deg, #74a8c3 0%, #8363a1 100%);

    .navbar-nav a.nav-link {
        color: rgba(255, 255, 255, 0.75);
    }

    .dropdown:hover {
        background: #7a89b7;
        color: #ffffff;
    }

    .dropdown:hover .dropdown-menu {
        display: block;
    }

    .dropdown-item {
        outline: none !important;

        &.active {
            color: inherit !important;
            background-color: inherit !important;
        }

        &:hover,
        &:active,
        &.active:hover {
            color: inherit !important;
            background-color: #f3f3f3 !important;
        }
    }

    .dropdown-menu {
        border-radius: 0 !important;
        padding: 0;
        margin: 0;
        box-shadow: 3px 2px 3px #eee;

        a.dropdown-item {
            position: relative;

            .checkmark {
                position: absolute;
                left: 8px;
            }
        }
    }

    a.navbar-brand {
        font-size: 100%;
    }
}
</style>
