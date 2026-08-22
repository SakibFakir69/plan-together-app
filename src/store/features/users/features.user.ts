import baseApi from "@/store/baseApi";




export interface User {
  _id: string;
  email: string;
  name: string;
  username?: string;
  phone?: string;
  locale?: string;
  authProvider: string;
  isActive: boolean;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  username?: string;
  phone?: string;
  locale?: string;
}

export interface UpdateProfileInput {
  name?: string;
  username?: string;
  phone?: string;
  locale?: string;
  password?: string;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation<{ success: boolean; data: User }, RegisterInput>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
    }),

    getUser: builder.query<{ success: boolean; data: User }, void>({
      query: () => ({
        url: '/users',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    updateUser: builder.mutation<{ success: boolean; data: User }, UpdateProfileInput>({
      query: (body) => ({
        url: '/users',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
      // optimistic update so the UI feels instant
      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          userApi.util.updateQueryData('getUser', undefined, (draft) => {
            Object.assign(draft.data, patch);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    deleteUser: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/users',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;

