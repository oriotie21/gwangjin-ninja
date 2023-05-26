<template>
  <div class="chart-container">
    <Line :data="chartdata" :options="chartOptions" :height="60" />
    <div class="chart-spacer"></div>
    <BarChart />
  </div>
</template>

<script>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "vue-chartjs";
import BarChart from "./Barchart.vue"; // BarChart 컴포넌트 import

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default {
  name: "TimeTableForm",
  components: {
    Line,
    BarChart,
  },
  data() {
    const generateDateLabels = () => {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const currentDate = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      const labels = [];
      for (let i = 11; i >= 0; i--) {
        const monthIndex = (currentMonth + 12 - i) % 12;
        const month = months[monthIndex];
        const year = currentYear - Math.floor((currentMonth + 12 - i) / 12);
        const label = `${month} ${year}`;
        labels.push(label);
      }
      return labels;
    };
    return {
      chartdata: {
        labels: generateDateLabels(),
        datasets: [
          {
            label: "The Amount of Attack",
            backgroundColor: "#8294C4",
            data: [2, 14, 28, 49, 44, 10, 31, 42, 20, 39, 11, 35],
            pointRadius: 8,
          },
        ],
      },
      chartOptions: {},
    };
  },
};
</script>

<style>
.chart-spacer {
  margin-top: 50px;
}
</style>
