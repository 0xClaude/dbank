import styles from "./Navbar.module.css";
import { connectWeb } from "../../connections/connect-blockchain";
import { useContext } from "react";
import { Context } from "@/pages";

export default function Navbar() {

    const { loading, setLoading, connected, setConnected, blacklist, admin, setAdmin, address } = useContext(Context);

    const connection = async () => {
        setLoading(true);
        setConnected(true);
        try {
            await connectWeb();
        } catch (error) {
            console.log("Error");
        }
        setLoading(false);
    };

    const disconnect = () => {
        setConnected(false);
    };

    const shortAddress = (addrStr) => {
        if (addrStr.length <= 8) {
            return addrStr;
        }
        return addrStr.slice(0, 4) + "..." + addrStr.slice(-4);
    };

    return (
        <>
            <div className={styles.navbar}>
                <h3><span className={styles.highlight}>De</span>centralised Bank</h3>
                {loading && <p>Please wait ...</p>}
                {!loading && blacklist && <p>Banned</p>}
                {!loading && !connected && !blacklist && <span onClick={connection} className={styles.login}>Connect Wallet</span>}
                {!loading && connected && !blacklist && <span onClick={disconnect} className={styles.login}>{shortAddress(address)}</span>}

            </div>
        </>
    )
}