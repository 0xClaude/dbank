import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Head from "next/head";
import { useEffect, useMemo, useReducer, useState } from "react";
import Main from "./components/Main/Main";
import Navbar from "./components/Navbar/Navbar";

import { ABI, ABI2, contractAddress, vaultAddress } from "@/pages/web3/contract";
import Web3 from "web3";

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

const webstate = {
  web3: undefined,
  contract: undefined,
  vault: undefined,
}

const web3reducer = (state, action) => {
  switch (action.type) {
    case "setWeb3":
      return { ...state, web3: action.payload };
    case "setContract":
      return { ...state, contract: action.payload };
    case "setVault":
      return { ...state, vault: action.payload };
    default:
      throw new Error(`Received ${action.payload}`);
  }
}

export default function App() {

  const [state, dispatch] = useReducer(reducer, initialState);
  const [web3state, web3dispatch] = useReducer(web3reducer, webstate);
  const reduceProps = { state, dispatch, web3state, web3dispatch };

  const [transactionlist, setTransactionList] = useState([]);

  const web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"));
  const contract = new web3.eth.Contract(ABI, contractAddress);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: state.dark ? 'dark' : 'light',
    },
  }),
    [state.dark],
  );

  const allAccounts = async () => {

    setTransactionList([]);

    try {
      const accounts = await web3.eth.getAccounts();
      accounts.map((item, index) => {
        console.log(`Checking for account ${item}`)
        contract.methods.checkTransfers(item).call().then(result => {
          result.length > 0 && (
            setTransactionList(previous => [...previous, result])
          );
        })
      });
      console.log(transactionlist);
    } catch (error) {
      console.error(error);
    }
  };


  const connectWallet = async () => {
    dispatch({ type: "setLoading", payload: true });
    const account = await ethereum.request({ method: "eth_accounts" });
    if (account.length > 0) {
      dispatch({ type: "setAddress", payload: account[0] });
      dispatch({ type: "setConnected", payload: true });
    }
    dispatch({ type: "setLoading", payload: false });
  }

  useEffect(() => {

    connectWallet();
    allAccounts();

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