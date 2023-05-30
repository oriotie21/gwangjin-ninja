<template>
  <div>
    <p></p>
    <h1><b>Network Interfaces</b></h1>
    <!-- <h3 v-for="interfaceName in interfaces" :key="interfaceName">
      <b>- {{ interfaceName }}</b>
    </h3> -->
    <h2><b> - eth0</b></h2>
    <h2>- lo</h2>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      interfaces: null,
    };
  },
  mounted() {
    this.fetchInterfaces();
  },
  methods: {
    fetchInterfaces() {
      axios
        .get("http://localhost:8080/api/networkInterfaces")
        .then((response) => {
          this.interfaces = response.data;
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
};
</script>
