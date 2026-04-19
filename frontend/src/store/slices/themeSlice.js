import { createSlice } from "@reduxjs/toolkit";

const saved = localStorage.getItem("insureai_dark") === "true";
if (saved) document.documentElement.classList.add("dark");

const themeSlice = createSlice({
 name: "theme",
 initialState: { darkMode: saved },
 reducers: {
 toggleDark(state) {
 state.darkMode = !state.darkMode;
 document.documentElement.classList.toggle("dark", state.darkMode);
 localStorage.setItem("insureai_dark", String(state.darkMode));
 },
 setDarkMode(state, action) {
 state.darkMode = action.payload;
 document.documentElement.classList.toggle("dark", action.payload);
 localStorage.setItem("insureai_dark", String(action.payload));
 },
 },
});

export const { toggleDark, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer;
