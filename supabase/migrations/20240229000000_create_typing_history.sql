
create table public.typing_history (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    words_per_minute integer not null,
    accuracy_percentage integer not null,
    lesson_level text not null,
    constraint typing_history_accuracy_percentage_check check ((accuracy_percentage >= 0) AND (accuracy_percentage <= 100))
);

-- Add RLS policies
alter table public.typing_history enable row level security;

create policy "Users can insert their own typing history."
    on public.typing_history for insert
    with check ( auth.uid() = user_id );

create policy "Users can view their own typing history."
    on public.typing_history for select
    using ( auth.uid() = user_id );

-- Create index for better query performance
create index typing_history_user_id_idx on public.typing_history(user_id);
