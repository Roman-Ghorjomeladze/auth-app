export const RMQ_SERVICE = {
  USER: 'USER_SERVICE',
} as const;

export const RMQ_PATTERN = {
  USER_PROFILE_GET: 'user.profile.get',
  USER_UPSERT_GOOGLE: 'user.upsertGoogle',
  USER_PROFILE_UPDATE: 'user.profile.update',
  USER_PROFILE_UPDATED_EVT: 'user.profile.updated',
} as const;
