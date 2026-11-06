import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar';
import { Button } from '#/components/ui/button';
import { ButtonGroup, ButtonGroupSeparator } from '#/components/ui/button-group';
import { Input } from '#/components/ui/input';
import { Separator } from '#/components/ui/separator';
import { acceptFriendRelationship, createRelationship, getFriendRelationships, getPendingRelationships } from '#/queries/relationships';
import { editUser, getCurrentUser } from '#/queries/users';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router'
import { Users2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { FriendStatus } from '#/types/users';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '#/components/ui/dialog';

export const Route = createFileRoute('/app/friends')({
  component: RouteComponent,
})

function RouteComponent() {

  const [outgoingUser, setOutgoingUser] = useState<string>("");
  const [friendsState, setFriendsState] = useState<"ALL" | "FRIENDS">("ALL");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const queryClient = useQueryClient();


  const { data: currentUser, isLoading: isCurrentUserLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getCurrentUser
  });

  const { mutate: editUserMutation } = useMutation({
    mutationKey: ["users"],
    mutationFn: (file: File) => editUser({ avatar: file }),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["users"], updatedUser);
    }
  });

  const { data: pendingPelationships, isLoading: isPendingRelationshipsLoading } = useQuery({
    queryKey: ["relationships", "pending"],
    queryFn: getPendingRelationships,
  });

  const { data: friendRelationships, isLoading: isFriendRelationshipsLoading } = useQuery({
    queryKey: ["relationships", "friends"],
    queryFn: getFriendRelationships
  });

  const { mutate: createRelationshipMutation } = useMutation({
    mutationKey: ["relationships", "create"],
    mutationFn: createRelationship,
    onSuccess: () => {
      setOutgoingUser("");
    }
  });

  const { mutate: acceptFriendRelationshipMutation } = useMutation({
    mutationKey: ["relationships", "accept"],
    mutationFn: acceptFriendRelationship
  });

  function relationshipHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    queryClient.invalidateQueries({ queryKey: ["relationships"] });
    createRelationshipMutation(outgoingUser);
  }

  function friendRelationshipHandler(username: string) {
    acceptFriendRelationshipMutation(username);
  }

  function editUserHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!avatarFile) return;
    editUserMutation(avatarFile);
    queryClient.invalidateQueries({ queryKey: ["users"] });
  }

  return <div>
    <div className="flex flex-row px-3 py-2 gap-x-3">
      <div className="flex gap-x-2 flex-row rounded-md items-center text-left text-sm leading-tight">
        <Users2 />
        <span className="truncate font-semibold">
          Friends
        </span>
      </div>
      <ButtonGroup>
        <Button size="xl" onClick={() => setFriendsState("ALL")} variant='ghost'>All</Button>
        <ButtonGroupSeparator />
        <Button size="xl" onClick={() => setFriendsState("FRIENDS")} variant='ghost'>Add Friend</Button>
      </ButtonGroup>
    </div>
    <Separator />
    {friendsState === "FRIENDS" &&
      <form onSubmit={relationshipHandler}>
        <ButtonGroup className="px-4 py-3 w-full">
          <Input className="h-12" value={outgoingUser} onChange={(e) => setOutgoingUser(e.target.value)} placeholder="Enter a username..." />
          <Button type="submit" className="cursor-pointer h-12" variant="outline">Send friend request</Button>
        </ButtonGroup>
      </form>
    }
    {friendsState === "ALL" &&
      <div>
        {!isPendingRelationshipsLoading && pendingPelationships?.map((r, i) => {
          return r.status === FriendStatus.PENDING && <div key={i}>
            <div>
              <ButtonGroup className="flex gap-x-2 w-full p-2 items-center hover:bg-sidebar-accent">
                <Avatar size="lg">
                  <AvatarImage>{r.outgoingUser.avatar}</AvatarImage>
                  <AvatarFallback>{r.outgoingUser.username}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{r.outgoingUser.username}</span>
                </div>
                <Button variant="ghost" className="cursor-pointer" onClick={() => friendRelationshipHandler(r.outgoingUser.username)}>Accept</Button>
              </ButtonGroup>
            </div>
          </div>
        })}
        {!isCurrentUserLoading && (<div>
          <Dialog open={!currentUser?.accountSetup}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xl">Set up your account</DialogTitle>
                <form className="flex flex-col gap-y-2" onSubmit={editUserHandler}>
                  <span className="text-sm">Set your profile picture</span>
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
        </div>)}

        {!isFriendRelationshipsLoading && currentUser && friendRelationships?.map((r, i) => {
          const otherUser = r.incomingUser.username === currentUser.username ? r.outgoingUser : r.incomingUser;
          return r.status === FriendStatus.FRIENDS && <div key={i}>
            <div>
              <Link to="/app/$id1/$id2" params={{ id1: r.guildId, id2: r.channelId }}>
                <ButtonGroup className="flex gap-x-2 w-full p-2 items-center hover:bg-sidebar-accent">
                  <Avatar size="lg">
                    <AvatarImage>
                      {otherUser.avatar}
                    </AvatarImage>
                    <AvatarFallback>
                      {otherUser.username}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {otherUser.username}
                    </span>
                  </div>
                </ButtonGroup>
              </Link>
            </div>
          </div>
        })}
      </div>
    }
  </div>
}
