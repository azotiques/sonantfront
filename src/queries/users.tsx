import { api } from "#/queries/api";
import type { User } from "#/types/users";

export const getCurrentUser = () =>
  api<User>('/me');
