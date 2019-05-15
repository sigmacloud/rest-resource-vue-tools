# Rest Resource - Vue Tools
A set of tools for your Vue+Rest Resource project. Works best with [BootstrapVue](https://bootstrap-vue.js.org)

## Resources
Please see custom build [package documentation](https://github.com/baseprime/rest-resource) for more info

## Dependencies
- Rest Resource `^0.4.12`
- Vue `^2.5.21`
- BootstrapVue `2.0.0`

## Example Using Tools and Components

#### MyComponent.vue
```vue
<script>
import ResourceList from 'rest-resource-vue-tools/components/ResourceList.vue'
import MyResource from './resources'

export default {
    components: {
        ResourceList
    }
}
</script>

<template>
<resource-list
    :resourceClass="MyResource"
    :fields="{ id: 'ID', name: 'Name' }">
</resource-list>
</template>
```

