-- Migration 007: Insert initial services
-- Adds core AI services to the services table

-- Insert services (using ON CONFLICT DO UPDATE to make migration idempotent)
INSERT INTO services (category, service_type, name_ko, name_en, description_ko, description_en, credit_cost, is_active)
VALUES
  ('fortune', 'face-reading', 'AI 관상 분석', 'AI Face Reading', '얼굴 특징을 분석하여 성격과 운세를 알려드립니다', 'Analyze facial features to reveal personality and fortune', 25, true),
  ('fortune', 'saju', 'AI 사주팔자', 'AI Saju (Four Pillars)', '생년월일시를 기반으로 사주를 풀이합니다', 'Interpret your Four Pillars based on birth date and time', 25, true),
  ('fortune', 'palmistry', 'AI 수상 분석', 'AI Palmistry', '손금을 분석하여 운세와 성격을 알려드립니다', 'Analyze palm lines to reveal fortune and personality', 25, true),
  ('fortune', 'horoscope', 'AI 별자리 운세', 'AI Horoscope', '서양 별자리 기반 운세를 제공합니다', 'Western zodiac-based fortune reading', 15, true),
  ('fortune', 'zodiac', 'AI 띠 운세', 'AI Chinese Zodiac', '12띠 기반 올해 운세를 제공합니다', 'Chinese zodiac-based yearly fortune', 15, true),
  ('fortune', 'love-compatibility', 'AI 연애궁합', 'AI Love Compatibility', '두 사람의 연애 궁합을 분석합니다', 'Analyze love compatibility between two people', 20, true),
  ('fortune', 'name-compatibility', 'AI 이름궁합', 'AI Name Compatibility', '이름으로 두 사람의 궁합을 분석합니다', 'Analyze compatibility based on names', 15, true),
  ('fortune', 'marriage-compatibility', 'AI 결혼궁합', 'AI Marriage Compatibility', '결혼 궁합을 종합적으로 분석합니다', 'Comprehensive marriage compatibility analysis', 25, true)
ON CONFLICT (category, service_type) DO UPDATE SET
  name_ko = EXCLUDED.name_ko,
  name_en = EXCLUDED.name_en,
  description_ko = EXCLUDED.description_ko,
  description_en = EXCLUDED.description_en,
  credit_cost = EXCLUDED.credit_cost,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
