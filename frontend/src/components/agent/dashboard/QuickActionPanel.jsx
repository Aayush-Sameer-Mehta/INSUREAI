import React from "react";
import { Button } from "../../common/Button";
import styles from "../../../styles/components.module.css";

const QuickActionPanel = ({ actions = [] }) => {
 return (
 <div className={styles.quickActionPanel}>
 <h3>Quick Actions</h3>
 <div className={styles.actionGrid}>
 {actions.map((action, idx) => (
 <a
 key={idx}
 href={action.link}
 className={styles.actionCard}
 onClick={(e) => {
 if (action.onClick) {
 e.preventDefault();
 action.onClick();
 }
 }}
 >
 <div className={styles.actionIcon}>{action.icon}</div>
 <div className={styles.actionTitle}>{action.title}</div>
 </a>
 ))}
 </div>
 </div>
 );
};

export default QuickActionPanel;
