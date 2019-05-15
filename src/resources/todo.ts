import BaseResource from './index'
import { requireResource } from '@/util'

export default class TodoResource extends BaseResource {
    static endpoint = '/todos'

    static related = {
        userId: requireResource('user')
    }
}
