import { apiClient } from './apiClient.js';

function extractList(data, key) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray(data[key])) return data[key];
  if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
  if (data && typeof data === 'object') return Object.values(data);
  return [];
}

export const chatService = {
  async _resolveConversationId(conversationId) {
    if (conversationId > 0) return conversationId;
    const teamId = -conversationId;
    try {
      const data = await apiClient.get('chat/conversations');
      const conversations = extractList(data, 'conversations');
      const found = conversations.find(c => c.type === 'team' && c.team_id === teamId && c.id > 0);
      if (found) return found.id;
    } catch (e) {
      // ignore
    }
    return conversationId; // fallback to negative, likely will fail backend
  },

  async getConversations() {
    try {
      const data = await apiClient.get('chat/conversations');
      const conversations = extractList(data, 'conversations');
      
      if (conversations.length === 0) {
        // Fallback for team chats
        const teamsData = await apiClient.get('teams');
        const teams = extractList(teamsData, 'teams');
        return teams.map(team => ({
          id: -team.id,
          type: 'team',
          teamId: team.id,
          name: team.name || 'Team Chat',
          avatarUrl: team.avatar_url || team.avatarUrl,
          members: extractList(team, 'members'),
          updatedAt: team.updated_at || team.updatedAt,
        }));
      }
      return conversations;
    } catch (error) {
      // If endpoint fails, try the fallback
      const teamsData = await apiClient.get('teams');
      const teams = extractList(teamsData, 'teams');
      return teams.map(team => ({
        id: -team.id,
        type: 'team',
        teamId: team.id,
        name: team.name || 'Team Chat',
        avatarUrl: team.avatar_url || team.avatarUrl,
        members: extractList(team, 'members'),
        updatedAt: team.updated_at || team.updatedAt,
      }));
    }
  },

  async getMessages(conversationId) {
    if (!conversationId) return [];
    const resolvedId = await this._resolveConversationId(conversationId);
    try {
      const data = await apiClient.get(`chat/conversations/${resolvedId}/messages`);
      return extractList(data, 'messages');
    } catch (e) {
      return [];
    }
  },

  async sendMessage(conversationId, body) {
    const resolvedId = await this._resolveConversationId(conversationId);
    const data = await apiClient.post(`chat/conversations/${resolvedId}/messages`, { body });
    return data?.message ?? data;
  },

  async startPrivateChat(userId) {
    const data = await apiClient.post(`chat/private/${userId}`);
    return data?.conversation ?? data;
  },

  async markConversationRead(conversationId) {
    const resolvedId = await this._resolveConversationId(conversationId);
    try {
      await apiClient.post(`chat/conversations/${resolvedId}/read`);
    } catch (e) {
      // ignore
    }
  },

  async deleteMessage(messageId) {
    // Attempt to delete message via API
    await apiClient.delete(`chat/messages/${messageId}`);
  },
};
