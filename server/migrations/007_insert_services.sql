-- Migration 007: Insert initial services
-- Adds core AI services to the services table

-- Insert services (using ON CONFLICT DO NOTHING to make migration idempotent)
INSERT INTO services (category, service_type, name_ko, name_en, description_ko, description_en, credit_cost, is_active)
VALUES
  ('fortune', 'face-reading', 'AI 관상 분석', 'AI Face Reading', '얼굴 특징을 분석하여 성격과 운세를 알려드립니다', 'Analyze facial features to reveal personality and fortune', 25, true),
  ('fortune', 'saju', 'AI 사주팔자', 'AI Saju (Four Pillars)', '생년월일시를 기반으로 사주를 풀이합니다', 'Interpret your Four Pillars based on birth date and time', 25, true),
  ('fortune', 'tarot', 'AI 타로 카드', 'AI Tarot Reading', '타로 카드로 현재와 미래를 예측합니다', 'Predict present and future with tarot cards', 20, true),
  ('fortune', 'tojeong', 'AI 토정비결', 'AI Tojeong Bigyeol', '토정비결로 올해 운세를 알려드립니다', 'Predict this year''s fortune with Tojeong Bigyeol', 15, true),
  ('fortune', 'dream', 'AI 꿈해몽', 'AI Dream Interpretation', '꿈의 의미를 해석해드립니다', 'Interpret the meaning of your dreams', 15, true)
ON CONFLICT (category, service_type) DO UPDATE SET
  name_ko = EXCLUDED.name_ko,
  name_en = EXCLUDED.name_en,
  description_ko = EXCLUDED.description_ko,
  description_en = EXCLUDED.description_en,
  credit_cost = EXCLUDED.credit_cost,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
