import styles from "./Navbar.module.css";
import { connectWeb } from "../../connections/connect-blockchain";
import { useContext } from "react";
import { Context } from "@/pages";
import { Switch, stepConnectorClasses } from "@mui/material";
import NightsStayIcon from '@mui/icons-material/NightsStay';
import { Input } from "@mui/material";
import { Box } from "@mui/material";
import Search from "@mui/icons-material/Search";

export default function Navbar() {

    const { loading, setLoading, connected, setConnected, blacklist, admin, setAdmin, address, dark, setDark } = useContext(Context);

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

    const shortAddress = (addrStr) => {
        if (addrStr.length <= 8) {
            return addrStr;
        }
        return addrStr.slice(0, 4) + "..." + addrStr.slice(-4);
    };

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
                    {!loading && connected && !blacklist && (
                        <div className={styles.search}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                                <Search color="primary" />
                                <Input>
                                </Input>
                            </Box>
                        </div>
                    )
                    }
                    <div className={styles.colormode}>
                        <NightsStayIcon color="primary" />
                        <Switch onChange={changeTheme} />
                    </div>
                    <div>
                        {loading && <p>Please wait ...</p>}
                        {!loading && blacklist && <span className={styles.login}>Banned</span>}
                        {!loading && !connected && !blacklist && <span onClick={connection} className={styles.login}>Connect Wallet</span>}
                        {!loading && connected && !blacklist && <span onClick={disconnect} className={styles.login}>{shortAddress(address)}</span>}
                    </div>
                </div>
            </div>
        </>
    )
}