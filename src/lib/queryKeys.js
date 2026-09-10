/**
 * Query Key Factory
 * Centralized, structured, and predictable query keys for all entities.
 * Never hand-write inline query key arrays.
 */

export const newsKeys = {
  all: ["news"],
  lists: () => [...newsKeys.all, "list"],
  list: (filters = {}) => [...newsKeys.lists(), filters],
  details: () => [...newsKeys.all, "detail"],
  detail: (id) => [...newsKeys.details(), String(id)],
};

export const teamKeys = {
  all: ["team"],
  lists: () => [...teamKeys.all, "list"],
  list: () => [...teamKeys.lists()],
  details: () => [...teamKeys.all, "detail"],
  detail: (id) => [...teamKeys.details(), String(id)],
};

export const messagesKeys = {
  all: ["messages"],
  lists: () => [...messagesKeys.all, "list"],
  list: () => [...messagesKeys.lists()],
  details: () => [...messagesKeys.all, "detail"],
  detail: (id) => [...messagesKeys.details(), String(id)],
};

export const webUsersKeys = {
  all: ["webUsers"],
  lists: () => [...webUsersKeys.all, "list"],
  list: () => [...webUsersKeys.lists()],
  details: () => [...webUsersKeys.all, "detail"],
  detail: (id) => [...webUsersKeys.details(), String(id)],
};

export const siteConfigKeys = {
  all: ["siteConfig"],
  detail: () => [...siteConfigKeys.all, "detail"],
};

export const assetsKeys = {
  all: ["assets"],
  lists: () => [...assetsKeys.all, "list"],
  list: () => [...assetsKeys.lists()],
  details: () => [...assetsKeys.all, "detail"],
  detail: (key) => [...assetsKeys.details(), String(key)],
};

export const feedbacksKeys = {
  all: ["feedbacks"],
  lists: () => [...feedbacksKeys.all, "list"],
  list: () => [...feedbacksKeys.lists()],
  details: () => [...feedbacksKeys.all, "detail"],
  detail: (id) => [...feedbacksKeys.details(), String(id)],
};

