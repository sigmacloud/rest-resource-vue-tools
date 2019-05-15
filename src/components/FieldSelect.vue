<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { validationErrorsMixin } from '@/mixins'
const FormSelectComponent = require('bootstrap-vue/es/components/form-select/form-select').default

/**
 * This is a very simple component -- we're just using Bootstrap-Vue's default component and
 * defining some mixins
 * For more info in this component:
 * @url https://bootstrap-vue.js.org/docs/components/form-select
 */
@Component({
    extends: FormSelectComponent,
    mixins: [validationErrorsMixin],
})
export default class FieldSelect extends Vue {}
</script>
