import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import charityReducer from "../features/charity/charitySlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    charity: charityReducer,
    dashboard: dashboardReducer,
  },
});