import { api } from "#/queries/api";
import type { Relationship, RelationshipCreated } from "#/types/users";

export const acceptFriendRelationship = (username: string) =>
  api<Relationship>('/relationship', { method: 'PUT', body: { outgoingUser: username } });

export const createRelationship = (username: string) =>
  api<RelationshipCreated>('/relationship/create', { method: 'POST', body: { outgoingUser: username } });

export const getFriendRelationships = () =>
  api<Relationship[]>('/relationship/friends');

export const getPendingRelationships = () =>
  api<Relationship[]>('/relationship');
