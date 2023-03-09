import "@fontsource/roboto";
import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Head from "next/head";

import { createContext, useEffect, useMemo, useReducer } from "react";
import Navbar from "./components/Navbar/Navbar";
import Start from "./components/Start/Start";

import { contractABI, contractAddress } from "@/pages/web3/contract";
import Web3 from "web3";

// We are using useReducer to manage the many states accross the app.
// We also use useContext to pass the props around

const initialState = {
  dark: false,
  loading: false,
  isConnected: false,
  userWalletAddress: null,
  userWalletBalance: 0,
  userIsOwner: false,
  userIsAdmin: false,
  userIsBlacklisted: false,
  web3Interface: null,
  contractAddress: null,
  contractInterface: null,
  contractBalance: 0,
  error: null,
  success: null
}

const reducer = (state, action) => {
  switch (action.type) {
    case "setDark":
      return { ...state, dark: action.payload };
    case "setLoading":
      return { ...state, loading: action.payload };
    case "setConnected":
      return { ...state, isConnected: action.payload };
    case "setUserWalletAddress":
      return { ...state, userWalletAddress: action.payload };
    case "setUserWalletBalance":
      return { ...state, userWalletBalance: action.payload };
    case "setUserIsOwner":
      return { ...state, userIsOwner: action.payload };
    case "setUserIsAdmin":
      return { ...state, userIsAdmin: action.payload };
    case "setUserIsBlacklisted":
      return { ...state, userIsBlacklisted: action.payload };
    case "setWeb3Interface":
      return { ...state, web3Interface: action.payload };
    case "setContractAddress":
      return { ...state, contractAddress: action.payload };
    case "setContractInterface":
      return { ...state, contractInterface: action.payload };
    case "setContractBalance":
      return { ...state, contractBalance: action.payload };
    case "setError":
      return { ...state, error: action.payload };
    case "setSuccess":
      return { ...state, success: action.payload };
    default:
      throw new Error(`Received: ${action.type}`);
  }
}

export const Context = createContext();

export default function App() {

  const [state, dispatch] = useReducer(reducer, initialState);

  // Handling Error messages and success messages
  const handleError = (error) => {
    dispatch({ type: "setError", payload: error });
    setTimeout(() => {
      dispatch({ type: "setError", payload: null });
    }, 2000);
  };

  const handleSuccess = (success) => {
    dispatch({ type: "setSuccess", payload: success })
    setTimeout(() => {
      dispatch({ type: "setSuccess", payload: null });
    }, 2000)
  };

  // Connect to the blockchain and store interfaces in the state
  const connect = async () => {
    dispatch({ type: "setContractAddress", payload: contractAddress });

    const web3 = new Web3("ws://127.0.0.1:7545");
    dispatch({ type: "setWeb3Interface", payload: web3 });

    const newContractInterface = new web3.eth.Contract(contractABI, contractAddress);
    dispatch({ type: "setContractInterface", payload: newContractInterface });
  }

  // Automatically connecting wallet when the component renders
  const connectWallet = async () => {
    dispatch({ type: "setLoading", payload: true });
    dispatch({ type: "setConnected", payload: false });
    const walletAccounts = await window.ethereum.request({ method: "eth_accounts" });
    if (walletAccounts.length > 0) {
      dispatch({ type: "setUserWalletAddress", payload: walletAccounts[0] });
      dispatch({ type: "setConnected", payload: true });
    }
    dispatch({ type: "setLoading", payload: false });
  }

  // Check if address is admin for the contract
  const isUserAdmin = async (address) => {
    return await state.contractInterface.methods.isAdmin(address).call();
  }

  // Check if the address is the owner of the contract
  const isUserOwner = async (address) => {
    return await state.contractInterface.methods.isOwner(address).call();
  }

  // Check the user's funds
  const checkFunds = async () => {
    // Only do so if the user has connected his wallet
    if (state.userWalletAddress) {
      try {
        const funds = await state.web3Interface.eth.getBalance(state.userWalletAddress);
        dispatch({ type: "setUserWalletBalance", payload: funds });
      } catch (error) {
        console.log(error);
      }
    }
  }

  // Check the contract balance
  const getContractBalance = async () => {
    if (state.contractInterface) {
      try {
        const funds = await state.contractInterface.methods.getBalance().call();
        dispatch({ type: "setContractBalance", payload: funds });
      } catch (error) {
        handleError(error.message);
      }
    }
  }

  // Check if the user is admin or owner and set the state accordingly
  const checkRights = async () => {
    dispatch({ type: "setUserIsOwner", payload: false });
    dispatch({ type: "setUserIsAdmin", payload: false });
    if (state.userWalletAddress) {
      if (await isUserOwner(state.userWalletAddress)) {
        dispatch({ type: "setUserIsOwner", payload: true });
      }
      if (await isUserAdmin(state.userWalletAddress)) {
        dispatch({ type: "setUserIsAdmin", payload: true });
      }
    }
  }

  // When component mounts, we should connect to the blockchain
  // Try to connect the wallet, and add a listener when the user changes wallets

  useEffect(() => {
    dispatch({ type: "setLoading", payload: true });
    connect();
    connectWallet();

    window.ethereum.on("accountsChanged", (walletAccounts) => {
      if (walletAccounts.length > 0) {
        console.log(`Changed account into ${walletAccounts}`)
        dispatch({ type: "setConnected", payload: true });
        dispatch({ type: "setUserWalletAddress", payload: walletAccounts[0] });
        checkRights();
      } else {
        dispatch({ type: "setConnected", payload: false });
        dispatch({ type: "setUserWalletAddress", payload: null });
      }
    });

    dispatch({ type: "setLoading", payload: false });
  }, []);

  // Whenever the user changes his wallet, check his rights for the dApp
  // We also check his funds and update the state
  useEffect(() => {
    checkRights();
    checkFunds();
  }, [state.userWalletAddress])

  useEffect(() => {
    getContractBalance();
  }, [state.contractInterface]);

  // Memoising state and dispatch to avoid unnecessary rendering
  const reduceProps = useMemo(() => {
    return { state, dispatch, handleSuccess, handleError }
  }, [state, dispatch]);

  // Memoising the theme to avoid unneccessary rendering
  const theme = useMemo(() => createTheme({
    palette: {
      mode: state.dark ? 'dark' : 'light',
    },
  }),
    [state.dark],
  );

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Head>
          <title>DBank3</title>
        </Head>
        <Context.Provider value={reduceProps}>
          <Navbar />
          <Start />
        </Context.Provider>
      </ThemeProvider>
    </>
  )
}