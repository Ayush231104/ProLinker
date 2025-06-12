import axios from "axios";

export const BASE_URL = "https://prolinker-qs8c.onrender.com/";
// export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;


export const clientServer = axios.create({
  baseURL: BASE_URL,
});
