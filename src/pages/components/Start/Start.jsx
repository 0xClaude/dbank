import { Context } from "@/pages";
import { useContext } from "react";

import BlacklistScreen from "../Screens/BlacklistScreen/BlacklistScreen";
import AdminScreen from "../Screens/AdminScreen/AdminScreen";
import OwnerScreen from "../Screens/OwnerScreen/OwnerScreen";
import UserScreen from "../Screens/UserScreen/UserScreen";

import styles from "./Start.module.css";

function Start() {
    const { state } = useContext(Context);
    return (
        <>
            <div className={styles.welcome}>
                {state.error !== null && (
                    <div className={styles.error}>
                        {state.error}
                    </div>
                )}
                {state.success !== null && (
                    <div className={styles.success}>
                        {state.success}
                    </div>
                )}
                {state.loading && <p>Please wait</p>}
                {!state.isConnected && <p>Please connect your wallet</p>}
                {state.userIsBlacklisted && <BlacklistScreen />}
                {state.userIsOwner && <OwnerScreen />}
                {state.userIsAdmin && <AdminScreen />}
                <UserScreen />
            </div>
        </>
    )
}

export default Start;