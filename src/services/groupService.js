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

  async createGroup({ name, description, maxMembers, memberEmails = [] }) {
    const data = await apiClient.post('teams', {
      name,
      description: description || null,
      max_members: maxMembers ? Number(maxMembers) : undefined,
    });
    const group = normalizeGroup(data?.team ?? data?.data ?? data);
    await Promise.all(
      memberEmails
        .filter(Boolean)
        .map((email) => groupService.addMember(group.id, email).catch(() => null)),
    );
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
};
