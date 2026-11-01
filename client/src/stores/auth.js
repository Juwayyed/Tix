import { defineStore } from "pinia";
import { axiosInstance } from "@/plugins/axios";
import router from "@/router";
import Cookies from "js-cookie";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: Cookies.get("token") || null,
    loading: false,
    error: null,
    success: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    async login(credentials) {
      if (this.loading) return;
      this.loading = true;
      this.error = null;

      try {
        const response = await axiosInstance.post("/login", credentials);
        const token = response.data.data.token;
        const user = response.data.data.user;

        Cookies.set("token", token);
        this.token = token;
        this.user = user;
        this.success = response.data.message;

        if (user.role === "admin") {
          router.push({ name: "admin.dashboard" });
        } else {
          router.push({ name: "app.dashboard" });
        }
      } catch (error) {
        console.error("Login error:", error);
        this.error =
          error.response?.data?.message || error.message || "Unauthorized";
      } finally {
        this.loading = false;
      }
    },

    async register(credentials) {
      this.loading = true;
      this.error = null;

      try {
        await axiosInstance.get("/../sanctum/csrf-cookie");

        const response = await axiosInstance.post("/register", credentials);
        const token = response.data.data.token;
        const user = response.data.data.user;

        Cookies.set("token", token);
        this.token = token;
        this.user = user;
        this.success = response.data.message;

        router.push({ name: "app.dashboard" });
      } catch (error) {
        this.error = error.response?.data?.message || "Registration failed";
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.loading = true;
      try {
        await axiosInstance.post("/logout");
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        Cookies.remove("token");
        this.token = null;
        this.user = null;
        router.push({ name: "login" });
        this.loading = false;
      }
    },

    async checkAuth() {
      if (this.user) return;
      this.loading = true;
      try {
        const response = await axiosInstance.get("/user");
        this.user = response.data.data || response.data;
        console.log("User Loaded:", this.user);
      } catch (error) {
        this.user = null;
        Cookies.remove("token");
        this.token = null;
      } finally {
        this.loading = false;
      }
    },
  },
});
