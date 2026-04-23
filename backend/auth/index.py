import json
import os
import hashlib
import secrets
import psycopg2

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def hash_password(password: str, salt: str) -> str:
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()

def handler(event: dict, context) -> dict:
    """Регистрация и вход пользователей"""
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    body = json.loads(event.get("body") or "{}")
    action = body.get("action")

    conn = get_conn()
    cur = conn.cursor()

    if action == "register":
        name = body.get("name", "").strip()
        email = body.get("email", "").strip().lower()
        password = body.get("password", "")

        if not name or not email or not password:
            return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Заполните все поля"})}

        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            conn.close()
            return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Email уже занят"})}

        salt = secrets.token_hex(16)
        pw_hash = f"{salt}:{hash_password(password, salt)}"
        colors = ["from-purple-500 to-pink-500", "from-cyan-500 to-blue-500", "from-green-500 to-teal-500", "from-orange-500 to-red-500", "from-pink-500 to-rose-500"]
        color = colors[len(email) % len(colors)]

        cur.execute(
            "INSERT INTO users (name, email, password_hash, avatar_color) VALUES (%s, %s, %s, %s) RETURNING id",
            (name, email, pw_hash, color)
        )
        user_id = cur.fetchone()[0]
        session = secrets.token_hex(32)
        conn.commit()
        conn.close()

        return {"statusCode": 200, "headers": headers, "body": json.dumps({
            "ok": True, "user": {"id": user_id, "name": name, "email": email, "avatar_color": color},
            "session": session
        })}

    elif action == "login":
        email = body.get("email", "").strip().lower()
        password = body.get("password", "")

        cur.execute("SELECT id, name, email, password_hash, avatar_color FROM users WHERE email = %s", (email,))
        row = cur.fetchone()
        conn.close()

        if not row:
            return {"statusCode": 401, "headers": headers, "body": json.dumps({"error": "Неверный email или пароль"})}

        user_id, name, email_db, pw_hash, color = row
        salt, stored_hash = pw_hash.split(":", 1)
        if hash_password(password, salt) != stored_hash:
            return {"statusCode": 401, "headers": headers, "body": json.dumps({"error": "Неверный email или пароль"})}

        session = secrets.token_hex(32)
        return {"statusCode": 200, "headers": headers, "body": json.dumps({
            "ok": True, "user": {"id": user_id, "name": name, "email": email_db, "avatar_color": color},
            "session": session
        })}

    conn.close()
    return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Неизвестное действие"})}
