import { Context } from "@/pages";
import NightsStayIcon from '@mui/icons-material/NightsStay';
import { Switch } from "@mui/material";
import { useContext } from "react";
import { connectWeb } from "../../connections/connect-blockchain";
import styles from "./Navbar.module.css";

export default function Navbar() {

    const { loading, setLoading, connected, setConnected, balance, blacklist, address, dark, setDark } = useContext(Context);

    const connection = async () => {
        setLoading(true);
        setConnected(true);
        try {
            await connectWeb();
        } catch (error) {
            console.log(error);
            setConnected(false);
        }
        setLoading(false);
    };

    const disconnect = () => {
        setConnected(false);
    };

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
        setDark(() => !dark);
    };


    return (
        <>
            <div className={styles.navbar}>
                <div>
                    <h3><span className={styles.highlight}>De</span>centralised Bank</h3>
                </div>
                <div className={styles.rightbar}>
                    {connected && address && !blacklist && (
                        <p>Balance: {shortBalance(balance)}</p>
                    )}
                    <div className={styles.colormode}>
                        <NightsStayIcon color="primary" />
                        <Switch onChange={changeTheme} />
                    </div>
                    <div>
                        {loading && <p>Please wait ...</p>}
                        {!loading && blacklist && <span className={styles.login}>Banned</span>}
                        {!loading && !connected && !blacklist && <span onClick={connection} className={styles.login}>Connect Wallet</span>}
                        {!loading && connected && !blacklist && <span onClick={disconnect} className={styles.login}>{shorter(address)}</span>}
                    </div>
                </div>
            </div>
        </>
    )
}