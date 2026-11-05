import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { format, isValid } from 'date-fns';
import { deleteMessages, getMessages } from '#/queries/messages';
import { stomp } from '#/stomp-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ResizablePanel, ResizablePanelGroup } from '#/components/ui/resizable';
import { Ellipsis, Trash } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '#/components/ui/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '#/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar';
import type { Message } from '#/types/messaging';
import type { ChatMessage } from '#/types/realtime';
import { ButtonGroup } from '#/components/ui/button-group';

const GROUP_WINDOW_MS = 5 * 60 * 1000;

export const Route = createFileRoute('/app/$id1/$id2')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id1, id2 } = Route.useParams();

  const queryClient = useQueryClient();

  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messageQuery } = useQuery({
    queryKey: ["messages", id1, id2],
    queryFn: () => getMessages(id1, id2),
    enabled: !!id1 && !!id2
  });

  const messages = messageQuery ?? [];

  const { mutate: deleteMessageMutation } = useMutation({
    mutationKey: ["messages", id1, id2],
    mutationFn: (messageId: string) => deleteMessages(id1, id2, { messageId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["messages", id1, id2] });
    }
  });

  const [message, setMessage] = useState<string>("");
  const [connected, setConnected] = useState(false);

  function deleteMessageHandler(messageId: string) {
    deleteMessageMutation(messageId);
  }

  function messageHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const body: ChatMessage = { message };

    stomp.publish({
      destination: `/app/chat/${id1}/${id2}`,
      body: JSON.stringify(body)
    });

    setMessage("");
  }

  useEffect(() => {
    stomp.onConnect = () => {
      setConnected(true);
    }
    stomp.onDisconnect = () => {
      setConnected(false);
    }

    stomp.activate();

    return () => {
      stomp.deactivate();
    }
  }, [])

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [messages]);

  useEffect(() => {
    if (!connected || !id1 || !id2) return;

    const subscription = stomp.subscribe(`/topic/chat.guild.${id1}.${id2}`, (frame) => {
      const incoming: Message = JSON.parse(frame.body);
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
                    <span className="whitespace-pre-wrap wrap-break-word">{m.message}</span>
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
        <form className="flex items-center gap-2" onSubmit={messageHandler}>
          <ButtonGroup className="flex-1 border-neutral-100">
            <Input className="h-14" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message..." />
            <Button type="submit" variant="outline" className="h-14">Send</Button>
          </ButtonGroup>
        </form>
      </div>
    </div>
  </div >
}
