create extension if not exists "uuid-ossp";

create table if not exists jobs (
  id uuid primary key default uuid_generate_v4(),
  slug text unique,
  title text not null,
  company text not null,
  domain text,
  role text,
  location text,
  description text,
  snapshot text,
  prompt_title text,
  prompt_body text,
  recruiter_email text,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists applications (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade,
  tracker_token text unique not null,
  name text not null,
  email text not null,
  age int,
  work_auth text,
  video_url text,
  text_response text,
  submission_mode text default 'video',
  status text default 'Application Delivered',
  consent boolean default false,
  consent_ip text,
  consent_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists actions (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid references applications(id) on delete cascade,
  hr_email text,
  action_type text,
  note text,
  created_at timestamptz default now()
);

create policy "allow_insert_applications" on applications
  for insert
  with check (true);

create policy "allow_read_own_application" on applications
  for select
  using (
    auth.uid() = null and tracker_token is not null
  );

create policy "hr_read_all_applications" on applications
  for select
  using (
    auth.email() in (select recruiter_email from jobs where jobs.id = applications.job_id)
  );

alter table applications enable row level security;
alter table jobs enable row level security;
alter table actions enable row level security;
