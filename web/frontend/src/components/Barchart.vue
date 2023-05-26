<template>
  <Bar
    id="my-chart-id"
    :options="chartOptions"
    :data="chartData"
    :height="60"
  />
</template>

<script>
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import axios from "axios";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

export default {
  name: "BarChart",
  components: { Bar },
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

    const generateData = async (label) => {
      const data = [];
      for (let i = 12; i > 0; i--) {
        let count = 0;
        await this.fetchHits(i); // 데이터 가져오기를 기다립니다.
        if (this.hits) {
          this.hits.forEach((hit) => {
            if (hit._source.label === label) {
              count++;
            }
          });
        }
        data.push(count);
      }
      return data;
    };

    return {
      chartData: {
        labels: generateDateLabels(),
        datasets: [
          {
            label: "rulebased",
            data: generateData("rulebased"),
            backgroundColor: "#8294C4",
          },
          {
            label: "Benign",
            data: generateData("Benign"),
            backgroundColor: "#DBDFEA",
          },
          {
            label: "Bot",
            data: generateData("Bot"),
            backgroundColor: "#ACB1D6",
          },
          {
            label: "BruteForce_Web",
            data: generateData("BruteForce_Web"),
            backgroundColor: "#8294C4",
          },
          {
            label: "BruteForce_XSS",
            data: generateData("BruteForce_XSS"),
            backgroundColor: "#DBDFEA",
          },
          {
            label: "DDOS_attack_HOIC",
            data: generateData("DDOS_attack_HOIC"),
            backgroundColor: "#ACB1D6",
          },
          {
            label: "DDOS_attack_LOIC_UDP",
            data: generateData("DDOS_attack_LOIC_UDP"),
            backgroundColor: "#8294C4",
          },
          {
            label: "DDoS_attacks_LOIC_HTTP",
            data: generateData("DDoS_attacks_LOIC_HTTP"),
            backgroundColor: "#DBDFEA",
          },
          {
            label: "DoS_attacks_GoldenEye",
            data: generateData("DoS_attacks_GoldenEye"),
            backgroundColor: "#ACB1D6",
          },
          {
            label: "DoS_attacks_Hulk",
            data: generateData("DoS_attacks_Hulk"),
            backgroundColor: "#8294C4",
          },
          {
            label: "DoS_attacks_SlowHTTPTest",
            data: generateData("DoS_attacks_SlowHTTPTest"),
            backgroundColor: "#DBDFEA",
          },
          {
            label: "DoS_attacks_Slowloris",
            data: generateData("DoS_attacks_Slowloris"),
            backgroundColor: "#ACB1D6",
          },
          {
            label: "FTP_BruteForce",
            data: generateData("FTP_BruteForce"),
            backgroundColor: "#8294C4",
          },
          {
            label: "Infilteration",
            data: generateData("Infilteration"),
            backgroundColor: "#DBDFEA",
          },
          {
            label: "SQLInjection",
            data: generateData("SQLInjection"),
            backgroundColor: "#ACB1D6",
          },
          {
            label: "SSH_Bruteforce",
            data: generateData("SSH_Bruteforce"),
            backgroundColor: "#8294C4",
          },
        ],
      },
      chartOptions: {
        responsive: true,
        type: "barStacked",
        stacked: true,
        grouped: false,
        scales: {
          x: {
            //position: "top",
          },
        },
      },
    };
  },
  methods: {
    fetchHits(minusmonth) {
      axios
        .get("http://localhost:8080/api/hitscsv_duration", {
          params: {
            lte:
              new Date(new Date().setMonth(new Date().getMonth() - minusmonth))
                .toISOString()
                .slice(0, 8) + "31T23:59:59.999999+0900",
            gte:
              new Date(new Date().setMonth(new Date().getMonth() - minusmonth))
                .toISOString()
                .slice(0, 8) + "01T00:00:00.000000+0900",
          },
        })
        .then((response) => {
          this.hits = response.data; // Update the hits data in the component
        })
        .catch((error) => {
          console.log(minusmonth);
          console.error(error);
        });
    },
  },
};
</script>
