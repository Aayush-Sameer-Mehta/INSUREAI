import React from "react";
import styles from "../../../styles/components.module.css";

export const SearchBar = ({
 placeholder = "Search...",
 value = "",
 onChange,
 onClear,
 className = "",
}) => {
 return (
 <div className={`${styles.searchBar} ${className}`}>
 <input
 type="text"
 placeholder={placeholder}
 value={value}
 onChange={(e) => onChange(e.target.value)}
 className={styles.searchInput}
 />
 {value && (
 <button
 className={styles.clearBtn}
 onClick={() => {
 onChange("");
 onClear?.();
 }}
 title="Clear search"
 >
 ✕
 </button>
 )}
 </div>
 );
};

export default SearchBar;
