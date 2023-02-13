import styles from "./Main.module.css";
import { useContext, useEffect, useRef } from "react";
import { Context } from "@/pages";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Avatar } from "@mui/material";
import { ABI, contractAddress } from "@/pages/web3/contract";
import Web3 from "web3";

export default function Main(props) {

    const addAddress = useRef(null);
    const removeAddress = useRef(null);

    const { loading, setLoading, address, setAddress, connected, setConnected, admin, setAdmin, blacklist, setBlacklist } = useContext(Context);

    const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    const contract = new web3.eth.Contract(ABI, contractAddress);


    useEffect(() => {
        const checkBan = async () => {
            if (address !== undefined && address !== null) {
                await contract.methods.isBlacklisted(address).call() ? setBlacklist(true) : setBlacklist(false);
                await contract.methods.isAdmin(address).call() ? setAdmin(true) : setAdmin(false);
            } else {
                setBlacklist(false);
                setAdmin(false);
            }
        }
        checkBan();
    }, [address])

    const makeAdmin = async (e) => {
        e.preventDefault();
        await contract.methods.addAdmin(addAddress.current.value).send({ from: address });
        // TODO Add visual identifier
        window.location.reload();
    }

    const removeAdmin = async (e) => {
        e.preventDefault();
        await contract.methods.removeAdmin(removeAddress.current.value).send({ from: address });
        window.location.reload();
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
                        </div>

                        <form onSubmit={removeAdmin}>
                            <input type="text" name="address" ref={removeAddress} /><input type="submit" value="Remove admin" />
                        </form>
                    </>
                )}
                <form onSubmit={makeAdmin}>
                    <input type="text" name="address" ref={addAddress} /><input type="submit" value="Make admin" />
                </form>
            </div>
        </>
    )
}