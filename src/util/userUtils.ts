import type { User } from "../types/users";

export function normalizeUser(data: any): User {
  return {
    sports: [],
    savedBlogIds: [],
    savedProductIds: [],
    ...data,
  };
}