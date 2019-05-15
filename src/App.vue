<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { setConfig, getConfig } from '@/config'
import LoginForm from '@/components_for_demo/LoginForm.vue'
import Modal from '@/components/Modal.vue'

@Component({
    components: {
        LoginForm,
        Modal,
    },
})
export default class App extends Vue {
    @Prop({})
    private msg!: string

    login() {
        let loginForm = <LoginForm>this.$refs.loginForm
        loginForm.submit()
    }

    async mounted() {}
}
</script>

<template>
  <div id="app">
    <router-view name="nav"></router-view>
    <router-view name="body">loading...</router-view>
    <router-view name="viewer"></router-view>
    <notifications :duration="3000" position="bottom right" :closeOnClick="true" />
  </div>
</template>

<style lang="scss">
body {
    height: 100%;
    font-weight: 400;
}

.content {
    margin-top: 50px;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to
/* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
}

#app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
#nav {
    padding: 30px;
    a {
        font-weight: bold;
        color: #2c3e50;
        &.router-link-exact-active {
            color: #42b983;
        }
    }
}

ul.nav-tabs:focus {
    outline: none;
}
</style>
