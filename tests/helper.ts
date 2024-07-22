import axios from "axios";

export const AxiosInstance = axios.create({
  baseURL: "http://localhost:3001", //was 3000
  headers: {
    "Content-Type": "application/json",
  },
  validateStatus: () => true,
});
