import { BaseFieldSet } from './index'
import { requireResource } from '@/util'
import * as fields from '@/fields'

export class TodoFieldSet extends BaseFieldSet {
    title = new fields.InputField('Title')
    userId = new fields.SelectResource('User', 'name', requireResource('user'))
    completed = new fields.BooleanField('Done')
}
