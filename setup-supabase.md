# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase 대시보드](https://supabase.com/dashboard)에 접속
2. "New Project" 클릭
3. 프로젝트 설정:
   - **Name**: `life-graph-maker`
   - **Database Password**: 강력한 비밀번호 설정
   - **Region**: `Northeast Asia (ap-northeast-1)`

## 2. 환경변수 설정

프로젝트 생성 후 Settings > API에서:
1. **URL** 복사 → `.env.local`의 `VITE_SUPABASE_URL`에 붙여넣기
2. **anon public key** 복사 → `.env.local`의 `VITE_SUPABASE_ANON_KEY`에 붙여넣기

## 3. 데이터베이스 스키마 적용

### 방법 1: SQL 에디터 사용
1. Supabase 대시보드 > **SQL Editor**
2. "New query" 클릭
3. `supabase-schema.sql` 파일 내용 복사 후 붙여넣기
4. "Run" 버튼 클릭

### 방법 2: Supabase CLI 사용 (권장)
```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 연결
supabase link --project-ref your-project-id

# 스키마 적용
supabase db push

# 또는 직접 SQL 실행
supabase db reset
```

## 4. Storage 버킷 생성

1. Supabase 대시보드 > **Storage**
2. "Create a new bucket" 클릭
3. 버킷 설정:
   - **Name**: `event-images`
   - **Public bucket**: ✅ 체크
   - **File size limit**: `5MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`

## 5. 연결 테스트

개발 서버를 실행하여 Supabase 연결이 정상적으로 작동하는지 확인:

```bash
npm run dev
```

브라우저 콘솔에서 "✅ Supabase 클라이언트가 초기화되었습니다." 메시지를 확인하세요.

## 다음 단계

1. Authentication UI 컴포넌트 개발
2. 기존 localStorage 데이터를 Supabase로 마이그레이션
3. 실시간 협업 기능 구현
4. 공유 기능 구현