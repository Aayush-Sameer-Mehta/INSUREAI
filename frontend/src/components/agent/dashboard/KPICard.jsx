import React from "react";
import styles from "../../../styles/components.module.css";

const KPICard = ({
 title,
 value,
 change,
 icon,
 trend = "up",
 onClick,
 subtitle,
}) => {
 return (
 <div
 className={`${styles.kpiCard} ${styles[`trend-${trend}`]}`}
 onClick={onClick}
 >
 <div className={styles.kpiHeader}>
 <h3 className={styles.kpiTitle}>{title}</h3>
 {icon && <span className={styles.kpiIcon}>{getIcon(icon)}</span>}
 </div>

 <div className={styles.kpiValue}>{value}</div>

 {change !== undefined && (
 <div
 className={`${styles.kpiChange} ${
 trend === "up" ? styles.positive : styles.negative
 }`}
 >
 <span>{trend === "up" ? "↑" : "↓"}</span>
 <span>{Math.abs(change)}</span>
 <span>vs last month</span>
 </div>
 )}

 {subtitle && <p className={styles.kpiSubtitle}>{subtitle}</p>}
 </div>
 );
};

const getIcon = (iconName) => {
 const icons = {
 users: "👥",
 "file-check": "✓",
 "alert-circle": "⚠️",
 "trending-up": "📈",
 "user-plus": "👤➕",
 "plus-circle": "➕",
 "file-plus": "📄➕",
 };
 return icons[iconName] || "●";
};

export default KPICard;
