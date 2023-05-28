<template>
  <h2><b>최근 24시간 동안의 공격이 표시됩니다.</b></h2>
  <b-container fluid>
    <b-row>
      <div id="map" class="col-md-8"></div>
      <div class="col-md-4">
        <GChart type="PieChart" :options="options" :data="data" />
      </div>
    </b-row>
  </b-container>
</template>

<script>
import { GChart } from "vue-google-charts";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat/dist/leaflet-heat.js";
import axios from "axios";

export default {
  name: "AttackForm",
  components: {
    GChart,
  },
  data() {
    return {
      map: null,
      data: [
        ["Attack", "for 24 hours"],
        ["rulebased", 0],
        ["Benign", 0],
        ["Bot", 0],
        ["BruteForce_Web", 0],
        ["BruteForce_XSS", 0],
        ["DDOS_attack_HOIC", 0],
        ["DDOS_attack_LOIC_UDP", 0],
        ["DDoS_attacks_LOIC_HTTP", 0],
        ["DoS_attacks_GoldenEye", 0],
        ["DoS_attacks_Hulk", 0],
        ["DoS_attacks_SlowHTTPTest", 0],
        ["DoS_attacks_Slowloris", 0],
        ["FTP_BruteForce", 0],
        ["Infilteration", 0],
        ["SQLInjection", 0],
        ["SSH_Bruteforce", 0],
      ],
      options: {
        backgroundColor: "#AFD3E2",
        width: 1000,
        height: 600,
        chartArea: {
          width: "90%",
          height: "90%",
        },
        legend: {
          position: "right",
          alignment: "center",
          textStyle: {
            fontSize: 20, // 글씨 크기 조정
          },
        },
        colors: ["#FFB6C1", "#C3ACD0", "#98FB98", "#FFDAB9", "#FFA07A"],
        pieSliceBorderColor: "none",
        pieSliceTextStyle: {
          fontSize: 20, // 데이터 레이블의 크기를 지정
          bold: true,
        },
      },
    };
  },
  mounted() {
    this.initMap();
  },
  methods: {
    fetchHits() {
      axios
        .get("http://localhost:8080/api/hitscsv_duration", {
          params: {
            lte:
              new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 19) + ".999999+0900",
            gte:
              new Date(
                new Date().getTime() + 9 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000
              )
                .toISOString()
                .slice(0, 19) + ".000000+0900",
          },
        })
        .then((response) => {
          const data = response.data; // Update the hits data in the component
          data.forEach((data) => {
            console.log(data._source.data.src_ip);
            this.fetchCountry(data._source.data.src_ip);
          });

          this.hits = response.data; // Update the hits data in the component
          // Calculate the total hours for "Work", "Exercise", and "Sleep"
          let total = {
            Benign: 0,
            Bot: 0,
            BruteForce_Web: 0,
            BruteForce_XSS: 0,
            DDOS_attack_HOIC: 0,
            DDOS_attack_LOIC_UDP: 0,
            DDoS_attacks_LOIC_HTTP: 0,
            DoS_attacks_GoldenEye: 0,
            DoS_attacks_Hulk: 0,
            DoS_attacks_SlowHTTPTest: 0,
            DoS_attacks_Slowloris: 0,
            FTP_BruteForce: 0,
            Infilteration: 0,
            SQLInjection: 0,
            SSH_Bruteforce: 0,
          };

          // Iterate through hits and sum the hours for each category
          this.hits.forEach((hit) => {
            const label = hit._source.data.label;

            if (label === "Benign") {
              total.Benign += 1;
            } else if (label === "Bot") {
              total.Bot += 1;
            } else if (label === "BruteForce_Web") {
              total.BruteForce_Web += 1;
            } else if (label === "BruteForce_XSS") {
              total.BruteForce_XSS += 1;
            } else if (label === "DDOS_attack_HOIC") {
              total.DDOS_attack_HOIC += 1;
            } else if (label === "DDOS_attack_LOIC_UDP") {
              total.DDOS_attack_LOIC_UDP += 1;
            } else if (label === "DDoS_attacks_LOIC_HTTP") {
              total.DDoS_attacks_LOIC_HTTP += 1;
            } else if (label === "DoS_attacks_GoldenEye") {
              total.DoS_attacks_GoldenEye += 1;
            } else if (label === "DoS_attacks_Hulk") {
              total.DoS_attacks_Hulk += 1;
            } else if (label === "DoS_attacks_SlowHTTPTest") {
              total.DoS_attacks_SlowHTTPTest += 1;
            } else if (label === "DoS_attacks_Slowloris") {
              total.DoS_attacks_Slowloris += 1;
            } else if (label === "FTP_BruteForce") {
              total.FTP_BruteForce += 1;
            } else if (label === "Infilteration") {
              total.Infilteration += 1;
            } else if (label === "SQLInjection") {
              total.SQLInjection += 1;
            } else if (label === "SSH_Bruteforce") {
              total.SSH_Bruteforce += 1;
            }
          });

          // Update the data array with updated hour values
          for (let i = 1; i < this.data.length; i++) {
            const attack = Object.keys(total)[i - 1];
            this.data[i + 1][1] = total[attack];
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    fetchHitsJson() {
      axios
        .get("http://localhost:8080/api/hitsjson_duration", {
          params: {
            lte: "2023-04-08T23:59:59.999999+0900",
            gte: "2023-04-08T00:00:00.000000+0900",
          },
        })
        .then((response) => {
          const data = response.data;
          data.forEach((data) => {
            console.log(data._source.data.src_ip);
            this.fetchCountry(data._source.data.src_ip);
          });

          this.hitsjson = response.data;
          let total = {
            rulebased: 0,
          };

          this.hitsjson.forEach(() => {
            total.rulebased += 1;
          });

          this.data[1][1] = total[0];
        })
        .catch((error) => {
          console.error(error);
        });
    },
    initMap() {
      // Leaflet 지도 인스턴스 생성
      this.map = L.map("map", {
        center: [30, 156],
        zoom: 1.5,
        minZoom: 1.5, // 최소 확대 범위 설정
        maxZoom: 10, // 최대 확대 범위 설정
        maxBounds: L.latLngBounds(L.latLng(90, 180), L.latLng(-90, -180)),
      });

      // Leaflet 타일 레이어 추가 (OpenStreetMap 사용)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "Map data &copy; OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(this.map);
    },
    fetchCountry(ipAddress) {
      axios
        .post("http://localhost:8080/api/ipcountry", { ipAddress })
        .then((response) => {
          const { latitude, longitude } = response.data;
          console.log("Latitude:", latitude);
          console.log("Longitude:", longitude);

          L.heatLayer([[latitude, longitude, 200]], {
            radius: 15,
          }).addTo(this.map);
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
  created() {
    this.fetchHits();
    this.fetchHitsJson();
  },
  computed: {},
};
</script>

<style>
#map {
  width: 1000px;
  height: 600px;
}
</style>
