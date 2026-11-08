import { api } from "#/queries/api";
import type { Message, MessageRequest } from "#/types/messaging";

export const getMessages = (guildId: string, channelId: string) =>
  api<Message[]>(`/messages/${guildId}/${channelId}`);

export const deleteMessages = (guildId: string, channelId: string, messageRequest: MessageRequest) =>
  api<void>(`/messages/${guildId}/${channelId}`, { method: 'DELETE', body: messageRequest });

export const uploadAttachments = (guildId: string, channelId: string, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("attachments", file));

  return api<string[]>(`/messages/${guildId}/${channelId}/attachments`, {
    method: 'POST',
    body: formData,
  });
};
