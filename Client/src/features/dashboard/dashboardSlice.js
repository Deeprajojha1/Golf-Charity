import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { dashboardAPI } from './dashboardAPI'

export const fetchDashboard = createAsyncThunk('dashboard/fetch', async () => {
  return await dashboardAPI.get()
})

export const addScore = createAsyncThunk('dashboard/addScore', async (payload) => {
  return await dashboardAPI.addScore(payload)
})

export const editScore = createAsyncThunk('dashboard/editScore', async ({ scoreId, payload }) => {
  return await dashboardAPI.updateScore(scoreId, payload)
})

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    data: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.data = action.payload.dashboard
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error
      })
      .addCase(addScore.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(addScore.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.data = action.payload.dashboard
      })
      .addCase(addScore.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error
      })
      .addCase(editScore.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(editScore.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.data = action.payload.dashboard
      })
      .addCase(editScore.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error
      })
  },
})

export default dashboardSlice.reducer
