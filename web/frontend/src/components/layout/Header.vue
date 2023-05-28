<template>
  <div>
    <b-navbar
      toggleable="lg"
      type="success"
      variant="white"
      class="navbar-custom"
    >
      <b-navbar-brand @click="$router.push('/main')"
        ><img src="../../image/ninjalogo.png" alt="NinJaDle Logo"
      /></b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item @click="$router.push('/traffic')"
            ><img src="../../image/logo_traffic.png" alt="Traffic Image"
          /></b-nav-item>
          <b-nav-item @click="$router.push('/attack')"
            ><img src="../../image/logo_attack.png" alt="Attack Image"
          /></b-nav-item>
          <b-nav-item @click="$router.push('/timetable')"
            ><img src="../../image/logo_timetable.png" alt="Timetable Image"
          /></b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto justify-content-end">
          <b-nav-item-dropdown right>
            <template #button-content>
              <img src="../../image/usericon.png" alt="User Image" />
            </template>
            <b-dropdown-item href="#">Profile</b-dropdown-item>
            <b-dropdown-item @click="$router.push('/login')"
              >Sign In</b-dropdown-item
            >
            <b-dropdown-item href="#">Sign Out</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
export default {
  name: "HeaderForm",
};
</script>

<style scoped>
.navbar-custom {
  background-color: #146c94 !important;
  color: white !important;
}
</style>
