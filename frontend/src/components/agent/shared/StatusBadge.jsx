import React from "react";
import styles from "../../../styles/components.module.css";

export const Badge = ({ color = "gray", children, variant = "solid" }) => {
 const colorClass = {
 green: "badge-green",
 red: "badge-red",
 yellow: "badge-yellow",
 blue: "badge-blue",
 gray: "badge-gray",
 purple: "badge-purple",
 orange: "badge-orange",
 }[color];

 const variantClass = {
 solid: "badge-solid",
 outline: "badge-outline",
 light: "badge-light",
 }[variant];

 return (
 <span
 className={`${styles.badge} ${styles[colorClass]} ${styles[variantClass]}`}
 >
 {children}
 </span>
 );
};

export default Badge;
