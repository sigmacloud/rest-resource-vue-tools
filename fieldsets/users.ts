import { BaseFieldSet } from './index'
import * as fields from '@/fields'

export class UserFieldSet extends BaseFieldSet {
    name = new fields.InputField('Name')
    username = new fields.InputField('Handle')
    email = new fields.InputField('Email')
    phone = new fields.InputField('Phone')
    website = new fields.InputField('Website')
}
