import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { REFETCH_INTERVAL_MS } from '../constants/app.js';
import { groupService } from '../services/groupService.js';

export const groupKeys = {
  all: ['groups'],
  detail: (id) => ['groups', id],
};

export function useGroups() {
  return useQuery({
    queryKey: groupKeys.all,
    queryFn: groupService.getGroups,
    refetchInterval: REFETCH_INTERVAL_MS,
  });
}

export function useGroupDetails(groupId) {
  return useQuery({
    queryKey: groupKeys.detail(groupId),
    queryFn: () => groupService.getGroupDetails(groupId),
    enabled: Boolean(groupId),
    refetchInterval: REFETCH_INTERVAL_MS,
  });
}

export function useGroupMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: groupKeys.all });

  const createGroup = useMutation({
    mutationFn: groupService.createGroup,
    onSuccess: () => {
      invalidate();
      toast.success('Group created');
    },
    onError: (error) => toast.error(error.message || 'Failed to create group'),
  });

  const updateGroup = useMutation({
    mutationFn: ({ id, values }) => groupService.updateGroup(id, values),
    onSuccess: (_, variables) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(variables.id) });
      toast.success('Group updated');
    },
    onError: (error) => toast.error(error.message || 'Failed to update group'),
  });

  const deleteGroup = useMutation({
    mutationFn: groupService.deleteGroup,
    onSuccess: () => {
      invalidate();
      toast.success('Group deleted');
    },
    onError: (error) => toast.error(error.message || 'Failed to delete group'),
  });

  const addMember = useMutation({
    mutationFn: ({ groupId, email }) => groupService.addMember(groupId, email),
    onSuccess: (_, variables) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(variables.groupId) });
      toast.success('Invitation sent');
    },
    onError: (error) => toast.error(error.message || 'Failed to invite member'),
  });

  return {
    createGroup: createGroup.mutateAsync,
    updateGroup: updateGroup.mutateAsync,
    deleteGroup: deleteGroup.mutateAsync,
    addMember: addMember.mutateAsync,
    isPending:
      createGroup.isPending || updateGroup.isPending || deleteGroup.isPending || addMember.isPending,
  };
}
