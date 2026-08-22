
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'



export const baseApi = createApi({
  reducerPath: 'api', 
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_BACKEND_URL,
    credentials: 'include',
  }),
  tagTypes: ['User'],
  endpoints: () => ({}),
})

export default baseApi