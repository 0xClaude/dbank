import styles from "./Main.module.css";
import List from "../List/List";
import { useContext } from "react";
import { Context } from "@/pages";

export default function Main(props) {

    const { loading, setLoading, address, setAddress, connected, setConnected, admin, setAdmin, blacklist, setBlacklist } = useContext(Context);

    const transactions = [
        {
            id: 1,
            from: "0xClaude",
            to: "0xLaura",
            amount: "2",
            message: "<3"
        },
        {
            id: 2,
            from: "0xLaura",
            to: "0xClaude",
            amount: 5,
            message: "<33"
        }
    ];

    const makeAdmin = () => {
        setAdmin((previous) => !previous);
    }


    return (
        <>
            <div className={styles.main}>
                <div className={styles.list}>
                    {loading && <p>Please wait ...</p>}
                    {blacklist && <p>You are banned!</p>}
                    {!loading && connected && admin && !blacklist && (
                        <>
                            <p>Welcome, Admin</p>
                        </>
                    )}
                    {!loading && connected && !admin && !blacklist && (
                        <>
                            <p className={styles.button} onClick={makeAdmin}>Make me admin</p>
                        </>
                    )}
                    {!loading && connected && !blacklist && <List tx={transactions} />}
                </div>
            </div>
        </>
    )
}