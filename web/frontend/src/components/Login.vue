<template>
  <div v-if="state.account.id">
    <p>안녕하세요 {{ state.account.username }}님!</p>
    <router-link to="/login" class="btn btn-primary" @click="logout()">
      로그아웃
    </router-link>
  </div>
  <div v-else style="font-weight: bold; margin-left: 60px; margin-top: 20px">
    <label for="loginId">
      <span>아이디 </span>
      <input type="text" id="loginId" v-model="state.form.loginId" />
    </label>
    <br />
    <br />
    <label for="loginPw">
      <span>비밀번호 </span>
      <input type="password" id="loginPw" v-model="state.form.loginPw" />
    </label>
    <br />
    <br />
    <router-link to="/login" class="btn btn-primary" @click="submit()">
      로그인
    </router-link>
  </div>
</template>

<script>
import axios from "axios";
import { reactive } from "vue";
export default {
  name: "LoginForm",
  setup() {
    const state = reactive({
      account: {
        id: null,
        username: "",
      },
      form: {
        loginId: "",
        loginPw: "",
      },
    });

    const submit = () => {
      const args = {
        loginId: state.form.loginId,
        loginPw: state.form.loginPw,
      };
      axios
        .post("/api/account", args)
        .then((res) => {
          alert("로그인에 성공했습니다.");
          state.account = res.data;
          state.form.loginId = "";
          state.form.loginPw = "";
        })
        .catch(() => {
          alert("로그인에 실패했습니다.");
        });
    };

    const logout = () => {
      axios.delete("/api/account").then(() => {
        alert("로그아웃하였습니다.");
        state.account.id = null;
        state.account.username = "";
      });
    };

    axios.get("/api/account").then((res) => {
      state.account = res.data;
    });

    return { state, submit, logout };
  },
};
</script>
