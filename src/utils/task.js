import { PRIORITIES } from '../constants/app.js';
import { getStoredUser } from '../services/apiClient.js';
import { parseDate } from './date.js';

export function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value === 'object') return Object.values(value).filter(Boolean).map(String);
  return [];
}

export function normalizePriority(value) {
  const priority = String(value || 'medium').toLowerCase();
  return PRIORITIES.includes(priority) ? priority : 'medium';
}

export function normalizeUser(value) {
  if (!value || typeof value !== 'object') return null;
  return {
    id: value.id ?? null,
    name: value.name ?? value.display_name ?? value.email ?? 'Unknown',
    email: value.email ?? value.email_address ?? null,
    avatarUrl: value.avatar_url ?? value.avatarUrl ?? value.avatar ?? null,
  };
}

export function normalizeTask(todo, groups = []) {
  const teamId = todo.team_id ?? todo.teamId ?? null;
  const deadline = todo.deadline ?? todo.dueDate ?? todo.due_date ?? null;
  const assignedEmails = toArray(todo.assigned_emails ?? todo.assignedEmails);
  const completedBy = toArray(todo.completed_by ?? todo.completedBy);
  let isCompleted = Boolean(todo.is_completed ?? todo.completed ?? todo.isCompleted);
  
  const currentUser = getStoredUser();
  const currentUserEmail = currentUser?.email;

  if (teamId && currentUserEmail) {
    const isFullyCompleted = isCompleted;
    const myEmailChecked = completedBy.some(
      (email) => email.toLowerCase() === currentUserEmail.toLowerCase()
    );
    isCompleted = isFullyCompleted || myEmailChecked;
  }
  const group = groups.find((item) => String(item.id) === String(teamId));
  const owner = normalizeUser(todo.user);

  let canEdit = true;
  let canDelete = true;

  if (teamId && currentUser) {
    const isGroupOwner = group && (
      group.isOwner || 
      (group.owner && (
        (group.owner.id && String(group.owner.id) === String(currentUser.id)) || 
        (group.owner.email && group.owner.email === currentUser.email)
      ))
    );
    canEdit = Boolean(isGroupOwner);
    canDelete = Boolean(isGroupOwner);
  }

  return {
    id: todo.id ?? todo.apiId,
    apiId: todo.id ?? todo.apiId,
    title: todo.judul ?? todo.title ?? 'Untitled',
    description: todo.deskripsi ?? todo.description ?? '',
    priority: normalizePriority(todo.priority),
    deadline,
    dueDate: parseDate(deadline),
    isCompleted,
    status: isCompleted ? 'completed' : 'pending',
    teamId,
    groupId: teamId,
    groupName: group?.name ?? todo.team?.name ?? todo.groupName ?? null,
    type: teamId ? 'group' : 'personal',
    assignedEmails,
    assignedMembers: assignedEmails.map((email) => ({
      email,
      name: email.includes('@') ? email.split('@')[0] : email,
    })),
    completedBy,
    owner,
    canEdit,
    canDelete,
    raw: todo,
  };
}

export function normalizeGroup(team) {
  const membersRaw = Array.isArray(team.members)
    ? team.members
    : team.members && typeof team.members === 'object'
      ? Object.values(team.members)
      : [];
  const members = membersRaw.map(normalizeUser).filter(Boolean);
  const owner = normalizeUser(team.owner ?? team.user ?? team.creator);

  return {
    id: team.id,
    name: team.name ?? 'Untitled Group',
    description: team.description ?? '',
    maxMembers: team.max_members ?? team.maxMembers ?? 100,
    avatarUrl: team.avatar_url ?? team.avatarUrl ?? null,
    members,
    owner,
    isOwner: Boolean(team.is_owner ?? team.isOwner ?? team.role === 'owner'),
    raw: team,
  };
}

export function extractListFromApiPart(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && Array.isArray(value.data)) return value.data;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

export function filterTasks(tasks, filters = {}, groups = []) {
  const search = (filters.search || '').toLowerCase().trim();
  const status = filters.status || 'all';
  const priority = filters.priority || 'all';
  const groupById = new Map(groups.map((group) => [String(group.id), group]));

  return tasks
    .filter((task) => {
      if (status !== 'all' && task.status !== status) return false;
      if (priority !== 'all' && task.priority !== priority) return false;
      if (!search) return true;

      const groupName = task.groupName ?? groupById.get(String(task.teamId))?.name ?? '';
      const haystack = [
        task.title,
        task.description,
        task.priority,
        task.status,
        groupName,
        ...task.assignedEmails,
        ...task.assignedMembers.map((member) => member.name),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(search);
    })
    .sort((a, b) => {
      const aTime = a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bTime = b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
}

export function highlightText(value, keyword) {
  const text = String(value ?? '');
  const query = String(keyword ?? '').trim();
  if (!query) return text;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return text;
  return {
    before: text.slice(0, index),
    match: text.slice(index, index + query.length),
    after: text.slice(index + query.length),
  };
}
