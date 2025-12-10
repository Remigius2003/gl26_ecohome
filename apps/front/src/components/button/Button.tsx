import { Component, JSX } from "solid-js";
import styles from "./Button.module.css";

type ButtonProps = {
    variant?: "primary" | "secondary" | "success";
    disabled?: boolean;
    onClick?: () => void;
    children?: JSX.Element;
};

const Button: Component<ButtonProps> = (props) => {
    const variantClass = styles[props.variant || "primary"];
    return (
        <button
            class={`${styles.btn} ${variantClass}`}
            onClick={props.onClick}
            disabled={props.disabled}
        >
            {props.children}
        </button>
    );
};

export default Button;
