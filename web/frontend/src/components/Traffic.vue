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
        <!-- <th>Length</th> -->
        <th>Source Port</th>
        <th>Dest Port</th>
      </tr>
    </thead>
    <tbody v-if="allhits.length > 0">
      <tr
        v-for="(hit, index) in filteredHits"
        :key="index"
        :class="{
          'table-rst':
            hit._source.data !== undefined &&
            hit._source.data.drop !== undefined &&
            hit._source.data.proto === 'TCP' &&
            (hit._source.data.drop.rst === true ||
              hit._source.data.drop.fin === true),
          'table-drop': hit._source.data.event_type === 'drop',
          'table-alert': hit._source.data.event_type === 'alert',
          'table-attack':
            !hit._source.data.event_type && hit._source.data.status !== 0,
        }"
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
      hits: [], // Initialize the hits data
      csvhits: [],
      allhits: [],
      startDatetime: "",
      endDatetime: "",
      intervalId: null, // Variable to store the interval ID
    };
  },
  created() {
    this.startHitsInterval(); // Start the interval when the component is created
    this.requestNotificationPermission();
  },
  computed: {
    filteredHits() {
      return this.allhits.filter(
        (hit) => hit._source.data.dest_ip || hit._source.data.dst_ip
      );
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
    filteredHitsWithoutMissingSrcIp() {
      return this.hits.filter((hit) => hit._source.data.src_ip);
    },
  },
  methods: {
    showDetails(hit) {
      this.selectedHit = hit;
    },
    closeSideView() {
      this.selectedHit = null; // 사이드뷰를 닫을 때 selectedHit을 null로 설정합니다.
    },
    startHitsInterval() {
      this.fetchHits(); // Call fetchHits initially
      this.fetchHitsCsv();

      // Set interval to call fetchHits every 2 seconds
      this.intervalId = setInterval(() => {
        this.fetchHits();
        this.fetchHitsCsv();
      }, 2000);
    },
    stopHitsInterval() {
      clearInterval(this.intervalId); // Clear the interval
      //console.log("clear", this.intervalId);
    },
    isHitsDataEqual(previousHits, currentHits) {
      // Implement the logic to compare the previous and current hits data
      // and return true if they are equal, otherwise return false.
      // You can use JSON.stringify to compare the string representation of the data.

      const previousHitsString = JSON.stringify(previousHits);
      const currentHitsString = JSON.stringify(currentHits);

      return previousHitsString === currentHitsString;
    },
    fetchHits() {
      axios
        .get("http://localhost:8080/api/hitsjson")
        .then((response) => {
          const previousHits = this.hits; // Store previous hits data
          this.hits = response.data;
          const newHits = this.hits.filter(
            (hit) => !previousHits.includes(hit)
          );
          this.mergeHits(); // Merge hits and csvhits

          // Check if the new hits data is different from the previous hits data
          if (!this.isHitsDataEqual(previousHits, this.hits)) {
            if (
              newHits.some(
                (hit) =>
                  !(
                    hit._source.data !== undefined &&
                    hit._source.data.drop !== undefined &&
                    hit._source.data.proto === "TCP" &&
                    (hit._source.data.drop.rst === true ||
                      hit._source.data.drop.fin === true)
                  )
              )
            ) {
              this.showInternetNotification();
            }
          }
        })
        .catch((error) => {
          console.error(error);
        });
      //console.log("set", this.intervalId);
    },
    fetchHitsCsv() {
      axios
        .get("http://localhost:8080/api/hitscsv")
        .then((response) => {
          const previousHits = this.csvhits; // Store previous hits data
          this.csvhits = response.data; // Update the hits data in the component
          const newHits = this.csvhits.filter(
            (hit) => !previousHits.includes(hit)
          );
          this.mergeHits(); // Merge hits and csvhits

          // Check if the new hits data is different from the previous hits data
          if (!this.isHitsDataEqual(previousHits, this.csvhits)) {
            if (newHits.some((hit) => hit._source.data.status !== 0)) {
              this.showInternetNotificationCsv();
            }
          }
        })
        .catch((error) => {
          console.error(error);
        });
      //console.log("set", this.intervalId);
    },
    requestNotificationPermission() {
      if ("Notification" in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            console.log("Notification permission granted");
          }
        });
      }
    },
    fetchHitsDuration() {
      this.stopHitsInterval(); // Stop the interval when fetchHitsDuration is called

      axios
        .get("http://localhost:8080/api/hitsjson_duration", {
          params: {
            lte: this.endDatetime + ":59.999999+0900",
            gte: this.startDatetime + ":00.000000+0900",
          },
        })
        .then((response) => {
          this.hits = response.data;
          this.mergeHits();
        })
        .catch((error) => {
          console.error(error);
        });
    },
    fetchHitsDurationCsv() {
      this.stopHitsInterval(); // Stop the interval when fetchHitsDuration is called

      axios
        .get("http://localhost:8080/api/hitscsv_duration", {
          params: {
            lte: this.endDatetime,
            gte: this.startDatetime,
          },
        })
        .then((response) => {
          this.csvhits = response.data;
          this.mergeHits();
        })
        .catch((error) => {
          console.error(error);
        });
    },
    mergeHits() {
      this.allhits = [...this.hits, ...this.csvhits];
      this.allhits.sort((a, b) =>
        a._source.data.timestamp < b._source.data.timestamp ? 1 : -1
      );
      console.log(this.allhits);
    },
    generateItems() {
      this.fetchHitsDuration();
      this.fetchHitsDurationCsv();
    },
    showInternetNotification() {
      if ("Notification" in window) {
        new Notification("GWANGJININJA Alert", {
          body: "rulebased Attack Detected!",
        });
      }
    },
    showInternetNotificationCsv() {
      if ("Notification" in window) {
        new Notification("GWANGJININJA Alert", {
          body: "ML Attack Detected!",
        });
      }
    },
    getTableClass(hit) {
      if (
        hit._source.data !== undefined &&
        hit._source.data.drop !== undefined &&
        hit._source.data.proto === "TCP" &&
        (hit._source.data.drop.rst === true ||
          hit._source.data.drop.fin === true)
      ) {
        return "table-rst";
      } else if (hit._source.data.event_type === "drop") {
        return "table-drop";
      } else if (hit._source.data.event_type === "alert") {
        return "table-alert";
      } else if (
        !hit._source.data.event_type &&
        hit._source.data.status !== 0
      ) {
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
.table-rst {
  background-color: #afd3e2;
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
