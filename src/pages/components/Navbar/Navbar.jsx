import NightsStayIcon from '@mui/icons-material/NightsStay';
import { Switch } from "@mui/material";
import { connectWeb } from "../../connections/connect-blockchain";
import styles from "./Navbar.module.css";

export default function Navbar(props) {


    const connection = async () => {
        props.dispatch({ type: "setLoading", payload: true });
        props.dispatch({ type: "setConnected", payload: true });
        try {
            await connectWeb();
        } catch (error) {
            console.log(error);
            props.dispatch({ type: "setConnected", payload: false });
        }
        props.dispatch({ type: "setLoading", payload: false });
    };

    const disconnect = () => {
        props.dispatch({ type: "setConnected", payload: false });
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
        props.dispatch({ type: "setConnected", payload: !props.state.dark });
    };


    return (
        <>
            <div className={styles.navbar}>
                <div>
                    <h3><span className={styles.highlight}>De</span>centralised Bank</h3>
                </div>
                <div className={styles.rightbar}>
                    {props.state.connected && props.state.address && !props.state.blacklist && (
                        <p>Balance: {shortBalance(props.state.balance)}</p>
                    )}
                    <div className={styles.colormode}>
                        <NightsStayIcon color="primary" />
                        <Switch onChange={changeTheme} />
                    </div>
                    <div>
                        {props.state.loading && <p>Please wait ...</p>}
                        {!props.state.loading && props.state.blacklist && <span className={styles.login}>Banned</span>}
                        {!props.state.loading && !props.state.connected && !props.state.blacklist && <span onClick={connection} className={styles.login}>Connect Wallet</span>}
                        {!props.state.loading && props.state.connected && !props.state.blacklist && <span onClick={disconnect} className={styles.login}>{shorter(props.state.address)}</span>}
                    </div>
                </div>
            </div>
        </>
    )
}