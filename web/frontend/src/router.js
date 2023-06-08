import { createRouter, createWebHistory } from "vue-router";
import MainInterfaceForm from "./components/MainInterface.vue";
import TrafficForm from "./components/Traffic.vue";
import AttackForm from "./components/Attack.vue";
import TimetableForm from "./components/Timetable.vue";

const routes = [
  {
    path: "/interface",
    component: MainInterfaceForm,
  },
  {
    path: "/traffic",
    component: TrafficForm,
  },
  {
    path: "/attack",
    component: AttackForm,
  },
  {
    path: "/timetable",
    component: TimetableForm,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
