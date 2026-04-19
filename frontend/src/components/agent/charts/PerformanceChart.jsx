import React, { useMemo } from "react";
import styles from "../../../styles/components.module.css";

const PerformanceChart = ({ data = [], metrics = [] }) => {
 const chartData = useMemo(() => {
 if (!data || data.length === 0) {
 return [];
 }
 return data.slice(-6); // Last 6 months
 }, [data]);

 if (!chartData || chartData.length === 0) {
 return (
 <div className={styles.chartContainer}>
 <div className={styles.chartPlaceholder}>No data available</div>
 </div>
 );
 }

 const maxValue = Math.max(
 ...chartData.flatMap((item) => metrics.map((metric) => item[metric] || 0)),
 );

 return (
 <div className={styles.chartContainer}>
 <div className={styles.chartLegend}>
 {metrics.map((metric) => (
 <span key={metric} className={styles.legendItem}>
 <span
 className={styles.legendColor}
 style={{
 backgroundColor: getMetricColor(metric),
 }}
 ></span>
 {formatMetricLabel(metric)}
 </span>
 ))}
 </div>

 <div className={styles.barChart}>
 {chartData.map((item, idx) => (
 <div key={idx} className={styles.barGroup}>
 <div className={styles.bars}>
 {metrics.map((metric) => {
 const value = item[metric] || 0;
 const height = (value / maxValue) * 100;
 return (
 <div
 key={metric}
 className={styles.bar}
 style={{
 height: `${height}%`,
 backgroundColor: getMetricColor(metric),
 }}
 title={`${formatMetricLabel(metric)}: ${value}`}
 ></div>
 );
 })}
 </div>
 <span className={styles.barLabel}>
 {item.month || `M${idx + 1}`}
 </span>
 </div>
 ))}
 </div>
 </div>
 );
};

const getMetricColor = (metric) => {
 const colors = {
 policiesSold: "#3b82f6",
 earnings: "#10b981",
 clients: "#f59e0b",
 };
 return colors[metric] || "#6b7280";
};

const formatMetricLabel = (metric) => {
 const labels = {
 policiesSold: "Policies Sold",
 earnings: "Earnings",
 clients: "New Clients",
 };
 return labels[metric] || metric;
};

export default PerformanceChart;
