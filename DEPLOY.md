# DarrovGo Deploy Qo'llanmasi

## 1. GitHub Repo

```bash
# GitHub.com ga kiring, yangi repo: darrovgo (Public)
# Keyin terminalda:
git remote add origin https://github.com/YOUR_USERNAME/darrovgo.git
git push -u origin master
```

## 2. Railway (Backend)

1. **railway.app** ga kiring (islombeksobrirjonov1821@gmail.com)
2. **New Project** → **Deploy from GitHub repo** → **darrovgo**
3. **Root Directory** = `backend`
4. **Add Variables** (Settings → Variables):
   ```
   DATABASE_URL=postgresql://...  (Railway PostgreSQL qo'shingiz)
   JWT_SECRET=darrovgo_super_secret_key_2026
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_ADMIN_CHAT_ID=your_chat_id
   PORT=3000
   ```
5. **Add Database**: New Service → Database → PostgreSQL
6. Keyin DATABASE_URL ni PostgreSQL dan ko'chiring

### Seed data (birinchi marta):
```bash
cd backend
npm install
npx prisma db push
node src/seed.js
```

## 3. Frontend API ulash

`src/api/config.ts` yaratib, backend URL ni qo'yish kerak:
```typescript
export const API_URL = 'https://your-backend.railway.app/api';
```

## 4. APK

Build davom etmoqda:
https://expo.dev/accounts/montrax/projects/darrovgo/builds/f3c44a9a-96d2-4831-87db-1859871287e6

Tayyor bo'lgach yuklab oling.

## Test Raqamlari (Seed dan)
- Superadmin: +998 90 123 45 67
- Admin:      +998 90 123 45 68
- Restoran 1: +998 90 111 11 11
- Kuryer 1:   +998 90 444 44 44
