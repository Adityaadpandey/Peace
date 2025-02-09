import Location from "./Locator";
import { AppProps } from "next/app";

export default function Home({ Component, pageProps }: AppProps) {
  // console.log(pageProps);
  return (
    <div>
      <Location />
      {/* <Fitness /> */}
    </div>
  );
}
