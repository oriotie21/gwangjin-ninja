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
    <tbody v-if="hits.length > 0">
      <tr
        v-for="(hit, index) in filteredHitsWithoutMissingSrcIp"
        :key="index"
        :class="{
          'table-drop': hit._source.data.event_type === 'drop',
          'table-alert': hit._source.data.event_type === 'alert',
        }"
        @dblclick="showDetails(hit)"
      >
        <td>{{ hit._source.data.timestamp }}</td>
        <td>{{ hit._source.data.src_ip }}</td>
        <td>{{ hit._source.data.dest_ip }}</td>
        <td>{{ hit._source.data.proto }}</td>
        <!-- <td>{{ hit._source.message.flow }}</td> -->
        <td>{{ hit._source.data.src_port }}</td>
        <td>{{ hit._source.data.dest_port }}</td>
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
    <h3>
      <b>{{ selectedHit._source.data.src_ip }}</b>
    </h3>
    <p>
      <b>Timestamp: {{ selectedHit._source.data.timestamp }}</b>
    </p>
    <p>
      <b>Destination IP: {{ selectedHit._source.data.dest_ip }}</b>
    </p>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "TrafficForm",
  data() {
    return {
      selectedHit: null,
      hits: [], // Initialize the hits data
      startDatetime: "",
      endDatetime: "",
      intervalId: null, // Variable to store the interval ID
    };
  },
  created() {
    this.startHitsInterval(); // Start the interval when the component is created
  },
  computed: {
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

      // Set interval to call fetchHits every 2 seconds
      this.intervalId = setInterval(() => {
        this.fetchHits();
      }, 1000);
    },
    stopHitsInterval() {
      clearInterval(this.intervalId); // Clear the interval
      //console.log("clear", this.intervalId);
    },
    fetchHits() {
      axios
        .get("http://localhost:8080/api/hitsjson")
        .then((response) => {
          this.hits = response.data; // Update the hits data in the component
          const newHits = response.data;

          // Check for "drop" or "alert" event type
          const hasEventType = newHits.some(
            (hit) =>
              hit._source.data.event_type === "drop" ||
              hit._source.data.event_type === "alert"
          );

          if (hasEventType) {
            this.showInternetNotification(); // Display internet notification
          }
          this.hits = newHits;
        })
        .catch((error) => {
          console.error(error);
        });
      //console.log("set", this.intervalId);
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
        })
        .catch((error) => {
          console.error(error);
        });
    },
    generateItems() {
      this.fetchHitsDuration();
    },
    showInternetNotification() {
      // Check if the Notification API is supported
      if ("Notification" in window) {
        // Request permission to display notifications
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            // Create a notification
            new Notification("GWANGJININJA Alert", {
              body: "Attack Occured!.",
            });
          }
        });
      }
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
  float: right; /* 버튼을 오른쪽에 배치합니다 */
  background-color: rgb(27, 68, 112);
  color: white; /* 텍스트 색상을 원하는 색상으로 설정합니다 */
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}
.table-resizable {
  width: 1400px !important;
}
</style>
