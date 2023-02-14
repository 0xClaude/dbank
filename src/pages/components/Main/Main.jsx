import styles from "./Main.module.css";
import { useContext, useEffect, useRef } from "react";
import { Context } from "@/pages";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Avatar, TextField, Button, FormControl } from "@mui/material";
import AccountCircle from '@mui/icons-material/AccountCircle';
import Box from '@mui/material/Box';

import { ABI, contractAddress } from "@/pages/web3/contract";
import Web3 from "web3";

export default function Main(props) {

    const addAddress = useRef(null);
    const removeAddress = useRef(null);
    const banAddress = useRef(null);
    const sendTo = useRef(null);
    const amount = useRef(null);

    const { loading, setLoading, address, setAddress, connected, setConnected, owner, setOwner, admin, setAdmin, blacklist, setBlacklist } = useContext(Context);

    const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    const contract = new web3.eth.Contract(ABI, contractAddress);

    useEffect(() => {
        const checkBan = async () => {
            if (address !== undefined && address !== null) {
                await contract.methods.isBlacklisted(address).call() ? setBlacklist(true) : setBlacklist(false);
                await contract.methods.isAdmin(address).call() ? setAdmin(true) : setAdmin(false);
                await contract.methods.isOwner(address).call() ? setOwner(true) : setOwner(false);
            } else {
                setOwner(false);
                setBlacklist(false);
                setAdmin(false);
            }
        }
        checkBan();
    }, [address]);

    const makeAdmin = async (e) => {
        e.preventDefault();
        await contract.methods.addAdmin(addAddress.current.value).send({ from: address });
        addAddress.current.value === address && setAdmin(true);
    }

    const removeAdmin = async (e) => {
        e.preventDefault();
        await contract.methods.removeAdmin(removeAddress.current.value).send({ from: address });
        removeAddress.current.value === address && setAdmin(false);
    }

    const addBan = async (e) => {
        e.preventDefault();
        await contract.methods.addBlacklist(banAddress.current.value).send({ from: address });
        banAddress.current.value === address && setBlacklist(true);
    }

    const sendEther = async (e) => {
        const transaction = {
            from: address,
            to: sendTo.current.value,
            value: web3.utils.toWei(amount.current.value, "ether")
        }
        const tx = await web3.eth.sendTransaction(transaction, (error, result) => {
            if (error) { console.log(error); }
            else { console.log("All went well"); }
        });
    }

    return (
        <>
            <div className={styles.main}>
                {!loading && !connected && <p>Please connect your wallet</p>}
                {loading && <p>Please wait ...</p>}
                {blacklist && (<p className={styles.banned}><RemoveCircleOutlineIcon />You are banned.</p>)}
                {!loading && !blacklist && connected && (
                    <>
                        <div className={styles.welcome}>
                            <div className={styles.topwelcome}>
                                <Avatar>
                                    <AdminPanelSettingsIcon />
                                </Avatar>
                                {owner && (
                                    <p>Welcome, owner</p>
                                )}
                                {admin && !owner && (
                                    <p>Welcome, admin</p>
                                )
                                }
                            </div>
                        </div>


                    </>
                )}
                {!loading && !blacklist && connected && owner && (
                    <div>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                            <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                            <TextField label="Address" variant="standard" inputRef={removeAddress} />
                            <Button onClick={removeAdmin}>Remove admin</Button>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                            <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                            <TextField label="Address" variant="standard" inputRef={addAddress} />
                            <Button onClick={makeAdmin}>Add admin</Button>
                        </Box>
                    </div>
                )}
                <div>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                        <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                        <TextField label="Address" variant="standard" inputRef={banAddress} />
                        <Button onClick={addBan}>Ban user</Button>
                    </Box>
                </div>

            </div>
            <hr />
            <div className={styles.transaction}>
                <h3>Send a transaction</h3>
                <TextField label="To" variant="standard" inputRef={sendTo} />
                <TextField label="Amount" variant="standard" inputRef={amount} />
                <Button onClick={sendEther}>Send</Button>
            </div>
        </>
    )
}