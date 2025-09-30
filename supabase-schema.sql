-- Life Graph Maker 데이터베이스 스키마
-- Supabase PostgreSQL용

-- 1. 사용자 프로필 테이블 (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 그래프 테이블
CREATE TABLE IF NOT EXISTS graphs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL CHECK (length(title) >= 1 AND length(title) <= 200),
  description TEXT,
  color TEXT DEFAULT '#2196F3',
  theme TEXT DEFAULT 'modern' CHECK (theme IN ('modern', 'handwritten')),
  
  -- 공유 설정
  is_public BOOLEAN DEFAULT FALSE,
  share_settings JSONB DEFAULT '{"view": false, "comment": false, "edit": false}',
  
  -- 메타데이터
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 이벤트 테이블
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  graph_id UUID REFERENCES graphs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- 이벤트 기본 정보
  title TEXT NOT NULL CHECK (length(title) >= 1 AND length(title) <= 200),
  description TEXT,
  date DATE NOT NULL,
  end_date DATE,
  
  -- 감정 및 중요도
  emotion_score INTEGER CHECK (emotion_score >= -10 AND emotion_score <= 10),
  importance_rate INTEGER DEFAULT 3 CHECK (importance_rate >= 1 AND importance_rate <= 5),
  
  -- 카테고리 및 색상
  category TEXT DEFAULT '기타',
  color TEXT,
  
  -- 이미지
  image_url TEXT,
  image_path TEXT, -- Supabase Storage 경로
  
  -- 순서 및 위치
  order_index INTEGER,
  position_x FLOAT,
  position_y FLOAT,
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 공유 링크 테이블
CREATE TABLE IF NOT EXISTS graph_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  graph_id UUID REFERENCES graphs(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- 공유 설정
  share_token TEXT UNIQUE NOT NULL,
  permission_level TEXT DEFAULT 'view' CHECK (permission_level IN ('view', 'comment', 'edit')),
  password_hash TEXT, -- 비밀번호 보호 공유용
  
  -- 만료 설정
  expires_at TIMESTAMPTZ,
  max_views INTEGER,
  current_views INTEGER DEFAULT 0,
  
  -- 상태
  is_active BOOLEAN DEFAULT TRUE,
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 댓글 테이블 (공유된 그래프용)
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  graph_id UUID REFERENCES graphs(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE, -- NULL이면 그래프 전체 댓글
  
  -- 작성자 정보
  author_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  author_name TEXT, -- 비로그인 사용자의 경우
  author_email TEXT,
  
  -- 댓글 내용
  content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 1000),
  
  -- 댓글 트리 구조
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- 상태
  is_deleted BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 협업자 테이블
CREATE TABLE IF NOT EXISTS collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  graph_id UUID REFERENCES graphs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL NOT NULL,
  
  -- 권한 설정
  permission_level TEXT DEFAULT 'view' CHECK (permission_level IN ('view', 'comment', 'edit', 'admin')),
  
  -- 초대 상태
  invitation_status TEXT DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'accepted', 'declined')),
  invitation_token TEXT UNIQUE,
  
  -- 날짜
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  
  UNIQUE(graph_id, user_id)
);

-- 7. 활동 로그 테이블 (선택사항)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  graph_id UUID REFERENCES graphs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  -- 활동 정보
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'share', 'comment' 등
  target_type TEXT NOT NULL, -- 'graph', 'event', 'comment', 'share' 등
  target_id UUID,
  
  -- 변경 내용 (선택사항)
  changes JSONB,
  
  -- IP 및 사용자 에이전트 (선택사항)
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 인덱스 생성
-- ============================================================================

-- 그래프 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_graphs_user_id ON graphs(user_id);
CREATE INDEX IF NOT EXISTS idx_graphs_is_public ON graphs(is_public);
CREATE INDEX IF NOT EXISTS idx_graphs_updated_at ON graphs(updated_at DESC);

-- 이벤트 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_events_graph_id ON events(graph_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_order_index ON events(order_index);

-- 공유 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_graph_shares_token ON graph_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_graph_shares_graph_id ON graph_shares(graph_id);
CREATE INDEX IF NOT EXISTS idx_graph_shares_active ON graph_shares(is_active);

-- 댓글 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_comments_graph_id ON comments(graph_id);
CREATE INDEX IF NOT EXISTS idx_comments_event_id ON comments(event_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- 협업자 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_collaborators_graph_id ON collaborators(graph_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user_id ON collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_token ON collaborators(invitation_token);

-- 활동 로그 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_activity_logs_graph_id ON activity_logs(graph_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================================================
-- 트리거 및 함수
-- ============================================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 각 테이블에 updated_at 트리거 적용
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_graphs_updated_at BEFORE UPDATE ON graphs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_graph_shares_updated_at BEFORE UPDATE ON graph_shares 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 사용자 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- 새 사용자 등록 시 프로필 자동 생성 트리거
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- RLS (Row Level Security) 정책
-- ============================================================================

-- RLS 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE graphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 사용자 프로필 정책
CREATE POLICY "사용자는 자신의 프로필만 볼 수 있음" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "사용자는 자신의 프로필만 업데이트할 수 있음" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 그래프 정책
CREATE POLICY "사용자는 자신의 그래프를 볼 수 있음" ON graphs
  FOR SELECT USING (
    auth.uid() = user_id OR 
    is_public = true OR
    EXISTS (
      SELECT 1 FROM collaborators 
      WHERE graph_id = graphs.id 
      AND user_id = auth.uid() 
      AND invitation_status = 'accepted'
    )
  );

CREATE POLICY "사용자는 자신의 그래프를 생성할 수 있음" ON graphs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 그래프를 수정할 수 있음" ON graphs
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM collaborators 
      WHERE graph_id = graphs.id 
      AND user_id = auth.uid() 
      AND permission_level IN ('edit', 'admin')
      AND invitation_status = 'accepted'
    )
  );

CREATE POLICY "사용자는 자신의 그래프를 삭제할 수 있음" ON graphs
  FOR DELETE USING (auth.uid() = user_id);

-- 이벤트 정책
CREATE POLICY "사용자는 접근 가능한 그래프의 이벤트를 볼 수 있음" ON events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM graphs 
      WHERE graphs.id = events.graph_id 
      AND (
        graphs.user_id = auth.uid() OR 
        graphs.is_public = true OR
        EXISTS (
          SELECT 1 FROM collaborators 
          WHERE collaborators.graph_id = graphs.id 
          AND collaborators.user_id = auth.uid() 
          AND collaborators.invitation_status = 'accepted'
        )
      )
    )
  );

CREATE POLICY "사용자는 자신의 그래프에 이벤트를 생성할 수 있음" ON events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM graphs 
      WHERE graphs.id = events.graph_id 
      AND (
        graphs.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM collaborators 
          WHERE collaborators.graph_id = graphs.id 
          AND collaborators.user_id = auth.uid() 
          AND collaborators.permission_level IN ('edit', 'admin')
          AND collaborators.invitation_status = 'accepted'
        )
      )
    )
  );

CREATE POLICY "사용자는 편집 권한이 있는 이벤트를 수정할 수 있음" ON events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM graphs 
      WHERE graphs.id = events.graph_id 
      AND (
        graphs.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM collaborators 
          WHERE collaborators.graph_id = graphs.id 
          AND collaborators.user_id = auth.uid() 
          AND collaborators.permission_level IN ('edit', 'admin')
          AND collaborators.invitation_status = 'accepted'
        )
      )
    )
  );

CREATE POLICY "사용자는 편집 권한이 있는 이벤트를 삭제할 수 있음" ON events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM graphs 
      WHERE graphs.id = events.graph_id 
      AND (
        graphs.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM collaborators 
          WHERE collaborators.graph_id = graphs.id 
          AND collaborators.user_id = auth.uid() 
          AND collaborators.permission_level IN ('edit', 'admin')
          AND collaborators.invitation_status = 'accepted'
        )
      )
    )
  );

-- ============================================================================
-- Storage 버킷 설정 (이미지 업로드용)
-- ============================================================================

-- 이벤트 이미지용 스토리지 버킷 생성
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'event-images',
--   'event-images',
--   true,
--   5242880, -- 5MB
--   '{"image/jpeg", "image/png", "image/gif", "image/webp"}'
-- );

-- 스토리지 정책 (사용자는 자신의 이미지만 업로드 가능)
-- CREATE POLICY "사용자는 자신의 이미지를 업로드할 수 있음" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'event-images' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "모든 사용자는 이미지를 볼 수 있음" ON storage.objects
--   FOR SELECT USING (bucket_id = 'event-images');

-- CREATE POLICY "사용자는 자신의 이미지를 삭제할 수 있음" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'event-images' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- ============================================================================
-- 초기 데이터 (선택사항)
-- ============================================================================

-- 기본 카테고리 설정은 애플리케이션 레벨에서 처리