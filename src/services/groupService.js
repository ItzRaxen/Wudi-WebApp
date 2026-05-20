import { apiClient } from './apiClient.js';
import { extractListFromApiPart, normalizeGroup, normalizeTask } from '../utils/task.js';

function parseGroups(data) {
  return extractListFromApiPart(data?.teams ?? data?.data?.teams ?? data?.data ?? data).map(normalizeGroup);
}

function parseGroupDetails(data) {
  const rawTeam = data?.team ?? data?.data?.team ?? data?.data ?? data;
  const group = normalizeGroup(rawTeam);
  const members = extractListFromApiPart(data?.members ?? rawTeam?.members).map((member) => ({
    id: member.id ?? null,
    name: member.name ?? member.display_name ?? member.email ?? 'Unknown',
    email: member.email ?? member.email_address ?? null,
    avatarUrl: member.avatar_url ?? member.avatarUrl ?? null,
  }));
  const tasks = extractListFromApiPart(data?.tasks ?? rawTeam?.tasks).map((task) => normalizeTask(task, [group]));
  return { ...group, members: members.length ? members : group.members, tasks };
}

function parseInvitations(data) {
  const raw = data?.invitations ?? data?.data?.invitations ?? [];
  return extractListFromApiPart(raw).map((inv) => ({
    id: inv.id,
    name: inv.name ?? inv.team_name ?? 'Team',
    description: inv.description ?? '',
    inviterName: inv.owner?.name ?? inv.inviter?.name ?? inv.created_by_name ?? 'Unknown',
  }));
}

function createPollingSubscription(fetcher, callback, onError) {
  let active = true;
  let lastJson = '';
  const run = async () => {
    try {
      const data = await fetcher();
      const json = JSON.stringify(data);
      if (active && json !== lastJson) {
        lastJson = json;
        callback(data);
      }
    } catch (error) {
      if (active) onError?.(error);
    }
  };
  run();
  const timer = window.setInterval(run, 3000);
  return () => {
    active = false;
    window.clearInterval(timer);
  };
}

export const groupService = {
  async getGroups() {
    const data = await apiClient.get('teams');
    return parseGroups(data);
  },

  subscribeGroups(user, callback, onError) {
    return createPollingSubscription(() => groupService.getGroups(), callback, onError);
  },

  async getGroupDetails(groupId) {
    const data = await apiClient.get(`teams/${groupId}`);
    return parseGroupDetails(data);
  },

  async getInvitations() {
    const data = await apiClient.get('teams');
    return parseInvitations(data);
  },

  async acceptInvitation(teamId) {
    return apiClient.post(`teams/${teamId}/accept`);
  },

  async declineInvitation(teamId) {
    return apiClient.post(`teams/${teamId}/decline`);
  },

  async createGroup({ name, description, maxMembers, memberEmails = [], avatarFile = null }) {
    const data = await apiClient.post('teams', {
      name,
      description: description || null,
      max_members: maxMembers ? Number(maxMembers) : undefined,
    });
    const group = normalizeGroup(data?.team ?? data?.data ?? data);
    const uploads = [
      ...memberEmails
        .filter(Boolean)
        .map((email) => groupService.addMember(group.id, email).catch(() => null)),
    ];
    if (avatarFile) {
      uploads.push(groupService.uploadGroupAvatar(group.id, avatarFile).catch(() => null));
    }
    await Promise.all(uploads);
    return group;
  },

  async updateGroup(groupId, { name, description, maxMembers }) {
    const data = await apiClient.put(`teams/${groupId}`, {
      name,
      description: description || null,
      max_members: maxMembers ? Number(maxMembers) : undefined,
    });
    return normalizeGroup(data?.team ?? data?.data ?? data);
  },

  async deleteGroup(groupId) {
    return apiClient.delete(`teams/${groupId}`);
  },

  async addMember(groupId, email) {
    return apiClient.post(`teams/${groupId}/invite`, { email });
  },

  async uploadGroupAvatar(groupId, file) {
    const formData = new FormData();
    formData.append('avatar', file);
    const token = (await import('./apiClient.js')).getStoredToken();
    const { getDeviceId } = await import('./apiClient.js');
    const baseUrl = import.meta.env.VITE_API_URL ?? '';
    const normalizedBase = baseUrl.trim().endsWith('/') ? baseUrl.trim() : `${baseUrl.trim()}/`;
    const apiBase = normalizedBase.includes('/api') ? normalizedBase : `${normalizedBase}api/`;
    const response = await fetch(`${apiBase}teams/${groupId}/avatar`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: token ? `Bearer ${token.trim()}` : '',
        'X-Device-ID': getDeviceId(),
      },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to upload avatar');
    }
    return response.json();
  },
};
