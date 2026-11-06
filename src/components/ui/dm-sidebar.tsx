import { getGuild } from "#/queries/guilds";
import { skipToken, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "#/queries/users";
import { getFriendRelationships } from "#/queries/relationships";
import { Separator } from "./separator";
import { FriendsButton } from "./friends-button";
import { DmFriends } from "./dm-friends";
import { GuildType } from "#/types/guild";
import { useEffect } from "react";

type DmSidebarProps = {
  id1?: string
}

export function DmSidebar({ id1 }: DmSidebarProps) {
  const { data: friendRelationships, isLoading: isFriendRelationshipsLoading } = useQuery({
    queryKey: ["relationships", "friends"],
    queryFn: getFriendRelationships
  });

  const { data: currentGuild } = useQuery({
    queryKey: ["guilds", id1],
    queryFn: id1 ? () => getGuild(id1) : skipToken
  });

  const { data: currentUser } = useQuery({
    queryKey: ["users"],
    queryFn: getCurrentUser
  });

  return (
    <div className="w-full">
      {currentGuild?.guildType !== GuildType.GUILD &&
        <div className="flex flex-col gap-y-2 w-full">
          <FriendsButton />
          <Separator />
          <span className="p-2 text-neutral-500 text-sm">Direct Messages</span>
          <DmFriends isFriendRelationshipsLoading={isFriendRelationshipsLoading} friendRelationships={friendRelationships} currentUser={currentUser} />
        </div>}
    </div>
  )
}
