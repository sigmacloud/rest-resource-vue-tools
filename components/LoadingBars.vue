<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

@Component({
    components: {},
    data() {
        return {}
    },
})
export default class LoadingBars extends Vue {
    @Prop({ type: [Number, String], default: 3 })
    rows?: number | string

    @Prop({ type: [Number, String], default: 4 })
    cols?: number | string

    @Prop({ type: [Number, String], default: 1 })
    size?: number | string

    getLineClasses() {
        let classes = ['text-line']
        if (Math.random() > 0.7) {
            classes.push('lighter')
        }
        return classes
    }
}
</script>

<template>
<div class="loading">
    <div class="wrapper" v-for="i in Array(cols)" :key="i">
    <div class="wrapper-cell" v-for="i in Array(rows)" :key="i" :style="`zoom: ${size}`">
        <div class="image"></div>
        <div class="text">
            <div :class="getLineClasses()"> </div>
            <div :class="getLineClasses()"></div>
            <div :class="getLineClasses()"></div>
            <div :class="getLineClasses()"></div>
        </div>
    </div>
    </div>
</div>
</template>

<style lang="scss" scoped>
.wrapper {
    margin: 0;
    padding: 20px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
}

.wrapper-cell {
    margin: 0 20px 20px 0;
    width: 400px;
    height: 85px;
    position: relative;
}

@-webkit-keyframes placeHolderShimmer {
    0% {
        background-position: -468px 0;
    }
    100% {
        background-position: 468px 0;
    }
}

@keyframes placeHolderShimmer {
    0% {
        background-position: -468px 0;
    }
    100% {
        background-position: 468px 0;
    }
}
.animated-background,
.image,
.text-line {
    -webkit-animation-duration: 1.25s;
    animation-duration: 1.25s;
    -webkit-animation-fill-mode: forwards;
    animation-fill-mode: forwards;
    -webkit-animation-iteration-count: infinite;
    animation-iteration-count: infinite;
    -webkit-animation-name: placeHolderShimmer;
    animation-name: placeHolderShimmer;
    -webkit-animation-timing-function: linear;
    animation-timing-function: linear;
    background: #f6f6f6;
    background: linear-gradient(to right, #f6f6f6 8%, #f0f0f0 18%, #f6f6f6 33%);
    background-size: 800px 104px;
    height: 96px;
    position: relative;

    &.lighter {
        background: #ccc;
    }
}

.image {
    height: 85px;
    width: 85px;
    position: absolute;
    top: 0;
    left: 0;
}

.text {
    position: absolute;
    top: 0;
    right: 0;
    width: 315px;
}

.text-line {
    height: 17.5px;
    width: 300px;
    float: right;
    margin-bottom: 5px;
}

.text .text-line:last-child {
    margin-bottom: 0;
}
</style>
