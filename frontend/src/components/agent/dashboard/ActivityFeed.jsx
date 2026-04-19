import React from "react";
import styles from "../../../styles/components.module.css";

const ActivityFeed = ({ activities = [] }) => {
 if (!activities || activities.length === 0) {
 return (
 <div className={styles.activityFeed}>
 <h3>Recent Activities</h3>
 <div className={styles.emptyActivities}>No recent activities</div>
 </div>
 );
 }

 return (
 <div className={styles.activityFeed}>
 <h3>Recent Activities</h3>
 <div className={styles.activityList}>
 {activities.map((activity, idx) => (
 <div key={idx} className={styles.activityItem}>
 <div className={styles.activityIcon}>
 {getActivityIcon(activity.type)}
 </div>
 <div className={styles.activityContent}>
 <p className={styles.activityTitle}>{activity.title}</p>
 <p className={styles.activityDescription}>
 {activity.description}
 </p>
 <span className={styles.activityTime}>
 {formatTime(activity.timestamp)}
 </span>
 </div>
 {activity.status && (
 <span
 className={`${styles.activityStatus} ${
 styles[`status-${activity.status.toLowerCase()}`]
 }`}
 >
 {activity.status}
 </span>
 )}
 </div>
 ))}
 </div>
 </div>
 );
};

const getActivityIcon = (type) => {
 const icons = {
 policy: "📋",
 claim: "📬",
 client: "👤",
 payment: "💰",
 message: "💬",
 document: "📄",
 approval: "✓",
 };
 return icons[type] || "●";
};

const formatTime = (timestamp) => {
 if (!timestamp) return "Just now";

 const date = new Date(timestamp);
 const now = new Date();
 const diffMs = now - date;
 const diffMins = Math.floor(diffMs / 60000);

 if (diffMins < 1) return "Just now";
 if (diffMins < 60) return `${diffMins}m ago`;

 const diffHours = Math.floor(diffMins / 60);
 if (diffHours < 24) return `${diffHours}h ago`;

 const diffDays = Math.floor(diffHours / 24);
 if (diffDays < 7) return `${diffDays}d ago`;

 return date.toLocaleDateString();
};

export default ActivityFeed;
