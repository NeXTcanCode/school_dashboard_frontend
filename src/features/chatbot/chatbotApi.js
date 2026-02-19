import { apiSlice } from '../../api/apiSlice';

export const chatbotApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChatbotReply: builder.mutation({
      query: (payload) => ({
        url: '/chatbot/reply',
        method: 'POST',
        body: payload,
      }),
    }),
    updateChatbotFeedback: builder.mutation({
      query: ({ messageId, feedback, expectedAnswer }) => ({
        url: `/chatbot/messages/${messageId}/feedback`,
        method: 'PATCH',
        body: { feedback, expectedAnswer },
      }),
    }),
    getChatbotInsights: builder.query({
      query: () => '/chatbot/messages/insights',
    }),
  }),
});

export const {
  useGetChatbotReplyMutation,
  useUpdateChatbotFeedbackMutation,
  useGetChatbotInsightsQuery,
} = chatbotApi;
