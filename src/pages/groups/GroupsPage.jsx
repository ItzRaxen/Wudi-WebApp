import { Plus, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { GroupCard } from '../../components/group/GroupCard.jsx';
import { InvitationCard } from '../../components/group/InvitationCard.jsx';
import { MemberList } from '../../components/group/MemberList.jsx';
import { GroupForm } from '../../components/forms/GroupForm.jsx';
import { MemberInviteForm } from '../../components/forms/MemberInviteForm.jsx';
import { TaskList } from '../../components/task/TaskList.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { ProfilePhotoModal } from '../../components/ui/ProfilePhotoModal.jsx';
import { ListSkeleton } from '../../components/ui/Skeleton.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useGroupDetails, useGroupMutations, useGroups, useInvitations } from '../../hooks/useGroups.js';
import { useTaskMutations } from '../../hooks/useTasks.js';

import { GroupTasksPage } from '../group-tasks/GroupTasksPage.jsx';

export function GroupsPage() {
  const { user } = useAuth();
  const { data: groups = [], isLoading } = useGroups();
  const { data: invitations = [], isLoading: loadingInvitations } = useInvitations();
  const { createGroup, updateGroup, deleteGroup, addMember, acceptInvitation, declineInvitation, isPending } = useGroupMutations();
  const { toggleTask } = useTaskMutations();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [viewingGroupPhoto, setViewingGroupPhoto] = useState(null); // { src, name }
  const { data: selectedGroup, isLoading: loadingDetails } = useGroupDetails(selectedGroupId);

  const [activeTab, setActiveTab] = useState('groups');

  const tabs = (
    <div className="mb-6 border-b border-slate-200 dark:border-slate-800">
      <div className="-mb-px flex space-x-6">
        <button
          onClick={() => setActiveTab('groups')}
          className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'groups'
              ? 'border-primary text-primary dark:border-white dark:text-white'
              : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300'
          }`}
        >
          Groups
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'tasks'
              ? 'border-primary text-primary dark:border-white dark:text-white'
              : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300'
          }`}
        >
          Group Tasks
        </button>
      </div>
    </div>
  );

  if (activeTab === 'tasks') {
    return (
      <>
        {tabs}
        <GroupTasksPage />
      </>
    );
  }

  return (
    <>
      {tabs}
      <PageHeader
        title="Groups"
        description="Create teams, invite members, and inspect group tasks."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Add group
          </Button>
        }
      />

      {/* Pending Invitations */}
      {!loadingInvitations && invitations.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Pending Invitations
            </h2>
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white dark:bg-primary-light">
              {invitations.length}
            </span>
          </div>
          <div className="grid gap-3">
            {invitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                loading={isPending}
                onAccept={(id) => acceptInvitation(id)}
                onDecline={(id) => declineInvitation(id)}
              />
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <ListSkeleton count={4} />
      ) : groups.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onOpen={(item) => setSelectedGroupId(item.id)}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={UsersRound}
          title="No groups yet"
          description="Create a group to collaborate and assign team tasks."
          action={<Button onClick={() => setCreating(true)}>Create group</Button>}
        />
      )}

      <Modal open={creating} title="Create group" onClose={() => setCreating(false)}>
        <GroupForm
          loading={isPending}
          onCancel={() => setCreating(false)}
          onSubmit={async (values) => {
            await createGroup(values);
            setCreating(false);
          }}
        />
      </Modal>

      <Modal open={Boolean(editing)} title="Edit group" onClose={() => setEditing(null)}>
        <GroupForm
          group={editing}
          loading={isPending}
          onCancel={() => setEditing(null)}
          onSubmit={async (values) => {
            await updateGroup({ id: editing.id, values });
            setEditing(null);
          }}
        />
      </Modal>

      <Modal open={Boolean(selectedGroupId)} title={selectedGroup?.name || 'Group detail'} onClose={() => setSelectedGroupId(null)}>
        {loadingDetails ? (
          <ListSkeleton count={2} />
        ) : selectedGroup ? (
          <div className="grid gap-6">
            {/* Group avatar header */}
            {selectedGroup.avatarUrl && (
              <div className="flex justify-center">
                <Avatar
                  src={selectedGroup.avatarUrl}
                  name={selectedGroup.name}
                  size="xl"
                  onClick={() => setViewingGroupPhoto({ src: selectedGroup.avatarUrl, name: selectedGroup.name })}
                />
              </div>
            )}
            <div>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                {selectedGroup.description || 'No description.'}
              </p>
            </div>
            <MemberInviteForm
              loading={isPending}
              onSubmit={(email) => addMember({ groupId: selectedGroup.id, email })}
            />
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Members</h3>
              <MemberList members={selectedGroup.members} />
            </div>
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Group tasks</h3>
              <TaskList
                tasks={selectedGroup.tasks || []}
                actions={{
                  onOpen: () => {},
                  onEdit: () => {},
                  onDelete: () => {},
                  onToggle: (task) => toggleTask({ task, user, completed: !task.isCompleted }),
                }}
              />
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete group?"
        description={`This will delete "${deleting?.name}" using the mobile-compatible team endpoint.`}
        loading={isPending}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          await deleteGroup(deleting.id);
          setDeleting(null);
        }}
      />

      {/* Group photo viewer */}
      <ProfilePhotoModal
        open={Boolean(viewingGroupPhoto)}
        src={viewingGroupPhoto?.src}
        name={viewingGroupPhoto?.name}
        onClose={() => setViewingGroupPhoto(null)}
      />
    </>
  );
}
