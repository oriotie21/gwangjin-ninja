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
          <tr v-for="i in this.interfaces" :key="i.name">
            <td style="text-align: center">{{ i }}</td>
            <td style="text-align: center">
              <b><span v-if="getInterfaceUse(i) === 'O'"> O</span></b>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import yaml from "js-yaml";

export default {
  data() {
    return {
      interfaces: [],
      configData: null,
    };
  },
  mounted() {
    this.fetchInterfaces();
    this.fetchConfigData();
  },
  methods: {
    fetchInterfaces() {
      axios
        .get("http://localhost:8080/api/networkInterfaces")
        .then((response) => {
          this.interfaces = response.data;
          console.log(this.interfaces);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    fetchConfigData() {
      axios
        .get("/api/detector/config")
        .then((response) => {
          this.configData = yaml.load(response.data);
          console.log(this.configData.interfaces);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    getInterfaceUse(interfaceName) {
      if (this.configData && this.configData.interfaces[0]) {
        const interfaceConfig = this.configData.interfaces[0] === interfaceName;
        console.log(interfaceConfig);
        if (interfaceConfig) {
          return "O";
        }
      }
      return "";
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
