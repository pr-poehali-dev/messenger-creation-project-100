import json
import os
import base64
import uuid
import boto3
import psycopg2

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    """Загрузка голосового сообщения в S3 и сохранение в БД"""
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    body = json.loads(event.get("body") or "{}")
    user_id = int(body.get("user_id") or 0)
    to_user_id = int(body.get("to_user_id") or 0)
    conv_id = body.get("conv_id")
    audio_b64 = body.get("audio")

    if not user_id or not audio_b64:
        return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Нет данных"})}

    audio_bytes = base64.b64decode(audio_b64)
    file_key = f"voice/{uuid.uuid4()}.webm"

    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    s3.put_object(Bucket="files", Key=file_key, Body=audio_bytes, ContentType="audio/webm")
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"

    conn = get_conn()
    cur = conn.cursor()

    if not conv_id:
        cur.execute("INSERT INTO conversations DEFAULT VALUES RETURNING id")
        conv_id = cur.fetchone()[0]
        cur.execute("INSERT INTO conversation_members (conversation_id, user_id) VALUES (%s, %s), (%s, %s)",
                    (conv_id, user_id, conv_id, to_user_id))

    cur.execute(
        "INSERT INTO messages (conversation_id, sender_id, text, voice_url) VALUES (%s, %s, %s, %s) RETURNING id, to_char(created_at, 'HH24:MI')",
        (conv_id, user_id, "🎤 Голосовое сообщение", cdn_url)
    )
    msg_id, time = cur.fetchone()
    conn.commit()
    conn.close()

    return {"statusCode": 200, "headers": headers, "body": json.dumps({
        "ok": True, "msg_id": msg_id, "conv_id": conv_id, "time": time, "voice_url": cdn_url
    })}
