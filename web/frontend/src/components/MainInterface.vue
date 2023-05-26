<template>
  <div>
    <h1>Network Interfaces</h1>
    <div v-for="interfaceName in interfaces" :key="interfaceName">
      {{ interfaceName }}
    </div>
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
