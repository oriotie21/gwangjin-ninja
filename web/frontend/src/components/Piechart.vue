<template>
  <Pie id="pie-chart" :data="chartData" :options="chartOptions" />
</template>

<script>
import { Pie } from "vue-chartjs";

export default {
  name: "PieChart",
  components: { Pie },
  props: {
    chartData: {
      type: Object,
      required: true,
    },
    chartOptions: {
      type: Object,
      required: false,
      default: () => ({
        responsive: true,
      }),
    },
  },
};
</script>
