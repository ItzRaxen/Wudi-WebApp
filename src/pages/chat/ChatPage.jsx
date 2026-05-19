import { useState, useEffect, useRef } from 'react';
import { useConversations, useMessages, useSendMessage, useMarkConversationRead, useDeleteMessage } from '../../hooks/useChat.js';
import { useAuth } from '../../hooks/useAuth.js';
import { formatDateTime } from '../../utils/date.js';
import { Send, Users, User, ArrowLeft, Reply, Trash2, X, Info } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { cn } from '../../utils/cn.js';

function ChatBubble({ message, isMe, onReply, onDelete }) {
  return (
    <div className={cn('group flex w-full items-center gap-2', isMe ? 'justify-end' : 'justify-start')}>
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
        {!isMe && <div className="mb-1 text-xs font-bold text-slate-500 dark:text-slate-400">{message.sender_name || message.senderName}</div>}
        <p className="text-sm whitespace-pre-wrap">{message.body}</p>
        <div
          className={cn(
            'mt-1 text-[10px]',
            isMe ? 'text-white/70 dark:text-white/60' : 'text-slate-400',
          )}
        >
          {formatDateTime(new Date(message.created_at || message.createdAt))}
        </div>
      </div>
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
  const messagesEndRef = useRef(null);

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
    // focus input
    document.getElementById('chat-input')?.focus();
  };

  const handleDelete = (msg) => {
    setDeleteTarget(msg);
  };

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

  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-slate-900/20">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <button
          onClick={() => setIsInfoOpen(true)}
          className="flex flex-1 items-center gap-3 rounded-lg p-1 transition hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            {conversation.type === 'team' ? (
              <Users className="h-5 w-5 text-slate-500" />
            ) : (
              <User className="h-5 w-5 text-slate-500" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-900 dark:text-white">{conversation.name}</h2>
            <p className="text-xs text-slate-500">
              {conversation.type === 'team' ? `Group Chat • ${conversation.members?.length || 0} members` : 'Private Chat'}
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
            return <ChatBubble key={msg.id} message={msg} isMe={senderId === user?.id} onReply={handleReply} onDelete={handleDelete} />;
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

      <Modal open={isInfoOpen} onClose={() => setIsInfoOpen(false)} title="Chat Info" className="max-w-md">
        <div className="flex flex-col items-center py-4">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            {conversation.type === 'team' ? (
              <Users className="h-10 w-10 text-slate-500" />
            ) : (
              <User className="h-10 w-10 text-slate-500" />
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{conversation.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{conversation.type === 'team' ? 'Group Chat' : 'Private Chat'}</p>
        </div>

        {conversation.members && conversation.members.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
              Members ({conversation.members.length})
            </h3>
            <div className="space-y-3">
              {conversation.members.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {member.name || member.display_name}
                      {member.id === user?.id && ' (You)'}
                    </p>
                    {member.email && <p className="text-xs text-slate-500">{member.email}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export function ChatPage() {
  const { data: conversations = [], isLoading } = useConversations();
  const [activeChatId, setActiveChatId] = useState(null);

  const activeChat = conversations.find((c) => c.id === activeChatId);

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 md:h-[calc(100vh-theme(spacing.8))] md:m-4 md:w-[calc(100%-theme(spacing.8))]">
      {/* Sidebar List */}
      <div
        className={cn(
          'flex h-full w-full flex-col border-r border-slate-200 dark:border-slate-800 md:w-80 md:shrink-0 lg:w-96',
          activeChatId ? 'hidden md:flex' : 'flex',
        )}
      >
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Chats</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-slate-500">Loading chats...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">No conversations found.</div>
          ) : (
            conversations.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={cn(
                  'flex w-full items-start gap-3 border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-900/50',
                  activeChatId === chat.id ? 'bg-slate-50 dark:bg-slate-900' : '',
                )}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  {chat.type === 'team' ? (
                    <Users className="h-6 w-6 text-slate-500" />
                  ) : (
                    <User className="h-6 w-6 text-slate-500" />
                  )}
                </div>
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
                    {typeof (chat.last_message || chat.lastMessage) === 'object' 
                      ? (chat.last_message || chat.lastMessage)?.body 
                      : (chat.last_message || chat.lastMessage) || 'No messages yet'}
                  </p>
                </div>
              </button>
            ))
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
