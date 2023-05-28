import { createApp } from "vue";
import App from "./App.vue";
import router from "./router.js";

import BootstrapVue3 from "bootstrap-vue-3";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-3/dist/bootstrap-vue-3.css";

import PortalVue from "portal-vue";

const app = createApp(App);
app.use(router);
// Make BootstrapVue available throughout your project
app.use(BootstrapVue3);
// Optionally install the BootstrapVue icon components plugin
// app.use(IconsPlugin);
app.use(PortalVue);
app.mount("#app");
