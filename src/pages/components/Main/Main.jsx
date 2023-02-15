import { Context } from "@/pages";
import AccountCircle from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Avatar, Button, TextField } from "@mui/material";
import Box from '@mui/material/Box';
import { useContext, useEffect, useRef } from "react";
import styles from "./Main.module.css";

import { ABI, ABI2, contractAddress, vaultAddress } from "@/pages/web3/contract";
import Web3 from "web3";
import { ServerStyleSheet } from "styled-components";

export default function Main(props) {

    const addAddress = useRef(null);
    const removeAddress = useRef(null);
    const banAddress = useRef(null);
    const sendTo = useRef(null);
    const amount = useRef(null);
    const withdrawAmount = useRef(null);
    const unbanAddress = useRef(null);

    const { loading, setLoading, address, setAddress, connected, setConnected, balance, setBalance, contractBalance, setContractBalance, owner, setOwner, admin, setAdmin, blacklist, setBlacklist } = useContext(Context);

    const web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"));
    const contract = new web3.eth.Contract(ABI, contractAddress);
    const vault = new web3.eth.Contract(ABI2, vaultAddress);

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
        checkContractBalance();
        checkBalance();
    }, [address]);

    useEffect(() => {
        contract.events.adminAdded().on("data", (event) => {
            console.log(event.returnValues[0]);
        }).on("error", console.error);

        // Cleanup
        return () => {
            contract.events.adminAdded().removeAllListeners("data");
            contract.events.adminAdded().removeAllListeners("error");

        }
    }, [])

    const checkBalance = async () => {
        address !== undefined && setBalance(web3.utils.fromWei(await web3.eth.getBalance(address)));
    }

    const checkContractBalance = async () => {
        setContractBalance(await vault.methods.getBalance().call());
    }

    const makeAdmin = async () => {
        try {
            await contract.methods.addAdmin(addAddress.current.value).send({ from: address });
        } catch (error) {
            console.log(error);
        }
        addAddress.current.value === address && setAdmin(true);
    }

    const removeAdmin = async () => {
        try {
            await contract.methods.removeAdmin(removeAddress.current.value).send({ from: address });
        } catch (error) {
            if (error.reason) {
                console.log(`Error: ${error.reason}`);
            } else {
                console.log(`No message: ${error}`);
            }
        }
        removeAddress.current.value === address && setAdmin(false);
    }

    const addBan = async () => {
        try {
            await contract.methods.addBlacklist(banAddress.current.value).send({ from: address });
        } catch (error) {
            console.log(error);
        }
        banAddress.current.value === address && setBlacklist(true);
    }

    const removeBan = async () => {
        try {
            await contract.methods.removeBlacklist(unbanAddress.current.value).send({ from: address });
        } catch (error) {
            console.log(error);
        }
    }

    const sendEther = async (e) => {
        const transaction = {
            from: address,
            to: sendTo.current.value,
            value: web3.utils.toWei(amount.current.value, "ether")
        }
        try {
            await web3.eth.sendTransaction(transaction, (error, result) => {
                if (error) { console.log(error); }
                else { console.log("All went well"); }
            });
        } catch (error) {
            console.log(error);
        }
        checkContractBalance();
        checkBalance();

    }

    const withdraw = async (e) => {
        try {
            await vault.methods.withdraw(web3.utils.toWei(withdrawAmount.current.value)).send({ from: address });
        } catch (error) {
            console.log(error);
        }
        checkContractBalance();
        checkBalance();
    }

    return (
        <>
            <div className={styles.main}>
                {!loading && !connected && <p>Please connect your wallet</p>}
                {loading && <p>Please wait ...</p>}
                {blacklist && <p className={styles.banned}><RemoveCircleOutlineIcon />You are banned.</p>}
                {!loading && !blacklist && connected && !blacklist && (
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
                                {connected && !admin && !owner && (
                                    <p>Welcome to DBank</p>
                                )}
                            </div>
                        </div>


                    </>
                )}
                {!loading && !blacklist && connected && owner && (
                    <div className={styles.topwelcome}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                            <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                            <TextField label="Address" variant="standard" inputRef={addAddress} />
                            <Button onClick={makeAdmin}>Add admin</Button>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                            <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                            <TextField label="Address" variant="standard" inputRef={removeAddress} />
                            <Button onClick={removeAdmin}>Remove admin</Button>
                        </Box>
                    </div>
                )}
                {!loading && !blacklist && connected && admin || owner && (
                    <div className={styles.topwelcome}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                            <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                            <TextField label="Address" variant="standard" inputRef={banAddress} />
                            <Button onClick={addBan}>Ban user</Button>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                            <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                            <TextField label="Address" variant="standard" inputRef={unbanAddress} />
                            <Button onClick={removeBan}>Unban user</Button>
                        </Box>
                    </div>
                )}


            </div>
            {connected && !blacklist && (
                <div className={styles.transaction}>
                    <h3>Send a transaction</h3>
                    <TextField label="To" variant="standard" inputRef={sendTo} />
                    <TextField label="Amount" variant="standard" inputRef={amount} />
                    <Button onClick={sendEther}>Send</Button>
                </div>
            )}

            {connected && !blacklist && owner && (
                <div className={styles.transaction}>
                    <h3>Withdraw from contract</h3>
                    <h4>Balance: {web3.utils.fromWei(String(contractBalance))} Ether</h4>
                    <TextField label="Amount" variant="standard" inputRef={withdrawAmount} />
                    <Button onClick={withdraw}>Withdraw</Button>
                </div>
            )}

        </>
    )
}