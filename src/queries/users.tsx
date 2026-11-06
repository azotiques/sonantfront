import { api } from "#/queries/api";
import type { EditUserRequest, User } from "#/types/users";

export const getCurrentUser = () =>
  api<User>('/me');

export const editUser = (request: EditUserRequest) => {
  const formData = new FormData();
  formData.append("avatar", request.avatar);
  return api<User>('/user/edit', { method: "PUT", body: formData });
};
