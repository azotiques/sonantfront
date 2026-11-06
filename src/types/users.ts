import type { Guild } from "#/types/guild";

export enum FriendStatus {
  PENDING = 'PENDING',
  FRIENDS = 'FRIENDS',
  BLOCKED = 'BLOCKED'
}

export type EditUserRequest = {
  avatar: File
}

export type User = {
  id: number,
  accountSetup: boolean,
  username: string,
  avatar: string,
  createdAt: string
}

export type Relationship = {
  status: FriendStatus,
  incomingUser: User,
  outgoingUser: User,
  guildId: string,
  channelId: string
}

export type RelationshipCreated = {
  outgoingUserId: number,
  incomingUserId: number
}
