import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Select } from '../../components/ui/FormField.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { TaskFilters } from '../../components/task/TaskFilters.jsx';
import { TaskList } from '../../components/task/TaskList.jsx';
import { TaskMutationModals } from '../../components/task/TaskMutationModals.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useGroups } from '../../hooks/useGroups.js';
import { useGroupTasks, useTaskMutations } from '../../hooks/useTasks.js';
import { useTaskModals } from '../../hooks/useTaskModals.js';
import { useFilterStore } from '../../store/filterStore.js';
import { filterTasks } from '../../utils/task.js';
import { useState } from 'react';

export function GroupTasksPage() {
  const { user } = useAuth();
  const [selectedGroupId, setSelectedGroupId] = useState('all');
  const modals = useTaskModals('group');
  const filters = useFilterStore((state) => state.group);
  const setFilter = useFilterStore((state) => state.setGroupFilter);
  const { data: groups = [] } = useGroups();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useGroupTasks(selectedGroupId);
  const { toggleTask, isPending } = useTaskMutations();
  const tasks = data?.pages.flatMap((page) => page.todos) || [];
  const filteredTasks = filterTasks(tasks, filters, groups);

  return (
    <>
      <PageHeader
        title="Group Tasks"
        description="Manage team tasks and assign work to group members."
        actions={
          <Button onClick={modals.openCreate}>
            <Plus className="h-4 w-4" />
            Add group task
          </Button>
        }
      />
      <div className="mb-4 max-w-sm">
        <Select value={selectedGroupId} onChange={(event) => setSelectedGroupId(event.target.value)}>
          <option value="all">All groups</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </Select>
      </div>
      <TaskFilters filters={filters} onChange={setFilter} placeholder="Search group tasks" />
      <TaskList
        tasks={filteredTasks}
        loading={isLoading}
        actions={{
          onOpen: modals.openDetail,
          onEdit: modals.openEdit,
          onDelete: modals.openDelete,
          onToggle: (task) => toggleTask({ task, user, completed: !task.isCompleted }),
          loading: isPending,
        }}
      />
      {hasNextPage && (
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" loading={isFetchingNextPage} onClick={() => fetchNextPage()}>
            Load More Tasks
          </Button>
        </div>
      )}
      <TaskMutationModals state={modals} mode="group" selectedGroupId={selectedGroupId === 'all' ? '' : selectedGroupId} />
    </>
  );
}
