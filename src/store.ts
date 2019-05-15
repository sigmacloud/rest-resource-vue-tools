import Vue from 'vue'
import Vuex from 'vuex'
import { DefaultClient } from 'rest-resource/src/client'
// @ts-ignore
import { ViewerItem, OPTIONS_DEFAULT } from '@/components/ResourceViewer.vue'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        client: undefined,
        clients: [],
        modals: [],
        viewingResources: [],
    },
    getters: {
        client(state): DefaultClient {
            return <DefaultClient>state.client
        },
        clients(state): DefaultClient[] {
            return state.clients
        },
        viewingResources(state) {
            return state.viewingResources
        },
        getClientByHostname(state): (hostname: string) => DefaultClient {
            return (hostname: string) => {
                return state.clients.find((client) => String(client.hostname) === String(hostname)) as DefaultClient
            }
        }
    },
    mutations: {
        setClient(state, hostname) {
            let client = store.getters.getClientByHostname(hostname)
            if (!client) {
                throw new TypeError(`Client ${hostname} not found!`)
            }
            state.client = client
            localStorage.setItem('selectedClientHostname', hostname)
        },
        addClient(state, payload) {
            let client = store.getters.getClientByHostname(payload.hostname)
            
            if(client) {
                store.commit('removeClient', client.hostname)
            }
            // Create a new client instance
            let newClient = new DefaultClient(payload.hostname)
            state.clients.push(newClient)
            localStorage.setItem('clients', JSON.stringify(state.clients))
        },
        addClientAndSelect(state, payload) {
            store.commit('addClient', payload)
            store.commit('setClient', payload.hostname)
        },
        removeClient(state, hostname) {
            let client = store.getters.getClientByHostname(hostname)
            let clientIndex = state.clients.indexOf(client)
            state.clients.splice(clientIndex, 1)
        },
        viewerAddItem(state, item: ViewerItem) {
            state.viewingResources.push(item)
        },
        viewerRemoveItem(state, item) {
            let itemIndex = state.viewingResources.indexOf(item)
            if (itemIndex > -1) {
                state.viewingResources.splice(itemIndex, 1)
                if ('object' === typeof item.options && 'function' === typeof item.options.onClose) {
                    item.options.onClose.call(item, item.resource)
                }
            }
        },
        viewResource(state, payload) {
            let opts = {
                ...OPTIONS_DEFAULT,
                ...payload.options,
            }
            let item: ViewerItem = {
                resource: payload.resource,
                fieldsetClass: payload.fieldsetClass,
                options: opts,
                close: () => store.commit('viewerRemoveItem', item),
            }

            store.commit('viewerAddItem', item)
            return item
        },
    },
    actions: {},
})

export default store
