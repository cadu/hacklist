import '../styles/globals.css'
import { ConnectionContextProvider } from "../components/ConnectionContext";
import { SpinnerContextProvider } from "../context/SpinnerContext";

function MyApp({ Component, pageProps }) {
  return (
    <SpinnerContextProvider>
      <ConnectionContextProvider>
        <Component {...pageProps} />
      </ConnectionContextProvider>
    </SpinnerContextProvider>
  );
};

export default MyApp