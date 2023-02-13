import Navbar from "./components/Navbar/Navbar";
import Main from "./components/Main/Main";
import { useState, useEffect, createContext, useMemo } from "react";
import Head from "next/head";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";


export const Context = createContext();

export default function App() {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(undefined);
  const [connected, setConnected] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [blacklist, setBlacklist] = useState(false);
  const [dark, setDark] = useState(false);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: dark ? 'dark' : 'light',
    },
  }),
    [dark],
  );

  const context = useMemo(() => { return { loading, setLoading, address, setAddress, connected, setConnected, admin, setAdmin, blacklist, setBlacklist, dark, setDark } });

  useEffect(() => {
    const connectWallet = async () => {
      setLoading(true);
      const account = await ethereum.request({ method: "eth_accounts" });
      if (account.length > 0) {
        setAddress(account[0]);
        setConnected(true);
      }
      setLoading(false);
    }
    connectWallet();

    ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        setConnected(true);
        setAddress(accounts[0]);
      }
    });

  }, []);


  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Head>
          <title>DBank3</title>
        </Head>
        <Context.Provider value={context}>
          <Navbar />
          <Main />
        </Context.Provider>
      </ThemeProvider>
    </>
  )
}