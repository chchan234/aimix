# AI Models Usage

AI PORT 서비스에서 사용하는 AI 모델 목록

## 🤖 OpenAI (gpt-4o-mini)

텍스트 분석 및 일반 AI 서비스

| 서비스명 | 함수명 | 설명 |
|---------|--------|------|
| 텍스트 생성 | `generateText` | 일반 텍스트 생성 |
| 이름 분석 | `analyzeNameMeaning` | 성명학 기반 이름 분석 |
| 스토리 생성 | `generateStory` | AI 스토리 생성 |
| 프로필 사진 | `generateProfessionalHeadshot` | AI 프로필 사진 생성 |
| 닮은꼴 찾기 | `findLookalike` | 유명인/동물/애니 닮은꼴 |
| 반려동물 찰떡궁합 | `analyzePetSoulmate` | 반려동물 성격 분석 |
| 연예인 도플갱어 | `findCelebrityDoppelganger` | 닮은 연예인 찾기 |
| 체형 분석 | `analyzeBodyType` | AI 체형 분석 |
| 피부 분석 | `analyzeSkin` | AI 피부 상태 분석 |
| BMI 계산 | `calculateBMI` | AI BMI 계산기 |
| 퍼스널 컬러 분석 | `analyzePersonalColor` | 퍼스널 컬러 진단 |
| 관상 분석 | `analyzeFaceReading` | 관상학 기반 얼굴 분석 (openai.ts) |

## 🎨 Google Gemini (gemini-2.5-flash-image)

이미지 생성 및 변환 서비스 (총 10개)

| 서비스명 | 함수명 | 설명 |
|---------|--------|------|
| 1. AI 프로필 생성 | `generateProfile` | 텍스트 설명으로 프로필 생성 |
| 2. AI 캐리커쳐 | `generateCaricature` | 얼굴 캐리커쳐 생성 |
| 3. AI 증명사진 | `generateIdPhoto` | 증명사진 배경 변경 |
| 4. AI 노화/회춘 | `transformAge` | 나이 변환 시뮬레이션 |
| 5. AI 성별전환 | `swapGender` | 성별 전환 시뮬레이션 |
| 6. 흑백사진 컬러화 | `colorizePhoto` | 흑백사진 컬러 복원 |
| 7. AI 배경 제거/변경 | `removeBackground` | 배경 제거 및 변경 |
| 8. AI 헤어스타일 변경 | `changeHairstyle` | 헤어스타일 변경 시뮬레이션 |
| 9. AI 타투 시뮬레이션 | `addTattoo` | 타투 미리보기 |
| 10. 2세 얼굴 예측 | `generateBabyFace` | 부모 사진으로 아기 얼굴 예측 |

## 📝 업데이트 이력

- 2025-01-22: gemini-2.0-flash-exp 제거, gemini-2.5-flash-image와 gpt-4o-mini로 통일
- 2025-01-22: AI 모델 사용 문서 생성
