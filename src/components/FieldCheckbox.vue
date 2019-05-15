<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { validationErrorsMixin } from '@/mixins'
const FormCheckboxComponent = require('bootstrap-vue/es/components/form-checkbox/form-checkbox').default

/**
 * This is a very simple component -- we're just using Bootstrap-Vue's default component and
 * defining some mixins
 * For more info in this component:
 * @url https://bootstrap-vue.js.org/docs/components/form-checkbox
 */
@Component({
    extends: FormCheckboxComponent,
    mixins: [validationErrorsMixin],
})
export default class FieldCheckbox extends Vue {}
</script>
