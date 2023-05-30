<template>
  <div
    class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom"
  >
    <h1 class="h2" style="font-weight: bold">Traffic Table</h1>
    <div class="btn-toolbar mb-2 mb-md-0">
      <div class="btn-group me-2">
        <input type="datetime-local" v-model="startDatetime" />
        <span style="padding: 8px">to</span>
        <input type="datetime-local" v-model="endDatetime" />
        <button
          type="button"
          class="btn btn-sm btn-primary"
          @click="generateItems()"
          style="background-color: #146c94"
        >
          Search
        </button>
      </div>
    </div>
  </div>

  <table class="table table-striped table-bordered table-resizable">
    <colgroup>
      <col style="width: 20%" />
      <col style="width: 15%" />
      <col style="width: 15%" />
      <col style="width: 15%" />
      <col style="width: 10%" />
      <col style="width: 10%" />
    </colgroup>
    <thead>
      <tr>
        <th>Timestamp</th>
        <th>Source IP</th>
        <th>Dest IP</th>
        <th>Protocol</th>
        <th>Source Port</th>
        <th>Dest Port</th>
      </tr>
    </thead>
    <tbody v-if="filteredHits.length > 0">
      <tr
        v-for="(hit, index) in filteredHits"
        :key="index"
        :class="getTableClass(hit)"
        @dblclick="showDetails(hit)"
      >
        <td>{{ hit._source.data.timestamp }}</td>
        <td>{{ hit._source.data.src_ip }}</td>
        <td>{{ hit._source.data.dest_ip || hit._source.data.dst_ip }}</td>
        <td>{{ hit._source.data.proto || getProtocol(hit) }}</td>
        <td>{{ hit._source.data.src_port }}</td>
        <td>{{ hit._source.data.dest_port || hit._source.data.dst_port }}</td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="6" class="text-center">No data available</td>
      </tr>
    </tbody>
  </table>
  <div v-if="selectedHit" class="side-view">
    <button class="close-button" @click="closeSideView">Close</button>
    <p></p>
    <b>Source IP:</b>
    <h3>
      <b>{{ selectedHit._source.data.src_ip }}</b>
    </h3>
    <p></p>
    <p>
      <b
        >Destination IP:
        {{
          selectedHit._source.data.dest_ip || selectedHit._source.data.dst_ip
        }}</b
      >
    </p>
    <p>
      <b>Timestamp: {{ selectedHit._source.data.timestamp }}</b>
    </p>
    <p>
      <b
        >PacketType:
        {{ selectedHit._source.data.event_type || getAttack(selectedHit) }}</b
      >
    </p>
    <p>
      <b
        >Protocol:
        {{ selectedHit._source.data.proto || getProtocol(selectedHit) }}</b
      >
    </p>
    <p>
      <b>Source Port: {{ selectedHit._source.data.src_port }}</b>
    </p>
    <p>
      <b
        >Destination Port:
        {{
          selectedHit._source.data.dest_port ||
          selectedHit._source.data.dst_port
        }}</b
      >
    </p>
  </div>
</template>

<script>
import axios from "axios";
const protocolEnum = {
  0: "ICMP",
  6: "TCP",
  17: "UDP",
  41: "IPv6",
  50: "ESP",
  58: "ICMPv6",
  89: "OSPF",
};

const attackEnum = {
  0: "Benign",
  1: "Bot",
  2: "Brute Force -Web",
  3: "Brute Force -XSS",
  4: "DDOS attack-HOIC",
  5: "DDOS attack-LOIC-UDP",
  6: "DDOS attack-sim",
  7: "DDoS attacks-LOIC-HTTP",
  8: "DoS attacks-GoldenEye",
  9: "DoS attacks-Hulk",
  10: "DoS attacks-SlowHTTPTest",
  11: "DoS attacks-Slowloris",
  12: "FTP-BruteForce",
  13: "Infilteration",
  14: "SQL Injection",
  15: "SSH-Bruteforce",
};

export default {
  name: "TrafficForm",
  data() {
    return {
      selectedHit: null,
      hits: [],
      csvhits: [],
      startDatetime: "",
      endDatetime: "",
      intervalId: null,
    };
  },
  created() {
    this.startHitsInterval();
  },
  computed: {
    filteredHits() {
      const allHits = [...this.hits, ...this.csvhits];
      // Sort allHits by timestamp in descending order
      allHits.sort((a, b) => {
        const timestampA = new Date(a._source.data.timestamp);
        const timestampB = new Date(b._source.data.timestamp);
        return timestampB - timestampA;
      });
      return allHits.filter((hit) => hit._source.data.src_ip);
    },
    getProtocol() {
      return (hit) => {
        const protocol = hit._source.data.protocol;
        console.log(protocol);
        if (protocol in protocolEnum) {
          return protocolEnum[protocol];
        } else {
          return protocol;
        }
      };
    },
    getAttack() {
      return (hit) => {
        const attack = hit._source.data.status;
        console.log(attack);
        if (attack in attackEnum) {
          return attackEnum[attack];
        } else {
          return attack;
        }
      };
    },
  },
  methods: {
    showDetails(hit) {
      this.selectedHit = hit;
    },
    closeSideView() {
      this.selectedHit = null;
    },
    startHitsInterval() {
      this.fetchHits();
      this.fetchHitsCsv();
      this.intervalId = setInterval(() => {
        this.fetchHits();
        this.fetchHitsCsv();
      }, 1000);
    },
    stopHitsInterval() {
      clearInterval(this.intervalId);
    },
    fetchHits() {
      axios
        .get("http://localhost:8080/api/hitsjson")
        .then((response) => {
          const newHits = response.data;
          // Combine new hits with existing hits and sort by timestamp
          this.hits = [...this.hits, ...newHits].sort((a, b) => {
            const timestampA = new Date(a._source.data.timestamp);
            const timestampB = new Date(b._source.data.timestamp);
            return timestampB - timestampA;
          });
        })
        .catch((error) => {
          console.error(error);
        });
    },

    fetchHitsCsv() {
      axios
        .get("http://localhost:8080/api/hitscsv")
        .then((response) => {
          const newCsvHits = response.data;
          // Combine new csv hits with existing csv hits and sort by timestamp
          this.csvhits = [...this.csvhits, ...newCsvHits].sort((a, b) => {
            const timestampA = new Date(a._source.data.timestamp);
            const timestampB = new Date(b._source.data.timestamp);
            return timestampB - timestampA;
          });
        })
        .catch((error) => {
          console.error(error);
        });
    },

    fetchHitsDuration() {
      this.stopHitsInterval();
      axios
        .get("http://localhost:8080/api/hitsjson_duration", {
          params: {
            lte: this.endDatetime + ":59.999999+0900",
            gte: this.startDatetime + ":00.000000+0900",
          },
        })
        .then((response) => {
          this.hits = response.data;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    fetchHitsDurationCsv() {
      this.stopHitsInterval();
      axios
        .get("http://localhost:8080/api/hitscsv_duration", {
          params: {
            lte: this.endDatetime,
            gte: this.startDatetime,
          },
        })
        .then((response) => {
          this.csvhits = response.data;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    generateItems() {
      this.fetchHitsDuration();
    },
    showInternetNotification() {
      if ("Notification" in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("GWANGJININJA Alert", {
              body: "Attack Occurred!",
            });
          }
        });
      }
    },
    getTableClass(hit) {
      if (hit._source.data.rst == 1) {
        return "";
      } else if (hit._source.data.event_type === "drop") {
        return "table-drop";
      } else if (hit._source.data.event_type === "alert") {
        return "table-alert";
      } else if (!hit._source.data.event_type && hit._source.data.status != 0) {
        return "table-attack";
      }
      return "";
    },
  },
};
</script>

<style>
.table-drop {
  background-color: red;
}
.table-alert {
  background-color: yellow;
}
.table-attack {
  background-color: rgb(253, 186, 227);
}
.side-view {
  position: fixed;
  top: 0;
  right: 0;
  width: 500px;
  height: 100%;
  background-color: #76acc7;
  padding: 20px;
  box-shadow: 0 0 10px #76acc7;
  overflow-y: auto;
  transition: all 0.3s;
}
.close-button {
  margin-top: 10px;
  float: right;
  background-color: rgb(27, 68, 112);
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}
.table-resizable {
  width: 1400px !important;
}
</style>
