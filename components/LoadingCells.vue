<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

@Component({
    components: {},
    data() {
        return {
            cellSizes: [20, 20, 20, 20, 20],
        }
    },
})
export default class LoadingBars extends Vue {
    @Prop({ type: [Number, String], default: 3 })
    rows?: number | string

    @Prop({ type: [Number, String], default: 4 })
    cols?: number | string

    @Prop({ type: [Number, String], default: 1 })
    size?: number | string

    makeRandomCellSizes(cols: number, minWidth: number = 12) {
        var cells = []
        var randCols = Math.floor(cols / 2)
        // Half of the cell widths will be randomized
        for (var i = 0; i < randCols; i++) {
            var thisCellWith = (Math.random() * 100) / Math.E
            if (thisCellWith < minWidth) {
                thisCellWith = minWidth
            }
            cells.push(thisCellWith)
        }
        // The other half will be evenly-distributed remainders
        var colsLeft = cols - randCols
        var widthLeftEach = (100 - cells.reduce((x, y) => x + y)) / colsLeft
        var widthLeft = Array(colsLeft).fill(widthLeftEach)
        cells = cells.concat(widthLeft)
        // Now randomize cells
        for (let i = cells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[cells[i], cells[j]] = [cells[j], cells[i]]
        }
        return cells
    }

    getLineClasses() {
        let classes = ['text-line']
        if (Math.random() > 0.7) {
            classes.push('lighter')
        }
        return classes
    }

    beforeMount() {
        this.$data.cellSizes = this.makeRandomCellSizes(this.$props.cols)
    }
}
</script>

<template>
<div class="loading">
    <table class="wrapper" :style="`zoom: ${size}`">
        <tr class="wrapper-cell" v-for="i in Array(rows)" :key="i">
            <td class="text" v-for="(size, i) in cellSizes" :key="i" :width="`${size}%`">
                <div :class="getLineClasses()">
                </div>
            </td>
        </tr>
    </table>
</div>
</template>

<style lang="scss" scoped>
.wrapper {
    margin: 0;
    width: 100%;
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
        opacity: 0.5;
    }
}

.text-line {
    height: 25px;
    border-radius: 5px;
    width: 100%;
}

.text .text-line:last-child {
    margin-bottom: 0;
}
</style>
