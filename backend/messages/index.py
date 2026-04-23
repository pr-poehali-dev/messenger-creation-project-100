import json
import os
import psycopg2

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    """Отправка и получение сообщений, список чатов"""
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-User-Id",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    params = event.get("queryStringParameters") or {}
    body = json.loads(event.get("body") or "{}")
    action = body.get("action") or params.get("action")
    user_id = int(body.get("user_id") or params.get("user_id") or 0)

    if not user_id:
        return {"statusCode": 401, "headers": headers, "body": json.dumps({"error": "Нет user_id"})}

    conn = get_conn()
    cur = conn.cursor()

    if action == "get_chats":
        cur.execute("""
            SELECT
                u.id, u.name, u.avatar_color, u.last_seen,
                c.id as conv_id,
                (SELECT text FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_msg,
                (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_time
            FROM conversation_members cm
            JOIN conversations c ON c.id = cm.conversation_id
            JOIN conversation_members cm2 ON cm2.conversation_id = c.id AND cm2.user_id != %s
            JOIN users u ON u.id = cm2.user_id
            WHERE cm.user_id = %s
            ORDER BY last_time DESC NULLS LAST
        """, (user_id, user_id))
        rows = cur.fetchall()
        conn.close()

        chats = []
        for r in rows:
            last_time = r[6]
            chats.append({
                "user_id": r[0], "name": r[1], "avatar_color": r[2],
                "conv_id": r[4], "last_msg": r[5] or "",
                "last_time": last_time.strftime("%H:%M") if last_time else ""
            })
        return {"statusCode": 200, "headers": headers, "body": json.dumps({"chats": chats})}

    elif action == "get_users":
        cur.execute("SELECT id, name, avatar_color FROM users WHERE id != %s ORDER BY name", (user_id,))
        rows = cur.fetchall()
        conn.close()
        users = [{"id": r[0], "name": r[1], "avatar_color": r[2]} for r in rows]
        return {"statusCode": 200, "headers": headers, "body": json.dumps({"users": users})}

    elif action == "get_messages":
        conv_id = int(body.get("conv_id") or params.get("conv_id") or 0)
        cur.execute("""
            SELECT m.id, m.sender_id, u.name, m.text,
                   to_char(m.created_at, 'HH24:MI') as time, m.voice_url
            FROM messages m
            JOIN users u ON u.id = m.sender_id
            WHERE m.conversation_id = %s
            ORDER BY m.created_at ASC
        """, (conv_id,))
        rows = cur.fetchall()
        conn.close()
        msgs = [{"id": r[0], "sender_id": r[1], "sender_name": r[2], "text": r[3], "time": r[4], "voice_url": r[5]} for r in rows]
        return {"statusCode": 200, "headers": headers, "body": json.dumps({"messages": msgs})}

    elif action == "send_message":
        to_user_id = int(body.get("to_user_id") or 0)
        conv_id = body.get("conv_id")
        text = body.get("text", "").strip()

        if not text:
            conn.close()
            return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Пустое сообщение"})}

        if not conv_id:
            cur.execute("INSERT INTO conversations DEFAULT VALUES RETURNING id")
            conv_id = cur.fetchone()[0]
            cur.execute("INSERT INTO conversation_members (conversation_id, user_id) VALUES (%s, %s), (%s, %s)",
                        (conv_id, user_id, conv_id, to_user_id))

        cur.execute("INSERT INTO messages (conversation_id, sender_id, text) VALUES (%s, %s, %s) RETURNING id, to_char(created_at, 'HH24:MI')",
                    (conv_id, user_id, text))
        msg_id, time = cur.fetchone()
        conn.commit()
        conn.close()

        return {"statusCode": 200, "headers": headers, "body": json.dumps({
            "ok": True, "msg_id": msg_id, "conv_id": conv_id, "time": time
        })}

    conn.close()
    return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Неизвестное действие"})}