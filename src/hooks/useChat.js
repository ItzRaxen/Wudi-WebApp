import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chatService.js';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatService.getConversations(),
  });
}

export function useMessages(conversationId) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => chatService.getMessages(conversationId),
    enabled: Boolean(conversationId),
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, body }) => chatService.sendMessage(conversationId, body),
    onSuccess: (newMessage, { conversationId }) => {
      // Optimistically update or invalidate
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useStartPrivateChat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId) => chatService.startPrivateChat(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (conversationId) => chatService.markConversationRead(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId) => chatService.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}
