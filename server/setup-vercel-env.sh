#!/bin/bash

# Vercel 환경 변수 설정 스크립트
# Usage: chmod +x setup-vercel-env.sh && ./setup-vercel-env.sh

echo "🚀 Setting up Vercel environment variables..."

# .env 파일 읽기
if [ ! -f ".env" ]; then
  echo "❌ .env file not found!"
  exit 1
fi

# 환경 변수 설정 함수
set_env() {
  local key=$1
  local value=$2
  local env_type=$3  # production, preview, development

  echo "Setting $key for $env_type..."
  echo "$value" | vercel env add "$key" "$env_type" --yes 2>/dev/null || echo "⚠️  $key already exists or failed"
}

# .env 파일에서 값 추출
export $(grep -v '^#' .env | xargs)

# 프로덕션 환경 변수 설정
echo "📝 Setting production environment variables..."

set_env "JWT_SECRET" "$JWT_SECRET" "production"
set_env "SUPABASE_URL" "$SUPABASE_URL" "production"
set_env "SUPABASE_SERVICE_KEY" "$SUPABASE_SERVICE_KEY" "production"
set_env "OPENAI_API_KEY" "$OPENAI_API_KEY" "production"
set_env "GEMINI_API_KEY" "$GEMINI_API_KEY" "production"
set_env "KAKAO_REST_API_KEY" "$KAKAO_REST_API_KEY" "production"
set_env "SENDGRID_API_KEY" "$SENDGRID_API_KEY" "production"
set_env "EMAIL_FROM" "$EMAIL_FROM" "production"
set_env "NODE_ENV" "production" "production"

echo ""
echo "✅ Environment variables setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update CLIENT_URL in Vercel dashboard with production URL"
echo "2. Run 'vercel --prod' to deploy"
