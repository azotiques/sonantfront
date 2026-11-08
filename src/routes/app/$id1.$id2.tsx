import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { format, isValid } from 'date-fns';
import { deleteMessages, getMessages, uploadAttachments } from '#/queries/messages';
import { stomp, useStompStore } from '#/stomp-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Ellipsis, Paperclip, Trash, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '#/components/ui/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '#/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar';
import type { Message } from '#/types/messaging';
import type { ChatMessage } from '#/types/realtime';
import { ButtonGroup } from '#/components/ui/button-group';
import { useTypingStore } from '#/stores/typing-store';
import { getCurrentUser } from '#/queries/users';

const GROUP_WINDOW_MS = 5 * 60 * 1000;

export const Route = createFileRoute('/app/$id1/$id2')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id1, id2 } = Route.useParams();

  const queryClient = useQueryClient();

  const navigate = Route.useNavigate();

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: currentUser } = useQuery({
    queryKey: ["users"],
    queryFn: getCurrentUser
  });

  const { data: messageQuery, isError, isSuccess } = useQuery({
    queryKey: ["messages", id1, id2],
    queryFn: () => getMessages(id1, id2),
    enabled: !!id1 && !!id2,
    retry: false
  });


  useEffect(() => {
    if (isError) {
      navigate({ to: "/app/friends" });
    }
  }, [isError, navigate]);

  const messages = messageQuery ?? [];

  const { mutate: deleteMessageMutation } = useMutation({
    mutationKey: ["messages", id1, id2],
    mutationFn: (messageId: string) => deleteMessages(id1, id2, { messageId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["messages", id1, id2] });
    }
  });

  const { mutateAsync: uploadAttachmentsMutation, isPending: isUploading } = useMutation({
    mutationKey: ["attachments", id1, id2],
    mutationFn: (selectedFiles: File[]) => uploadAttachments(id1, id2, selectedFiles),
  });

  const [message, setMessage] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const connected = useStompStore((state) => state.connected);
  const lastTypedRef = useRef<number>(0);

  function deleteMessageHandler(messageId: string) {
    deleteMessageMutation(messageId);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setMessage(e.target.value);

    const now = Date.now();

    if (e.target.value.trim() && now - lastTypedRef.current > 3000) {
      lastTypedRef.current = now;

      stomp.publish({
        destination: `/app/chat/${id1}/${id2}/typing`,
      });
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    setFiles((prev) => [...prev, ...Array.from(selected)]);
    e.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function messageHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!message.trim() && files.length === 0) return;

    let attachmentKeys: string[] = [];

    if (files.length > 0) {
      attachmentKeys = await uploadAttachmentsMutation(files);
    }

    const body: ChatMessage = {
      message,
      attachments: attachmentKeys,
    };

    stomp.publish({
      destination: `/app/chat/${id1}/${id2}`,
      body: JSON.stringify(body)
    });

    setMessage("");
    setFiles([]);
    lastTypedRef.current = 0;
  }

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [messages]);

  const setTyping = useTypingStore((state) => state.setTyping);
  const clearTyping = useTypingStore((state) => state.clearTyping);
  const typingUsers = useTypingStore((state) => state.typingByChannel[id2]);
  const typingUsernames = typingUsers ? Object.values(typingUsers) : [];

  useEffect(() => {
    if (!connected || !isSuccess || !stomp.connected || !id1 || !id2) return;

    const subscription = stomp.subscribe(`/topic/chat.guild.${id1}.${id2}.typing`, (frame) => {
      const incoming = JSON.parse(frame.body);

      if (incoming.userId === currentUser?.id) return;

      setTyping(id2, incoming.userId, incoming.userDto);
    });

    return () => subscription.unsubscribe();
  }, [connected, id1, id2, currentUser?.id, setTyping]);

  useEffect(() => {
    if (!connected || !stomp.connected || !id1 || !id2) return;

    const subscription = stomp.subscribe(`/topic/chat.guild.${id1}.${id2}`, (frame) => {
      const incoming: Message = JSON.parse(frame.body);
      clearTyping(id2, incoming.user.id);
      queryClient.setQueryData<Message[]>(["messages", id1, id2], (old = []) => [...old, incoming]);
    });

    return () => subscription.unsubscribe();
  }, [connected, id1, id2, queryClient]);

  return <div className="h-full">
    <div className="grid h-full grid-rows-[1fr_auto] overflow-hidden">
      <div ref={scrollRef} className="flex flex-col gap-1 overflow-y-auto p-4">
        {messages.map((m, i) => {
          const prev = messages[i - 1];

          const isGrouped =
            prev !== undefined &&
            m.user !== undefined &&
            prev.user?.id === m.user.id &&
            new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() < GROUP_WINDOW_MS;

          return (<div key={m.id}>
            <HoverCard>
              <HoverCardTrigger delay={50} closeDelay={50}>
                <div className={`group items-center flex gap-x-4 rounded-md px-3 py-1 hover:bg-sidebar-accent ${isGrouped ? "" : "mt-3"}`}>
                  <div className="w-10 shrink-0">
                    {isGrouped ? (
                      <span className="hidden pt-1 text-right text-xs text-neutral-500 group-hover:block">
                        {isValid(new Date(m.createdAt)) ? format(new Date(m.createdAt), "HH:mm") : ""}
                      </span>
                    ) : (
                      <div className='flex flex-row items-center gap-x-4'>
                        <Avatar size="lg">
                          <AvatarImage src={m.user.avatar} />
                          <AvatarFallback>
                            {m.user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {!isGrouped && (
                      <div className="flex items-baseline gap-x-3">
                        <span className="font-semibold">{m.user.username}</span>
                        <span className="text-sm text-neutral-500">
                          {isValid(new Date(m.createdAt)) ? format(new Date(m.createdAt), "dd/MM/yy, HH:mm") : ""}
                        </span>
                      </div>
                    )}
                    {m.message && (
                      <span className="whitespace-pre-wrap wrap-break-word">{m.message}</span>
                    )}
                    {m.attachments && m.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.attachments.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block overflow-hidden rounded-md border border-border"
                          >
                            <img
                              src={url}
                              alt={`Attachment ${idx + 1}`}
                              className="max-h-64 max-w-xs rounded-md object-contain"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent sideOffset={-24} side="top" align="end">
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-6" render={<Button className="h-6" variant="ghost" />}>
                    <Ellipsis />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <Button onClick={() => deleteMessageHandler(m.id)} variant="destructive"><Trash /> Delete message</Button>
                  </DropdownMenuContent>
                </DropdownMenu>
              </HoverCardContent>
            </HoverCard>
          </div>
          )
        }
        )}
      </div>
      <div className="p-4">
        {typingUsernames.length > 0 && (
          <div className="mb-2 px-2 py-1 bg-neutral-800 rounded-md text-xs text-neutral-400">{typingUsernames.join(", ")} {typingUsernames.length === 1 ? "is" : "are"} typing<span className="animate-pulse">...</span></div>
        )}
        {files.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center gap-1.5 rounded-md bg-neutral-800 px-2.5 py-1 text-xs text-neutral-200"
              >
                <span className="max-w-40 truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="cursor-pointer text-neutral-400 hover:text-neutral-100"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <form className="flex items-center gap-2" onSubmit={messageHandler}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <ButtonGroup className="flex-1 border-neutral-100">
            <Button
              type="button"
              variant="outline"
              className="h-14 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Paperclip className="size-4" />
            </Button>
            <Input className="h-14" value={message} onChange={handleInputChange} placeholder="Message..." />
            <Button type="submit" variant="outline" className="h-14 cursor-pointer" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Send"}
            </Button>
          </ButtonGroup>
        </form>
      </div>
    </div>
  </div >
}
