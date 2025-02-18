-- Create a function to get leaderboard data
CREATE OR REPLACE FUNCTION get_leaderboard(
  p_limit integer DEFAULT 100,
  p_time_period text DEFAULT 'all',
  p_sort_by text DEFAULT 'wpm'
)
RETURNS TABLE (
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  average_wpm integer,
  average_accuracy integer,
  total_lessons_completed integer,
  level integer,
  achievements_count bigint,
  rank bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date timestamp;
BEGIN
  -- Set time period filter
  CASE p_time_period
    WHEN 'today' THEN
      v_start_date := current_date;
    WHEN 'week' THEN
      v_start_date := date_trunc('week', current_date);
    WHEN 'month' THEN
      v_start_date := date_trunc('month', current_date);
    ELSE
      v_start_date := '1970-01-01'::timestamp;
  END CASE;

  -- Return leaderboard data
  RETURN QUERY
  WITH achievement_counts AS (
    SELECT
      user_id,
      COUNT(*) as achievements_count
    FROM user_achievements
    GROUP BY user_id
  ),
  ranked_users AS (
    SELECT
      p.id,
      p.username,
      p.full_name,
      p.avatar_url,
      p.average_wpm,
      p.average_accuracy,
      p.total_lessons_completed,
      p.level,
      COALESCE(ac.achievements_count, 0) as achievements_count,
      ROW_NUMBER() OVER (
        ORDER BY
          CASE p_sort_by
            WHEN 'wpm' THEN p.average_wpm
            WHEN 'accuracy' THEN p.average_accuracy
            WHEN 'lessons' THEN p.total_lessons_completed
            WHEN 'achievements' THEN COALESCE(ac.achievements_count, 0)
          END DESC
      ) as rank
    FROM profiles p
    LEFT JOIN achievement_counts ac ON p.id = ac.user_id
    WHERE
      CASE p_time_period
        WHEN 'all' THEN true
        ELSE p.last_lesson_date >= v_start_date
      END
  )
  SELECT *
  FROM ranked_users
  LIMIT p_limit;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_leaderboard TO authenticated;