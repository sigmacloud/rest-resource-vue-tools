<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import LoginForm from '@/components_for_demo/LoginForm.vue'

@Component({
    components: {
        LoginForm,
    },
    data() {
        return {}
    },
})
export default class LoginComponent extends Vue {
    onSubmit(e: Event) {
        let form = this.$refs.form as LoginForm
        form.submit()
    }

    onSuccess(e: Event) {
        if (this.$route.query.redirect) {
            this.$router.push(this.$route.query.redirect as string)
        } else {
            this.$router.push('home')
        }
    }
}
</script>

<template>
    <div class="login-screen pt-5">
        <b-col offset-xl="4" md="12" lg="6" xl="4">
            <b-card bg-variant="light" text-variant="dark" class="mt-5">
                <login-form :showSubmit="false" @submit="onSubmit" @success="onSuccess" ref="form" />
                <template slot="header">
                    <h3>Log In</h3>
                </template>
                <template slot="footer">
                    <!-- <b-button to="/forgot-password" variant="link">Forgot Password?</b-button> -->
                    <b-button type="submit" variant="link" @click="onSubmit" class="float-right white-button">Submit</b-button>
                </template>
            </b-card>
        </b-col>
    </div>
</template>

<style lang="scss">
.login-screen {
    height: 100%;
    width: 100%;
    position: absolute;
    background: linear-gradient(135deg, #8363a1 0%, #74a8c3 100%);

    .card {
        border: 1px solid #fff;
        background: transparent;

        h3 {
            margin: 0;
            padding: 0;
        }

        .card-header,
        .card-body {
            border: none;
            background: #fff;
        }

        .card-footer {
            border: none;
            background: transparent;
        }

        .form-group input,
        .form-group select {
            background: transparent !important;
        }
    }
}
</style>
