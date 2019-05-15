<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { validationErrorsMixin } from '@/mixins'
const FormInputComponent = require('bootstrap-vue/es/components/form-input/form-input').default

/**
 * This is a very simple component -- we're just using Bootstrap-Vue's default component and
 * defining some mixins
 * For more info in this component:
 * @url https://bootstrap-vue.js.org/docs/components/form-input
 */
@Component({
    extends: FormInputComponent,
    mixins: [validationErrorsMixin],
})
export default class FieldInput extends Vue {}
</script>
