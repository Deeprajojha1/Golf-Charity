import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { authAPI } from './authAPI'

export const register = createAsyncThunk('auth/register', async (payload) => {
  return await authAPI.register(payload)
})

export const login = createAsyncThunk('auth/login', async (payload) => {
  return await authAPI.login(payload)
})

export const fetchMe = createAsyncThunk('auth/me', async () => {
  return await authAPI.me()
})

export const logout = createAsyncThunk('auth/logout', async () => {
  return await authAPI.logout()
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    status: 'idle',
    error: null,
    hydrated: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.hydrated = true
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error
        state.hydrated = true
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.hydrated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error
        state.hydrated = true
      })
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.hydrated = true
      })
      .addCase(fetchMe.rejected, (state) => {
        state.status = 'idle'
        state.hydrated = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.status = 'idle'
        state.error = null
        state.hydrated = true
      })
  },
})

export default authSlice.reducer
