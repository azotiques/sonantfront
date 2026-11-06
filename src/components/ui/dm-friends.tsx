import { Link } from "@tanstack/react-router";
import { ButtonGroup } from "./button-group";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { FriendStatus, type Relationship, type User } from "#/types/users";

type DmFriendsProps = {
  isFriendRelationshipsLoading: boolean,
  friendRelationships: Relationship[] | undefined,
  currentUser: User | undefined
}

export function DmFriends({ isFriendRelationshipsLoading, friendRelationships, currentUser }: DmFriendsProps) {
  console.log(friendRelationships);
  return (
    <div>
      {!isFriendRelationshipsLoading && currentUser && friendRelationships?.map((r, i) => {
        const otherUser = r.incomingUser.username === currentUser.username ? r.outgoingUser : r.incomingUser;
        return r.status === FriendStatus.FRIENDS && <div key={i}>
          <div>
            <Link to="/app/$id1/$id2" params={{ id1: r.guildId, id2: r.channelId }}>
              <ButtonGroup className="rounded-md flex gap-x-2 w-full p-2 items-center hover:bg-sidebar-accent">
                <Avatar size="lg">
                  <AvatarImage src={otherUser.avatar} />
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
  )
}
