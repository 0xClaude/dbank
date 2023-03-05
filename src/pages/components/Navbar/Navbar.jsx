import NightsStayIcon from '@mui/icons-material/NightsStay';
import { Switch } from "@mui/material";
import styles from "./Navbar.module.css";

import { Context } from '@/pages';
import { useContext, useEffect, useState } from 'react';

export default function Navbar() {

    const { state, dispatch } = useContext(Context);
    const [button, setButton] = useState(null);

    // Helper function to get all the accounts in the wallet
    const getAllAccounts = async () => {
        if (window.ethereum) {
            const connection = await window.ethereum.request({ method: "eth_requestAccounts" });
            return connection;
        }
    }

    // Upon clicking the "Connect" button, try to connect wallet
    const connection = async () => {
        dispatch({ type: "setLoading", payload: true });
        dispatch({ type: "setConnected", payload: true });
        try {
            const accounts = await getAllAccounts();
            if (accounts.length > 0) {
                dispatch({ type: "setUserWalletAddress", payload: accounts[0] });
            } else {
                dispatch({ type: "setUserWalletAddress", payload: null });
                dispatch({ type: "setConnected", payload: false });
                return;
            }
        } catch (error) {
            dispatch({ type: "setConnected", payload: false });
        }
        dispatch({ type: "setLoading", payload: false });
    };

    // When disconnecting the wallet, change the state for all fields
    const disconnect = () => {
        dispatch({ type: "setConnected", payload: false });
        dispatch({ type: "setUserWalletAddress", payload: null });
        dispatch({ type: "setUserWalletBalance", payload: 0 });
        dispatch({ type: "setUserIsBlacklisted", payload: false });
        dispatch({ type: "setUserIsAdmin", payload: false });
        dispatch({ type: "setUserIsOwner", payload: false });
    };

    // Shorten the address to only show the first and last four letters
    const shorterAddress = (addrStr) => {
        if (addrStr.length <= 8) {
            return addrStr;
        }
        return addrStr.slice(0, 4) + "..." + addrStr.slice(-4);
    };

    // Show a smaller balancer
    const formatBalance = (amount) => {
        return Number(amount).toFixed(2);
    }

    // Change the theme to/from dark
    const changeTheme = () => {
        dispatch({ type: "setDark", payload: !state.dark });
    };

    // Upon changing the wallet, change the button, too.
    useEffect(() => {
        if (!state.isConnected) {
            setButton(<span onClick={connection} className={styles.login}>Connect Wallet</span>);
        }
        else if (state.loading) {
            setButton(<p>Please wait</p>);
        }
        else if (state.blacklist) {
            setButton(<p>You are blacklisted</p>);
        }
        else {
            setButton(<span onClick={disconnect} className={styles.login}>{shorterAddress(state.userWalletAddress)}</span>);
        }
    }, [state.userWalletAddress]);


    return (
        <div className={styles.navbar}>
            <div>
                <h3><span className={styles.highlight}>De</span>centralised Bank</h3>
            </div>
            <div className={styles.rightbar}>
                {!state.loading && state.isConnected && !state.userIsBlacklisted && formatBalance(state.web3Interface.utils.fromWei(String(state.userWalletBalance)))} Eth
                <div className={styles.colormode}>
                    <NightsStayIcon color="primary" />
                    <Switch onChange={changeTheme} />
                </div>
                <div>
                    {button}
                </div>
            </div>
        </div>
    )
}