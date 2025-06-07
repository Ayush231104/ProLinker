import axios from "axios";

export const clientServer = axios.create({
  baseURL: process.env.BASE_URL,
});
