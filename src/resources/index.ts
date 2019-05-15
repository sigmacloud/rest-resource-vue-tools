import Resource from 'rest-resource'
import store from '../store'
import { BaseFieldSet } from '@/fieldsets/index'

export default class BaseResource extends Resource {
    static perPage = 20
    static defaultFieldSetClass?: typeof BaseFieldSet

    static get client() {
        // Client is wired into Store, just always get the currently selected one
        return store.getters.client || this._client
    }
}
