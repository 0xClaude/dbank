import styles from "./Main.module.css";
import { useContext, useEffect } from "react";
import { Context } from "@/pages";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Avatar } from "@mui/material";
import { ABI, contractAddress } from "@/pages/web3/contract";
import Web3 from "web3";

export default function Main(props) {

    const { loading, setLoading, address, setAddress, connected, setConnected, admin, setAdmin, blacklist, setBlacklist } = useContext(Context);

    const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    const contract = new web3.eth.Contract(ABI, contractAddress);

    useEffect(() => {
        if (address !== "undefined") {
            contract.methods.isBlacklisted(address) ? setBlacklist(true) : setBlacklist(false);
            contract.methods.isAdmin(address) ? setAdmin(true) : setAdmin(false);
            console.log(address);
        } else {
            setBlacklist(false);
            setAdmin(false);
        }
    }, [address])


    const makeAdmin = () => {
        setAdmin(!admin);
    }


    return (
        <>
            <div className={styles.main}>
                {!loading && !connected && <p>Please connect your wallet</p>}
                {loading && <p>Please wait ...</p>}
                {blacklist && (<p className={styles.banned}><RemoveCircleOutlineIcon />You are banned.</p>)}
                {!loading && !blacklist && connected && admin && (
                    <>
                        <div className={styles.welcome}>
                            <div className={styles.topwelcome}>
                                <Avatar>
                                    <AdminPanelSettingsIcon />
                                </Avatar>
                                <p>Welcome, admin</p>
                            </div>
                            <div>
                                <p className={styles.button} onClick={makeAdmin}>{admin ? "Remove me as " : "Add me as "}an admin</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}