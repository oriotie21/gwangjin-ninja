<template>
  <div>
    <div>
      <p></p>
    </div>
    <div class="centered">
      <h1><b>Network Interfaces</b></h1>
    </div>
    <div>
      <p></p>
    </div>
    <div style="display: flex; justify-content: center">
      <table class="table table-striped table-bordered" style="width: 600px">
        <thead>
          <tr>
            <th style="text-align: center">Interface Name</th>
            <th style="text-align: center">Use</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center">eth0</td>
            <td style="text-align: center"><b>O</b></td>
          </tr>
          <tr>
            <td style="text-align: center">lo</td>
            <td style="text-align: center"><b>X</b></td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- <h3 v-for="interfaceName in interfaces" :key="interfaceName">
      <b>- {{ interfaceName }}</b>
    </h3> -->
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

<style>
.centered {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
