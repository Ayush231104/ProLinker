import axios from "axios";

// export const BASE_URL = "https://prolinker-qs8c.onrender.com/";

export const BASE_URL = "http://localhost:8080";

export const clientServer = axios.create({
  baseURL: BASE_URL,
});
