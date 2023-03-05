import NightsStayIcon from '@mui/icons-material/NightsStay';
import { Switch } from "@mui/material";
import styles from "./Navbar.module.css";

import { Context } from '@/pages';
import { useContext, useEffect, useState } from 'react';

export default function Navbar() {

    const { state, dispatch } = useContext(Context);
    const [button, setButton] = useState(null);

    const connectToBlockchain = async () => {
        if (window.ethereum) {
            const connection = await window.ethereum.request({ method: "eth_requestAccounts" });
            return connection;
        }
    }

    const connection = async () => {
        dispatch({ type: "setLoading", payload: true });
        dispatch({ type: "setConnected", payload: true });
        try {
            const accounts = await connectToBlockchain();
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

    const disconnect = () => {
        dispatch({ type: "setConnected", payload: false });
        dispatch({ type: "setUserWalletAddress", payload: null });
        dispatch({ type: "setUserWalletBalance", payload: 0 });
        dispatch({ type: "setUserIsBlacklisted", payload: false });
        dispatch({ type: "setUserIsAdmin", payload: false });
        dispatch({ type: "setUserIsOwner", payload: false });
    };

    const showBalance = () => {
        if (state.connected && state.address && !state.blacklist) {
            return `<p>Balance: ${shortBalance(state.balance)}</p>`;
        }
    }

    const shorter = (addrStr) => {
        if (addrStr.length <= 8) {
            return addrStr;
        }
        return addrStr.slice(0, 4) + "..." + addrStr.slice(-4);
    };

    const shortBalance = (amount) => {
        return Number(amount).toFixed(2);
    }

    const changeTheme = () => {
        dispatch({ type: "setDark", payload: !state.dark });
    };

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
            setButton(<span onClick={disconnect} className={styles.login}>{shorter(state.userWalletAddress)}</span>);
        }
    }, [state.userWalletAddress]);


    return (
        <div className={styles.navbar}>
            <div>
                <h3><span className={styles.highlight}>De</span>centralised Bank</h3>
            </div>
            <div className={styles.rightbar}>
                {showBalance()}
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