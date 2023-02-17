import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Head from "next/head";
import { useEffect, useMemo, useReducer } from "react";
import Main from "./components/Main/Main";
import Navbar from "./components/Navbar/Navbar";

// Initializing the state and the useReducer hook

const initialState = {
  loading: false,
  connected: false,
  address: undefined,
  balance: 0,
  contractBalance: 0,
  owner: false,
  admin: false,
  blacklist: false,
  dark: false
}

const reducer = (state, action) => {
  switch (action.type) {
    case "setLoading":
      return { ...state, loading: action.payload };
    case "setConnected":
      return { ...state, connected: action.payload };
    case "setAddress":
      return { ...state, address: action.payload };
    case "setBalance":
      return { ...state, balance: action.payload };
    case "setContractBalance":
      return { ...state, contractBalance: action.payload };
    case "setOwner":
      return { ...state, owner: action.payload };
    case "setAdmin":
      return { ...state, admin: action.payload };
    case "setBlacklist":
      return { ...state, blacklist: action.payload };
    case "setDark":
      return { ...state, dark: action.payload };
    default:
      throw new Error(`Received: ${action.type}`);
  }
}

export default function App() {

  const [state, dispatch] = useReducer(reducer, initialState);
  const reduceProps = { state, dispatch };

  const theme = useMemo(() => createTheme({
    palette: {
      mode: state.dark ? 'dark' : 'light',
    },
  }),
    [state.dark],
  );


  useEffect(() => {
    const connectWallet = async () => {
      dispatch({ type: "setLoading", payload: true });
      const account = await ethereum.request({ method: "eth_accounts" });
      if (account.length > 0) {
        dispatch({ type: "setAddress", payload: account[0] });
        dispatch({ type: "setConnected", payload: true });
      }
      dispatch({ type: "setLoading", payload: false });
    }

    connectWallet();

    ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        dispatch({ type: "setConnected", payload: true });
        dispatch({ type: "setAddress", payload: accounts[0] });
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
        <Navbar {...reduceProps} />
        <Main {...reduceProps} />
      </ThemeProvider>
    </>
  )
}