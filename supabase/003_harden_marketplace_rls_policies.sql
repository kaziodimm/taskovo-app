drop policy if exists "Anyone can create client profile" on public.client_profiles;
drop policy if exists "Anyone can register as tasker" on public.tasker_profiles;
drop policy if exists "Anyone can create a task" on public.tasks;
drop policy if exists "Anyone can submit an offer" on public.offers;
drop policy if exists "Task attachment images are publicly readable" on storage.objects;

alter function public.set_updated_at() set search_path = public, pg_temp;

create policy "Participants can read task messages"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.tasks t
    where t.id = messages.task_id
      and auth.uid() in (t.client_auth_user_id, t.assigned_tasker_auth_user_id)
  )
);

create policy "Participants can send task messages"
on public.messages
for insert
to authenticated
with check (
  auth.uid() = sender_auth_user_id
  and exists (
    select 1
    from public.tasks t
    where t.id = messages.task_id
      and auth.uid() in (t.client_auth_user_id, t.assigned_tasker_auth_user_id)
      and t.assigned_tasker_auth_user_id is not null
  )
);

create policy "Users can manage own message reads"
on public.message_reads
for all
to authenticated
using (
  auth.uid() = auth_user_id
  and exists (
    select 1
    from public.tasks t
    where t.id = message_reads.task_id
      and auth.uid() in (t.client_auth_user_id, t.assigned_tasker_auth_user_id)
  )
)
with check (
  auth.uid() = auth_user_id
  and exists (
    select 1
    from public.tasks t
    where t.id = message_reads.task_id
      and auth.uid() in (t.client_auth_user_id, t.assigned_tasker_auth_user_id)
  )
);

create policy "Public can read reviews"
on public.reviews
for select
to public
using (true);

create policy "Task clients can create completion reviews"
on public.reviews
for insert
to authenticated
with check (
  exists (
    select 1
    from public.tasks t
    where t.id = reviews.task_id
      and t.client_auth_user_id = auth.uid()
      and t.status = 'completed'
  )
);
