import Vue, { VueConstructor } from 'vue'
import Router from 'vue-router'
import NavbarComponent from './components_for_demo/NavBar.vue'
import ViewerComponent from './components/ResourceViewer.vue'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import About from '@/views/About.vue'
import Edit from '@/views/Edit.vue'
import Users from '@/views/Users.vue'

Vue.use(Router)

/**
 * Use basic named router configurations except the body is the only thing that varies
 * @param component 
 */
function componentAsBody(component: VueConstructor) {
    return {
        nav: NavbarComponent,
        body: component,
        viewer: ViewerComponent
    }
}

const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    scrollBehavior() {
        return { x: 0, y: 0 }
    },
    routes: [
        {
            path: '/',
            name: 'home',
            components: componentAsBody(Home),
        },
        {
            path: '/users',
            name: 'users',
            components: componentAsBody(Users)
        },
        {
            path: '/users/:id',
            name: 'edit-users',
            components: componentAsBody(Edit)
        },
        {
            path: '/about',
            name: 'about',
            components: componentAsBody(About as VueConstructor),
        },
        {
            path: '/edit/:id',
            name: 'Edit',
            components: componentAsBody(Edit),
        },
        {
            path: '/login',
            name: 'login',
            components: {
                body: Login
            },
            meta: { 
                loginRequired: false
            }
        },
    ],
})

export default router
