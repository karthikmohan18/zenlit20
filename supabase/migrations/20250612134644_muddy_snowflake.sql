/*
  # Add conversations function

  1. Functions
    - `get_conversations` - Get all conversations for a user with last message and unread count

  This function helps efficiently retrieve conversation data for the messages screen.
*/

CREATE OR REPLACE FUNCTION get_conversations(user_id uuid)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  last_message_id uuid,
  last_message_content text,
  last_message_created_at timestamptz,
  unread_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH conversation_partners AS (
    SELECT DISTINCT
      CASE 
        WHEN m.sender_id = user_id THEN m.receiver_id
        ELSE m.sender_id
      END as partner_id
    FROM messages m
    WHERE m.sender_id = user_id OR m.receiver_id = user_id
  ),
  last_messages AS (
    SELECT DISTINCT ON (
      CASE 
        WHEN m.sender_id = user_id THEN m.receiver_id
        ELSE m.sender_id
      END
    )
      m.id as message_id,
      m.content,
      m.created_at,
      CASE 
        WHEN m.sender_id = user_id THEN m.receiver_id
        ELSE m.sender_id
      END as partner_id
    FROM messages m
    WHERE m.sender_id = user_id OR m.receiver_id = user_id
    ORDER BY 
      CASE 
        WHEN m.sender_id = user_id THEN m.receiver_id
        ELSE m.sender_id
      END,
      m.created_at DESC
  ),
  unread_counts AS (
    SELECT 
      m.sender_id as partner_id,
      COUNT(*) as unread_count
    FROM messages m
    WHERE m.receiver_id = user_id AND m.is_read = false
    GROUP BY m.sender_id
  )
  SELECT 
    p.id,
    p.display_name,
    p.avatar_url,
    lm.message_id,
    lm.content,
    lm.created_at,
    COALESCE(uc.unread_count, 0)
  FROM conversation_partners cp
  JOIN profiles p ON p.id = cp.partner_id
  LEFT JOIN last_messages lm ON lm.partner_id = cp.partner_id
  LEFT JOIN unread_counts uc ON uc.partner_id = cp.partner_id
  ORDER BY lm.created_at DESC NULLS LAST;
END;
$$;