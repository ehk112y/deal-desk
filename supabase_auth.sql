-- Deal Desk 인증: 이메일 + 비밀번호 가입, 단 허용된 이메일만.
-- Supabase SQL Editor 에 통째로 붙여넣고 실행한다. 여러 번 실행해도 안전하다(idempotent).
--
-- 대시보드에서 직접 켜야 하는 토글 2개 (Authentication → Providers → Email):
--   1) "Allow new users to sign up" = ON
--      가입 폼이 동작하려면 켜야 한다. 이걸 켜도 아무나 가입되지는 않는다.
--   2) "Confirm email" = ON (지금 상태 유지)
--      메일의 확인 링크를 누르기 전에는 로그인되지 않는다.
--
-- 실제로 낯선 사람을 막는 것은 아래 auth.users BEFORE INSERT 트리거다.
-- allowed_emails 목록에 없는 주소로 가입하면 'signup not allowed' 오류가 나고 계정이 만들어지지 않는다.
-- 기존 매직링크 계정은 비밀번호가 없으므로, 홈 화면의 "Forgot password?" 로 비밀번호를 한 번 설정한 뒤 로그인한다.
-- 기존 테이블(requests, fin_requests 등)과 정책은 건드리지 않는다.

create table if not exists public.allowed_emails (
  email text primary key check (email = lower(email)),
  note text,
  created_at timestamptz default now()
);

insert into public.allowed_emails (email, note)
values ('ehk112y@gmail.com', 'owner')
on conflict do nothing;

-- security definer: anon 이 읽을 수 없는 목록을 트리거가 대신 확인한다.
create or replace function public.check_allowed_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.allowed_emails where email = lower(new.email)) then
    raise exception 'signup not allowed';
  end if;
  return new;
end;
$$;

drop trigger if exists check_allowed_email on auth.users;
create trigger check_allowed_email
  before insert on auth.users
  for each row execute function public.check_allowed_email();

-- 목록 자체는 소유자만 보고 고칠 수 있다.
alter table public.allowed_emails enable row level security;

drop policy if exists allowed_emails_owner_select on public.allowed_emails;
create policy allowed_emails_owner_select on public.allowed_emails
  for select using ((select auth.jwt() ->> 'email') = 'ehk112y@gmail.com');

drop policy if exists allowed_emails_owner_insert on public.allowed_emails;
create policy allowed_emails_owner_insert on public.allowed_emails
  for insert with check ((select auth.jwt() ->> 'email') = 'ehk112y@gmail.com');

drop policy if exists allowed_emails_owner_delete on public.allowed_emails;
create policy allowed_emails_owner_delete on public.allowed_emails
  for delete using ((select auth.jwt() ->> 'email') = 'ehk112y@gmail.com');
