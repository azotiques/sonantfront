import type { User } from "#/types/users.ts";

export type Message = {
  id: string
  message: string,
  user: User,
  channelId: number,
  guildId: number,
  createdAt: string
}

export type MessageRequest = {
  messageId: string
}

export type SendMessageRequest = {
  message: string,
  user: User,
  guildId: number,
  channelId: number
}

export type SendMessageResponse = {
  id: string,
  message: string,
  user: User,
  guildId: string,
  channelId: string,
  createdAt: string
}
