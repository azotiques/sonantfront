export enum ChannelType {
  MESSAGE = 'MESSAGE',
  VOICE = 'VOICE'
}

export enum GuildType {
  DM = 'DM',
  GUILD = 'GUILD'
}

export enum InviteType {
  ALL = 'ALL',
  EXPIRING = 'EXPIRING'
}

export type Channel = {
  channelId: string,
  name: string,
  channelType: ChannelType
}

export type CreateChannelRequest = Omit<Channel, 'channelId'>

export type GuildChannelResponse = {
  guildId: string,
  channelId: string
}

export type Guild = {
  guildId: string,
  name: string
  avatar: string
  guildType: GuildType,
  channels: Channel[],
  members: number[]
}

export type GuildRequest = {
  name: string
}

export type InviteRequest = {
  inviteType: InviteType
}

export type InviteResponse = {
  inviteCode: string
}

export type UpdateGuildRequest = {
  name: string,
  picture: string
}
