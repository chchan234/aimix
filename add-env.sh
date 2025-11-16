#!/bin/bash

cd /Users/ichan-u/aimix

# SUPABASE_URL
echo "https://ssmrlqzbwigzwtlpjsiz.supabase.co" | vercel env add SUPABASE_URL preview
echo "https://ssmrlqzbwigzwtlpjsiz.supabase.co" | vercel env add SUPABASE_URL development

# SUPABASE_ANON_KEY
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzbXJscXpid2lnend0bHBqc2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxOTA0ODMsImV4cCI6MjA3ODc2NjQ4M30.1743nKPtAMtXGDTap5opw1dx3cRrrfIirgzYY0HsAhQ" | vercel env add SUPABASE_ANON_KEY production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzbXJscXpid2lnend0bHBqc2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxOTA0ODMsImV4cCI6MjA3ODc2NjQ4M30.1743nKPtAMtXGDTap5opw1dx3cRrrfIirgzYY0HsAhQ" | vercel env add SUPABASE_ANON_KEY preview
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzbXJscXpid2lnend0bHBqc2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxOTA0ODMsImV4cCI6MjA3ODc2NjQ4M30.1743nKPtAMtXGDTap5opw1dx3cRrrfIirgzYY0HsAhQ" | vercel env add SUPABASE_ANON_KEY development

# SUPABASE_SERVICE_KEY
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzbXJscXpid2lnend0bHBqc2l6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE5MDQ4MywiZXhwIjoyMDc4NzY2NDgzfQ.AIVvMh0eAAn45eebYtxRrMcOzuZXBaXTbKy1EoPmWrE" | vercel env add SUPABASE_SERVICE_KEY production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzbXJscXpid2lnend0bHBqc2l6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE5MDQ4MywiZXhwIjoyMDc4NzY2NDgzfQ.AIVvMh0eAAn45eebYtxRrMcOzuZXBaXTbKy1EoPmWrE" | vercel env add SUPABASE_SERVICE_KEY preview
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzbXJscXpid2lnend0bHBqc2l6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE5MDQ4MywiZXhwIjoyMDc4NzY2NDgzfQ.AIVvMh0eAAn45eebYtxRrMcOzuZXBaXTbKy1EoPmWrE" | vercel env add SUPABASE_SERVICE_KEY development

# DATABASE_URL
echo "postgresql://postgres:zzxxcc556611@db.ssmrlqzbwigzwtlpjsiz.supabase.co:5432/postgres" | vercel env add DATABASE_URL production
echo "postgresql://postgres:zzxxcc556611@db.ssmrlqzbwigzwtlpjsiz.supabase.co:5432/postgres" | vercel env add DATABASE_URL preview
echo "postgresql://postgres:zzxxcc556611@db.ssmrlqzbwigzwtlpjsiz.supabase.co:5432/postgres" | vercel env add DATABASE_URL development

# JWT_SECRET
echo "29b711bd08ebfbaf94ea14d12853a5afad22308a10a9336d82a5a4ed2f32ea5a" | vercel env add JWT_SECRET production
echo "29b711bd08ebfbaf94ea14d12853a5afad22308a10a9336d82a5a4ed2f32ea5a" | vercel env add JWT_SECRET preview
echo "29b711bd08ebfbaf94ea14d12853a5afad22308a10a9336d82a5a4ed2f32ea5a" | vercel env add JWT_SECRET development

# NODE_ENV
echo "production" | vercel env add NODE_ENV production
echo "preview" | vercel env add NODE_ENV preview
echo "development" | vercel env add NODE_ENV development

# CLIENT_URL
echo "https://www.aiports.org" | vercel env add CLIENT_URL production
echo "https://www.aiports.org" | vercel env add CLIENT_URL preview
echo "http://localhost:5173" | vercel env add CLIENT_URL development

# PORT
echo "3000" | vercel env add PORT production
echo "3000" | vercel env add PORT preview
echo "3000" | vercel env add PORT development

echo "✅ All environment variables added successfully!"
