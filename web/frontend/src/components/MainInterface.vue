<template>
  <div>
    <h1><b>Network Interfaces</b></h1>
    <h3 v-for="interfaceName in interfaces" :key="interfaceName">
      - {{ interfaceName }}
    </h3>
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
