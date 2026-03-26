import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { charityAPI } from './charityAPI'

export const fetchCharities = createAsyncThunk(
  'charity/fetchCharities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await charityAPI.list()
      console.log('Charities fetched:', response)
      return response
    } catch (error) {
      console.error('Failed to fetch charities:', error)
      return rejectWithValue(error.message || 'Failed to fetch charities')
    }
  },
)

const charitySlice = createSlice({
  name: 'charity',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCharities.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCharities.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.charities || []
        console.log('Charities state updated:', state.items)
      })
      .addCase(fetchCharities.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to fetch charities'
        console.error('Charities fetch failed:', state.error)
      })
  },
})

export default charitySlice.reducer

