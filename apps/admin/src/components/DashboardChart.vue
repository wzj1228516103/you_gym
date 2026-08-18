<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts/core';
import { BarChart, FunnelChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ComposeOption } from 'echarts/core';
import type { BarSeriesOption, FunnelSeriesOption, LineSeriesOption, PieSeriesOption } from 'echarts/charts';
import type { GridComponentOption, LegendComponentOption, TooltipComponentOption } from 'echarts/components';

echarts.use([BarChart, FunnelChart, LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

type ChartOption = ComposeOption<BarSeriesOption | FunnelSeriesOption | LineSeriesOption | PieSeriesOption | GridComponentOption | LegendComponentOption | TooltipComponentOption>;

const props = defineProps<{ option: ChartOption | null; empty?: boolean }>();
const chartRoot = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

function render() {
  if (!chart || !props.option || props.empty) return;
  chart.setOption(props.option, true);
  chart.resize();
}

onMounted(async () => {
  await nextTick();
  if (!chartRoot.value) return;
  chart = echarts.init(chartRoot.value, undefined, { renderer: 'canvas' });
  resizeObserver = new ResizeObserver(() => chart?.resize());
  resizeObserver.observe(chartRoot.value);
  render();
});

watch(() => [props.option, props.empty], render, { deep: true });

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  chart?.dispose();
  resizeObserver = null;
  chart = null;
});
</script>

<template>
  <div class="chart-frame">
    <div v-if="empty || !option" class="chart-empty">暂无可展示数据</div>
    <div ref="chartRoot" class="chart-canvas" :aria-hidden="empty || !option ? 'true' : 'false'" />
  </div>
</template>
