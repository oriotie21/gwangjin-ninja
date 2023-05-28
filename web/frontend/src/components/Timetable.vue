<template>
  <div class="chart-container">
    <h3 v-if="isLoading">로딩중...</h3>
    <canvas ref="LinechartCanvas" id="my-chart-id" :height="60"></canvas>
    <div class="chart-spacer"></div>
    <canvas ref="BarchartCanvas" id="my-chart-id" :height="60"></canvas>
  </div>
</template>

<script>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend
);

export default {
  name: "TimeTableForm",
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
        const year = i > currentMonth ? currentYear - 1 : currentYear;
        const label = `${month} ${year}`;
        labels.push(label);
      }
      return labels;
    };
    return {
      isLoading: true, // 로딩 상태 변수 추가
      BarchartData: { labels: generateDateLabels(), datasets: [] },
      BarchartOptions: {
        responsive: true,
        type: "bar",
        stacked: true,
        grouped: false,
      },
      BarchartInstance: null,
      chartdata: {
        labels: generateDateLabels(),
        datasets: [
          {
            label: "The Amount of Attack",
            backgroundColor: "#8294C4",
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            pointRadius: 8,
          },
        ],
      },
      LinechartInstance: null,
      chartOptions: {},
    };
  },

  async mounted() {
    this.BarchartData.datasets = [
      {
        label: "rulebased",
        data: await this.generateDataJson(),
        backgroundColor: "#8294C4",
        stack: "stacked",
      },
      {
        label: "Benign",
        data: await this.generateData("Benign"),
        backgroundColor: "#DBDFEA",
        stack: "stacked",
      },
      {
        label: "Bot",
        data: await this.generateData("Bot"),
        backgroundColor: "#ACB1D6",
        stack: "stacked",
      },
      {
        label: "BruteForce_Web",
        data: await this.generateData("BruteForce_Web"),
        backgroundColor: "#8294C4",
        stack: "stacked",
      },
      {
        label: "BruteForce_XSS",
        data: await this.generateData("BruteForce_XSS"),
        backgroundColor: "#DBDFEA",
        stack: "stacked",
      },
      {
        label: "DDOS_attack_HOIC",
        data: await this.generateData("DDOS_attack_HOIC"),
        backgroundColor: "#ACB1D6",
        stack: "stacked",
      },
      {
        label: "DDOS_attack_LOIC_UDP",
        data: await this.generateData("DDOS_attack_LOIC_UDP"),
        backgroundColor: "#8294C4",
        stack: "stacked",
      },
      {
        label: "DDoS_attacks_LOIC_HTTP",
        data: await this.generateData("DDoS_attacks_LOIC_HTTP"),
        backgroundColor: "#DBDFEA",
        stack: "stacked",
      },
      {
        label: "DoS_attacks_GoldenEye",
        data: await this.generateData("DoS_attacks_GoldenEye"),
        backgroundColor: "#ACB1D6",
        stack: "stacked",
      },
      {
        label: "DoS_attacks_Hulk",
        data: await this.generateData("DoS_attacks_Hulk"),
        backgroundColor: "#8294C4",
        stack: "stacked",
      },
      {
        label: "DoS_attacks_SlowHTTPTest",
        data: await this.generateData("DoS_attacks_SlowHTTPTest"),
        backgroundColor: "#DBDFEA",
        stack: "stacked",
      },
      {
        label: "DoS_attacks_Slowloris",
        data: await this.generateData("DoS_attacks_Slowloris"),
        backgroundColor: "#ACB1D6",
        stack: "stacked",
      },
      {
        label: "FTP_BruteForce",
        data: await this.generateData("FTP_BruteForce"),
        backgroundColor: "#8294C4",
        stack: "stacked",
      },
      {
        label: "Infilteration",
        data: await this.generateData("Infilteration"),
        backgroundColor: "#DBDFEA",
        stack: "stacked",
      },
      {
        label: "SQLInjection",
        data: await this.generateData("SQLInjection"),
        backgroundColor: "#ACB1D6",
        stack: "stacked",
      },
      {
        label: "SSH_Bruteforce",
        data: await this.generateData("SSH_Bruteforce"),
        backgroundColor: "#8294C4",
        stack: "stacked",
      },
    ];

    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < this.BarchartData.labels.length; j++) {
        this.chartdata.datasets[0].data[j] +=
          this.BarchartData.datasets[i].data[j];
      }
    }

    try {
      await this.renderChart();
      await this.renderLineChart();
      this.isLoading = false; // 로딩 상태 변경
    } catch (error) {
      console.error(error);
      this.isLoading = false; // 로딩 상태 변경 (에러 발생 시에도 로딩중 표시 제거)
    }
  },
  methods: {
    async generateData(label) {
      const data = [];
      for (let i = 11; i >= 0; i--) {
        let count = 0;
        await this.fetchHits(i);
        if (this.hits) {
          this.hits.forEach((hit) => {
            if (hit._source.data.label === label) {
              count++;
            }
          });
        }
        data.push(count);
      }
      return data;
    },
    async generateDataJson() {
      const data = [];
      for (let i = 11; i >= 0; i--) {
        let count = 0;
        await this.fetchHitsJson(i);
        if (this.hits) {
          this.hits.forEach(() => {
            count++;
          });
        }
        data.push(count);
      }
      return data;
    },
    fetchHits(minusmonth) {
      return new Promise((resolve, reject) => {
        axios
          .get("http://localhost:8080/api/hitscsv_duration", {
            params: {
              lte:
                new Date(
                  new Date().setMonth(new Date().getMonth() - minusmonth)
                )
                  .toISOString()
                  .slice(0, 8) + "31T23:59:59.999999+0900",
              gte:
                new Date(
                  new Date().setMonth(new Date().getMonth() - minusmonth)
                )
                  .toISOString()
                  .slice(0, 8) + "01T00:00:00.000000+0900",
            },
          })
          .then((response) => {
            this.hits = response.data;
            resolve();
          })
          .catch((error) => {
            console.log(minusmonth);
            console.error(error);
            reject(error);
          });
      });
    },
    fetchHitsJson(minusmonth) {
      return new Promise((resolve, reject) => {
        axios
          .get("http://localhost:8080/api/hitsjson_duration", {
            params: {
              lte:
                new Date(
                  new Date().setMonth(new Date().getMonth() - minusmonth)
                )
                  .toISOString()
                  .slice(0, 8) + "31T23:59:59.999999+0900",
              gte:
                new Date(
                  new Date().setMonth(new Date().getMonth() - minusmonth)
                )
                  .toISOString()
                  .slice(0, 8) + "01T00:00:00.000000+0900",
            },
          })
          .then((response) => {
            this.hits = response.data;
            resolve();
          })
          .catch((error) => {
            console.log(minusmonth);
            console.error(error);
            reject(error);
          });
      });
    },
    renderChart() {
      if (this.BarchartInstance) {
        this.BarchartInstance.destroy();
      }

      const canvas = this.$refs.BarchartCanvas;
      const context = canvas.getContext("2d");

      this.BarchartInstance = new ChartJS(context, {
        type: "bar",
        data: this.BarchartData,
        options: this.BarchartOptions,
      });
    },
    async renderLineChart() {
      if (this.LinechartInstance) {
        this.LinechartInstance.destroy();
      }

      const canvas = this.$refs.LinechartCanvas;
      const context = canvas.getContext("2d");

      this.LinechartInstance = new ChartJS(context, {
        type: "line",
        data: this.chartdata,
        options: this.chartOptions,
      });
    },
  },
};
</script>

<style>
.chart-spacer {
  margin-top: 50px;
}
</style>
