# Настройка BlurPay

## Farcaster Manifest

Manifest доступен по `/.well-known/farcaster.json` (rewrite на `/api/farcaster-manifest`).

### Иконка

Добавь `public/icon.png` — 1024x1024 px, PNG без прозрачности.

### Проверка домена (accountAssociation)

1. Зайди на https://farcaster.xyz/~/developers/new
2. Сгенерируй подпись для своего домена
3. Добавь в `.env.local`:
   ```
   FARCASTER_ACCOUNT_ASSOCIATION='{"header":"...","payload":"...","signature":"..."}'
   ```

### Base Sepolia

Для тестнета добавь в manifest `requiredChains: ["eip155:84532"]` в `app/api/farcaster-manifest/route.ts`.

---

# Настройка Supabase Storage

## 1. Создать bucket'ы

В Supabase Dashboard → **Storage** → **New bucket**:

| Bucket      | Public | Описание                        |
|-------------|--------|---------------------------------|
| `blurred`   | Yes    | Размытые изображения           |
| `originals` | No     | Оригиналы (доступ по signed URL)|
| `metadata`  | Yes    | JSON с creator, price           |

## 2. Переменные окружения

В `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=твой_service_role_ключ
```

**Важно:** `service_role` — секретный ключ, только для сервера. Не использовать в коде с `NEXT_PUBLIC_`.
