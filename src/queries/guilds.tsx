import { api } from "#/queries/api";
import type { Channel, CreateChannelRequest, Guild, GuildChannelResponse, GuildRequest, InviteRequest, InviteResponse } from "#/types/guild";

export const getGuilds = () =>
  api<Guild[]>('/guild');

export const getGuild = (guildId: string) =>
  api<Guild>(`/guild/${guildId}`);

export const createGuild = (guildRequest: GuildRequest) =>
  api<Guild>('/guild', { method: 'POST', body: guildRequest });

export const deleteGuild = (guildId: string) =>
  api<void>(`/guild/${guildId}`, { method: 'DELETE' });

export const deleteChannel = (guildId: string, channelId: string) =>
  api<void>(`/guild/${guildId}/${channelId}`, { method: 'DELETE' });

export const createChannel = (guildId: string, channel: CreateChannelRequest) =>
  api<Channel>(`/guild/${guildId}`, { method: 'POST', body: channel });

export const acceptInvite = (inviteCode: string) =>
  api<GuildChannelResponse>(`/guild/invite/${inviteCode}`, { method: 'POST' });

export const createInvite = (guildId: string, inviteRequest: InviteRequest) =>
  api<InviteResponse>(`/guild/${guildId}/invite`, { method: 'POST', body: inviteRequest });
