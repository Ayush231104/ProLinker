import axios from "axios";

// export const BASE_URL = "https://prolinker-qs8c.onrender.com/";



export const clientServer = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  // baseURL: BASE_URL,
});
