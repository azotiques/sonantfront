import { createChannel, createInvite, deleteChannel, getGuild } from "#/queries/guilds";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Hash, Plus, Settings, Trash, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ResizablePanel } from "./resizable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu";
import { Button } from "./button";
import { Separator } from "./separator";
import { cn } from "cn";
import { ChannelType, GuildType, InviteType } from "#/types/guild";
import { Input } from "./input";

type ChannelSidebarProps = {
  id1: string,
  id2?: string
}

export function ChannelSidebar({ id1, id2 }: ChannelSidebarProps) {

  const queryClient = useQueryClient();
  const [createChannelName, setCreateChannelName] = useState("");
  const [createChannelType, setCreateChannelType] = useState<ChannelType>(ChannelType.MESSAGE);
  const [createInviteType, setCreateInviteType] = useState<InviteType>(InviteType.ALL);

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [channelDialogOpen, setChannelDialogOpen] = useState(false);
  const [channelSettingsOpen, setChannelSettingsOpen] = useState(false);

  const { data: createInviteData, mutate: createInviteMutation } = useMutation({
    mutationFn: () => createInvite(id1, { inviteType: createInviteType }),
    mutationKey: ["invite"]
  });

  const { mutate: deleteChannelMutation } = useMutation({
    mutationFn: (channelId: string) => deleteChannel(id1, channelId),
    mutationKey: ["channels", id1, id2],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guilds", id1] })
      setChannelSettingsOpen(false);
    }
  });

  const { mutate: createChannelMutation } = useMutation({
    mutationKey: ["channels", id1],
    mutationFn: () => createChannel(id1, { name: createChannelName, channelType: createChannelType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guilds", id1] });
      setChannelDialogOpen(false);
    }
  });

  const { data: currentGuild, isLoading: isCurrentGuildLoading } = useQuery({
    queryKey: ["guilds", id1],
    queryFn: () => getGuild(id1)
  });

  function createChannelHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    createChannelMutation();
  }

  function createInviteHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    createInviteMutation();
  }

  return <div>
    {!isCurrentGuildLoading && currentGuild?.guildType === GuildType.GUILD &&
      <>
        <ResizablePanel defaultSize={"40fr"}>
          <div className="grid grid-rows-[3rem_1fr]">
            <div className="flex flex-row items-center justify-between">
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button size="xl" className="cursor-pointer" variant="ghost" />}>
                    <span className="text-base font-semibold">{currentGuild.name}</span>
                    <ChevronDown />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => setInviteDialogOpen(!inviteDialogOpen)}>
                        <User />
                        <span>Create Invite</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setChannelDialogOpen(!channelDialogOpen)}>
                          <Plus />
                          <span>Create Channel</span>
                        </DropdownMenuItem>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setChannelDialogOpen(!channelDialogOpen)}>
                          <span className="flex flex-row items-center gap-x-2 text-destructive">
                            <Trash /> Delete Server
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create invite</DialogTitle>
                    <form onSubmit={createInviteHandler}>
                      <select value={createInviteType} onChange={(e) => setCreateInviteType(e.target.value as InviteType)} id="inviteType">
                        <option value={InviteType.ALL}>All</option>
                        <option value={InviteType.EXPIRING}>Expiring</option>
                      </select>
                      <button type='submit'>Save</button>
                    </form>
                    {createInviteData &&
                      <div className="flex flex-col gap-y-2">
                        <span className="text-purple-200">
                          {`https://sonant.azotix.dev/app/invite/${createInviteData.inviteCode}`}
                        </span>
                        <Button className="cursor-pointer" onClick={() => {
                          navigator.clipboard.writeText(`https://sonant.azotix.dev/app/invite/${createInviteData.inviteCode}`)
                        }} variant={"outline"}>Copy Link</Button>
                      </div>
                    }
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <Dialog open={channelDialogOpen} onOpenChange={setChannelDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add a channel</DialogTitle>
                    <form className="flex flex-col gap-y-3" onSubmit={createChannelHandler}>
                      <Input onChange={(e) => setCreateChannelName(e.target.value)} placeholder="Name" />
                      <select value={createChannelType} onChange={(e) => setCreateChannelType(e.target.value as ChannelType)} id="channelType">
                        <option value={ChannelType.MESSAGE}>Messages</option>
                        <option value={ChannelType.VOICE}>Voice</option>
                      </select>
                      <Button variant="outline" type='submit'>Save</Button>
                    </form>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
            <Separator />
            <div className="py-4 flex flex-col gap-y-1">
              {currentGuild.channels.map((c) => {
                return (
                  <Link
                    key={c.channelId}
                    to="/app/$id1/$id2"
                    params={{ id1: currentGuild.guildId, id2: c.channelId }}
                  >
                    <Button variant="ghost" className={cn("justify-between items-center cursor-pointer h-10 w-full text-neutral-500", c.channelId === id2 && "text-neutral-100 bg-sidebar-accent")}>
                      <div className="flex gap-x-1 flex-row items-center">
                        <Hash className="size-6" />
                        <span className="text-base lowercase">{c.name}</span>
                      </div>
                      <div>
                        <Button variant="ghost" onClick={() => setChannelSettingsOpen(!channelSettingsOpen)}><Settings /></Button>
                        <Dialog open={channelSettingsOpen} onOpenChange={setChannelSettingsOpen}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Channel Settings</DialogTitle>
                              <Button onClick={() => deleteChannelMutation(c.channelId)} variant="destructive"><Trash /> Delete Channel</Button>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
        </ResizablePanel>
      </>
    }
  </div>
}
