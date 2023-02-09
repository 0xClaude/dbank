import styles from "./List.module.css";

export default function List(props) {

    return (
        <>
            {props.tx && props.tx.length > 0 ? (
                <ul className={styles.list}>
                    {props.tx.map((item, index) => {
                        let color = "txlist " + index % 2 === 0 ? "one" : "two";
                        console.log(color);
                        return (
                            <li key={item.id}>
                                <div className={color}>
                                    <p>{item.from}</p>
                                    <p>{item.to}</p>
                                </div>

                            </li>
                        )
                    })}
                </ul>
            ) : (
                <p>Nothing to see here</p>
            )}
        </>
    );
}