import { createGuild, getGuilds } from "#/queries/guilds";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarRail } from "./sidebar";
import { Link, useParams } from "@tanstack/react-router";
import { Plus, Settings } from "lucide-react";
import { editUser, getCurrentUser } from "#/queries/users";
import { useState, type FormEvent } from "react";
import { ResizablePanelGroup } from "./resizable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { ButtonGroup } from "./button-group";
import { DmSidebar } from "./dm-sidebar";
import { ChannelSidebar } from "./channel-sidebar";
import { GuildType, type Guild } from "#/types/guild";

export function AppSidebar() {

  const { id1, id2 } = useParams({
    strict: false
  });

  const queryClient = useQueryClient();

  const { data: guilds, isLoading: isGuildsLoading } = useQuery({
    queryKey: ["guilds"],
    queryFn: getGuilds
  });

  const [createGuildName, setCreateGuildName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const { data: currentUser, isLoading: isCurrentUserLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getCurrentUser
  });

  const { mutate: createGuildMutation } = useMutation({
    mutationKey: ["guilds"],
    mutationFn: () => createGuild({ name: createGuildName }),
    onSuccess: (guild) => {
      queryClient.setQueryData<Guild[]>(["guilds"], (oldGuilds = []) => [
        ...oldGuilds,
        guild
      ]);
    }
  });

  const { mutate: editUserMutation } = useMutation({
    mutationKey: ["users"],
    mutationFn: (file: File) => editUser({ avatar: file }),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["users"], updatedUser);
    }
  });

  function createGuildButtonHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createGuildMutation();
  }

  function editUserHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!avatarFile) return;
    editUserMutation(avatarFile);
  }

  return (
    <Sidebar>
      <SidebarContent>
        <div className="flex flex-row">
          <div>
            <SidebarGroup>
              <Link to="/app/friends">
                <Avatar size="lg">
                  <AvatarFallback>
                    <span className="text-sm" >S</span>
                  </AvatarFallback>
                </Avatar>
              </Link>
            </SidebarGroup>
            <SidebarGroup className="flex flex-col items-center gap-y-3">
              {!isGuildsLoading && guilds?.map((g) => {
                return (
                  <div key={g.guildId}>
                    {g.guildType === GuildType.GUILD &&
                      <Link to="/app/$id1/$id2" params={{ id1: g.guildId, id2: g.channels[0].channelId }}>
                        <Avatar size="lg">
                          <AvatarImage>{g.avatar}</AvatarImage>
                          <AvatarFallback>
                            {g.name}
                          </AvatarFallback>
                        </Avatar>
                      </Link>}
                  </div>
                )
              })}
              <Dialog>
                <DialogTrigger className="cursor-pointer">
                  <Avatar size="lg">
                    <AvatarFallback>
                      <Plus />
                    </AvatarFallback>
                  </Avatar>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create server</DialogTitle>
                    <form onSubmit={createGuildButtonHandler}>
                      <Input onChange={(e) => setCreateGuildName(e.target.value)} placeholder="Server name" />
                      <Button className="cursor-pointer" type='submit'>Create</Button>
                    </form>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </SidebarGroup>
          </div>
          <div className="flex flex-1">
            <SidebarGroup>
              <ResizablePanelGroup>
                <div className="w-full">
                  <DmSidebar id1={id1} />
                  {id1 && <ChannelSidebar id1={id1} id2={id2} />}
                </div>
              </ResizablePanelGroup>
            </SidebarGroup>
          </div>
        </div>
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        {!isCurrentUserLoading &&
          <div>
            <ButtonGroup className="flex gap-x-2 w-full p-2 items-center rounded-md hover:bg-sidebar-accent outline-1 outline-sidebar-accent">
              <Avatar size="lg">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback>{currentUser?.username}</AvatarFallback>
              </Avatar>
              <div className="flex flex-row justify-between flex-1 items-center text-left text-sm leading-tight">
                <span className="truncate font-medium">{currentUser?.username}</span>
                <Dialog>
                  <DialogTrigger render={<Button className="cursor-pointer" variant="outline" />}>
                    <Settings />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-xl">User settings</DialogTitle>
                      <form className="flex flex-col gap-y-2" onSubmit={editUserHandler}>
                        <span className="font-semibold">Set avatar</span>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                        />
                        <Button variant="outline" className="cursor-pointer" type="submit">Save</Button>
                      </form>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            </ButtonGroup>
          </div>
        }
      </SidebarFooter>
    </Sidebar >
  )
}
