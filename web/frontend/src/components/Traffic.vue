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

  <table class="table table-striped table-bordered">
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
          'table-drop': hit._source.message.event_type === 'drop',
          'table-alert': hit._source.message.event_type === 'alert',
        }"
      >
        <td>{{ hit._source.message.timestamp }}</td>
        <td>{{ hit._source.message.src_ip }}</td>
        <td>{{ hit._source.message.dest_ip }}</td>
        <td>{{ hit._source.message.proto }}</td>
        <!-- <td>{{ hit._source.message.flow }}</td> -->
        <td>{{ hit._source.message.src_port }}</td>
        <td>{{ hit._source.message.dest_port }}</td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="6" class="text-center">No data available</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import axios from "axios";
export default {
  name: "TrafficForm",
  data() {
    return {
      hits: [], // Initialize the hits data
      startDatetime: "",
      endDatetime: "",
    };
  },
  created() {
    this.fetchHits(); // Call the fetchHits method when the component is created
  },
  computed: {
    filteredHitsWithoutMissingSrcIp() {
      return this.hits.filter((hit) => hit._source.message.src_ip);
    },
  },
  methods: {
    fetchHits() {
      axios
        .get("http://localhost:8080/api/hitsjson")
        .then((response) => {
          this.hits = response.data; // Update the hits data in the component
        })
        .catch((error) => {
          console.error(error);
        });
    },
    fetchHitsDuration() {
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
</style>
