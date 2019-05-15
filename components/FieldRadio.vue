<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { validationErrorsMixin } from '../mixins'
const FormRadioComponent = require('bootstrap-vue/es/components/form-radio/form-radio').default

/**
 * This is a very simple component -- we're just using Bootstrap-Vue's default component and
 * defining some mixins
 * For more info in this component:
 * @url https://bootstrap-vue.js.org/docs/components/form-radio
 */
@Component({
    extends: FormRadioComponent,
    mixins: [validationErrorsMixin],
})
export default class FieldRadio extends Vue {}
</script>
