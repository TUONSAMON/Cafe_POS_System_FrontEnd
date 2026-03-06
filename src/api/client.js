import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080",
});

// optional: global error normalization
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.response?.data ||
      err?.message ||
      "Request failed";
      console.error("API Error:", msg);
    return Promise.reject(new Error(msg));
  }
);
