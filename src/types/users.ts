import type { Guild } from "#/types/guild";

export enum FriendStatus {
  PENDING = 'PENDING',
  FRIENDS = 'FRIENDS',
  BLOCKED = 'BLOCKED'
}

export type User = {
  id: number,
  username: string,
  avatar: string,
  createdAt: string
}

export type Relationship = {
  status: FriendStatus,
  incomingUser: User,
  outgoingUser: User,
  guild: Guild
}

export type RelationshipCreated = {
  outgoingUserId: number,
  incomingUserId: number
}
