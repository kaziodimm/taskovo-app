create unique index if not exists client_profiles_auth_user_id_unique
  on public.client_profiles(auth_user_id)
  where auth_user_id is not null;

create unique index if not exists tasker_profiles_auth_user_id_unique
  on public.tasker_profiles(auth_user_id)
  where auth_user_id is not null;

create unique index if not exists tasker_profiles_email_unique
  on public.tasker_profiles(lower(email))
  where email is not null;
