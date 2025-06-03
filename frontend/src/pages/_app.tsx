import { store } from "@/config/redux/store"
import "@/styles/globals.css";
import { Metadata } from "next";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";

export const metadata : Metadata={
  title: "LinkedIn",
  description: "LinkedIn",
  icons:{
    icon: "/images/p1.jpg"
  }
}

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  </>
}
