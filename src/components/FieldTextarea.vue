<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { validationErrorsMixin } from '@/mixins'
const FormTextareaComponent = require('bootstrap-vue/es/components/form-textarea/form-textarea').default

/**
 * This is a very simple component -- we're just using Bootstrap-Vue's default component and
 * defining some mixins
 * For more info in this component:
 * @url https://bootstrap-vue.js.org/docs/components/form-textarea
 */
@Component({
    extends: FormTextareaComponent,
    mixins: [validationErrorsMixin],
})
export default class FieldTextarea extends Vue {}
</script>
