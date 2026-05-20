import { useState, useEffect, useRef } from 'react';
import { useConversations, useMessages, useSendMessage, useMarkConversationRead, useDeleteMessage } from '../../hooks/useChat.js';
import { useAuth } from '../../hooks/useAuth.js';
import { formatDateTime } from '../../utils/date.js';
import { Send, ArrowLeft, Reply, Trash2, X, Info, Search } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { ProfilePhotoModal } from '../../components/ui/ProfilePhotoModal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { cn } from '../../utils/cn.js';

// Build a name -> member lookup from conversation.members
function buildMemberMap(members = []) {
  const map = {};
  for (const m of members) {
    const key = m.id ?? m.email ?? m.name;
    if (key != null) map[String(key)] = m;
    if (m.email) map[m.email] = m;
    if (m.name) map[m.name] = m;
  }
  return map;
}

function ChatBubble({ message, isMe, onReply, onDelete, memberMap, onViewProfile }) {
  const senderName = message.sender_name || message.senderName || 'Unknown';
  const senderId = String(message.sender_id || message.senderId || '');
  const member = memberMap?.[senderId] || memberMap?.[senderName] || null;
  const avatarUrl = member?.avatar_url ?? member?.avatarUrl ?? null;

  return (
    <div className={cn('group flex w-full items-end gap-2', isMe ? 'justify-end' : 'justify-start')}>
      {/* Other user avatar */}
      {!isMe && (
        <Avatar
          src={avatarUrl}
          name={senderName}
          size="xs"
          className="mb-1 shrink-0"
          onClick={avatarUrl ? () => onViewProfile({ src: avatarUrl, name: senderName }) : undefined}
        />
      )}

      {/* Action buttons (me, left side) */}
      {isMe && (
        <div className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" onClick={() => onReply(message)}>
            <Reply className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => onDelete(message)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm',
          isMe
            ? 'bg-primary-light text-white dark:bg-primary-dark'
            : 'bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100',
        )}
      >
        {!isMe && <div className="mb-1 text-xs font-bold text-slate-500 dark:text-slate-400">{senderName}</div>}
        <p className="text-sm whitespace-pre-wrap">{message.body}</p>
        <div className={cn('mt-1 text-[10px]', isMe ? 'text-white/70 dark:text-white/60' : 'text-slate-400')}>
          {formatDateTime(new Date(message.created_at || message.createdAt))}
        </div>
      </div>

      {/* Action button (other user, right side) */}
      {!isMe && (
        <div className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" onClick={() => onReply(message)}>
            <Reply className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function ChatRoom({ conversation, onBack }) {
  const { user } = useAuth();
  const { data: messages = [], isLoading } = useMessages(conversation?.id);
  const sendMessageMutation = useSendMessage();
  const deleteMessageMutation = useDeleteMessage();
  const markReadMutation = useMarkConversationRead();
  const [inputText, setInputText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState(null); // { src, name }
  const messagesEndRef = useRef(null);

  const memberMap = buildMemberMap(conversation?.members);

  useEffect(() => {
    if (conversation?.id) {
      markReadMutation.mutate(conversation.id);
    }
  }, [conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !conversation?.id) return;

    let finalBody = inputText.trim();
    if (replyTo) {
      const senderName = replyTo.sender_name || replyTo.senderName || 'Unknown';
      const quotedBody = replyTo.body.split('\n').map(line => `> ${line}`).join('\n');
      finalBody = `Replying to **${senderName}**:\n${quotedBody}\n\n${finalBody}`;
    }

    sendMessageMutation.mutate({ conversationId: conversation.id, body: finalBody });
    setInputText('');
    setReplyTo(null);
  };

  const handleReply = (msg) => {
    setReplyTo(msg);
    document.getElementById('chat-input')?.focus();
  };

  const handleDelete = (msg) => setDeleteTarget(msg);

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMessageMutation.mutate(deleteTarget.id, {
        onSuccess: () => setDeleteTarget(null),
        onError: () => setDeleteTarget(null),
      });
    }
  };

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 text-slate-500">
        <p>Select a conversation to start chatting</p>
      </div>
    );
  }

  const convAvatarUrl = conversation.avatarUrl ?? conversation.avatar_url ?? null;
  const isGroup = conversation.type === 'team';

  return (
    <>
      <div className="flex h-full flex-col bg-slate-50 dark:bg-slate-900/20">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <button
            onClick={() => setIsInfoOpen(true)}
            className="flex flex-1 items-center gap-3 rounded-lg p-1 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {/* Conversation avatar */}
            <Avatar
              src={convAvatarUrl}
              name={conversation.name}
              size="md"
              className="shrink-0"
            />
            <div className="flex-1">
              <h2 className="font-semibold text-slate-900 dark:text-white">{conversation.name}</h2>
              <p className="text-xs text-slate-500">
                {isGroup ? `Group Chat • ${conversation.members?.length || 0} members` : 'Private Chat'}
              </p>
            </div>
            <Info className="h-5 w-5 text-slate-400 mr-2 shrink-0" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <span className="text-sm text-slate-500">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <span className="text-sm text-slate-500">No messages yet. Say hi!</span>
            </div>
          ) : (
            messages.map((msg) => {
              const senderId = msg.sender_id || msg.senderId;
              return (
                <ChatBubble
                  key={msg.id}
                  message={msg}
                  isMe={senderId === user?.id}
                  onReply={handleReply}
                  onDelete={handleDelete}
                  memberMap={memberMap}
                  onViewProfile={setViewingPhoto}
                />
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          {replyTo && (
            <div className="mb-3 flex items-start justify-between rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-800">
              <div className="flex-1">
                <span className="font-semibold text-primary-light">
                  Replying to {replyTo.sender_name || replyTo.senderName || 'Unknown'}
                </span>
                <p className="mt-1 line-clamp-2 text-slate-500 dark:text-slate-400">{replyTo.body}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setReplyTo(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              id="chat-input"
              type="text"
              className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={sendMessageMutation.isPending}
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full"
              disabled={!inputText.trim() || sendMessageMutation.isPending}
              loading={sendMessageMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <ConfirmDialog
          open={!!deleteTarget}
          title="Delete Message"
          description="Are you sure you want to delete this message? This action cannot be undone."
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleteMessageMutation.isPending}
        />

        {/* Chat Info Modal */}
        <Modal open={isInfoOpen} onClose={() => setIsInfoOpen(false)} title="Chat Info" className="max-w-md">
          <div className="flex flex-col items-center py-4">
            {/* Group/user avatar — clickable to view full */}
            <Avatar
              src={convAvatarUrl}
              name={conversation.name}
              size="xl"
              onClick={convAvatarUrl ? () => setViewingPhoto({ src: convAvatarUrl, name: conversation.name }) : undefined}
            />
            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{conversation.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{isGroup ? 'Group Chat' : 'Private Chat'}</p>
          </div>

          {conversation.members && conversation.members.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                Members ({conversation.members.length})
              </h3>
              <div className="space-y-3">
                {conversation.members.map((member) => {
                  const memberAvatar = member.avatar_url ?? member.avatarUrl ?? null;
                  const memberName = member.name || member.display_name || 'Unknown';
                  return (
                    <div key={member.id ?? member.email} className="flex items-center gap-3">
                      <Avatar
                        src={memberAvatar}
                        name={memberName}
                        size="sm"
                        onClick={memberAvatar ? () => setViewingPhoto({ src: memberAvatar, name: memberName }) : undefined}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {memberName}
                          {member.id === user?.id && ' (You)'}
                        </p>
                        {member.email && <p className="text-xs text-slate-500">{member.email}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Modal>
      </div>

      {/* Full-screen photo viewer */}
      <ProfilePhotoModal
        open={Boolean(viewingPhoto)}
        src={viewingPhoto?.src}
        name={viewingPhoto?.name}
        onClose={() => setViewingPhoto(null)}
      />
    </>
  );
}

export function ChatPage() {
  const { data: conversations = [], isLoading } = useConversations();
  const [activeChatId, setActiveChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const activeChat = conversations.find((c) => c.id === activeChatId);

  const filteredConversations = conversations.filter((chat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = (chat.name || '').toLowerCase().includes(q);
    const lastMsg = typeof (chat.last_message || chat.lastMessage) === 'object'
      ? (chat.last_message || chat.lastMessage)?.body
      : (chat.last_message || chat.lastMessage);
    const msgMatch = (lastMsg || '').toLowerCase().includes(q);
    return nameMatch || msgMatch;
  });

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 md:h-[calc(100vh-theme(spacing.8))] md:m-4 md:w-[calc(100%-theme(spacing.8))]">
      {/* Sidebar List */}
      <div
        className={cn(
          'flex h-full w-full flex-col border-r border-slate-200 dark:border-slate-800 md:w-80 md:shrink-0 lg:w-96',
          activeChatId ? 'hidden md:flex' : 'flex',
        )}
      >
        <div className="border-b border-slate-200 p-4 pb-3 dark:border-slate-800">
          <h1 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">Chats</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-primary-light focus:ring-1 focus:ring-primary-light dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-slate-500">Loading chats...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center">
              <Search className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">
                {searchQuery ? `No results for "${searchQuery}"` : 'No conversations found.'}
              </p>
            </div>
          ) : (
            filteredConversations.map((chat) => {
              const chatAvatarUrl = chat.avatarUrl ?? chat.avatar_url ?? null;
              const lastMsg = typeof (chat.last_message || chat.lastMessage) === 'object'
                ? (chat.last_message || chat.lastMessage)?.body
                : (chat.last_message || chat.lastMessage);
              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={cn(
                    'flex w-full items-start gap-3 border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-900/50',
                    activeChatId === chat.id ? 'bg-slate-50 dark:bg-slate-900' : '',
                  )}
                >
                  <Avatar src={chatAvatarUrl} name={chat.name} size="md" className="mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate font-semibold text-slate-900 dark:text-white">
                        {chat.name}
                      </span>
                      {chat.updated_at || chat.updatedAt ? (
                        <span className="shrink-0 text-xs text-slate-400">
                          {formatDateTime(new Date(chat.updated_at || chat.updatedAt)).split(',')[0]}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                      {lastMsg || 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={cn(
          'h-full flex-1',
          !activeChatId ? 'hidden md:block' : 'block',
        )}
      >
        <ChatRoom conversation={activeChat} onBack={() => setActiveChatId(null)} />
      </div>
    </div>
  );
}
