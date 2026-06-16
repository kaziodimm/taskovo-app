alter table public.tasks
  add column if not exists admin_cancel_reason text,
  add column if not exists admin_cancelled_at timestamptz,
  add column if not exists admin_cancelled_by text;

comment on column public.tasks.admin_cancel_reason is 'Admin-entered reason shown to task participants when an order is cancelled by Taskovo.';
comment on column public.tasks.admin_cancelled_at is 'Timestamp when Taskovo cancelled the order.';
comment on column public.tasks.admin_cancelled_by is 'Admin identifier or display name responsible for the cancellation.';
