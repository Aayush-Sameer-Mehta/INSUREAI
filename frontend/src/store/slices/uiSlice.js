import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
 name: "ui",
 initialState: {
 sidebarOpen: true,
 confirmDialog: null,
 searchOpen: false,
 },
 reducers: {
 toggleSidebar(state) {
 state.sidebarOpen = !state.sidebarOpen;
 },
 showConfirm(state, action) {
 state.confirmDialog = action.payload;
 },
 hideConfirm(state) {
 state.confirmDialog = null;
 },
 toggleSearch(state) {
 state.searchOpen = !state.searchOpen;
 },
 setSearchOpen(state, action) {
 state.searchOpen = action.payload;
 },
 },
});

export const { toggleSidebar, showConfirm, hideConfirm, toggleSearch, setSearchOpen } = uiSlice.actions;
export default uiSlice.reducer;
