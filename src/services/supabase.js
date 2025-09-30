import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 설정 값들을 가져옵니다
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase 클라이언트 생성 및 내보내기
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 자동 토큰 갱신 설정
    autoRefreshToken: true,
    // 세션 영속성 설정 (브라우저 재시작해도 로그인 유지)
    persistSession: true,
    // 세션 감지 설정
    detectSessionInUrl: true,
    // 로컬 스토리지 키 설정
    storageKey: 'life-graph-auth-token',
    // 플로우 타입 설정 (PKCE 사용으로 보안 강화)
    flowType: 'pkce'
  },
  // 실시간 기능 설정
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// 개발 환경에서 Supabase 연결 상태 확인
if (import.meta.env.DEV) {
  // 환경 변수 검증
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다.');
    console.warn('📝 .env.local 파일을 확인해주세요:');
    console.warn('   VITE_SUPABASE_URL=https://your-project.supabase.co');
    console.warn('   VITE_SUPABASE_ANON_KEY=your-anon-key');
  } else {
    console.log('✅ Supabase 클라이언트가 초기화되었습니다.');
    console.log('🌐 URL:', supabaseUrl);
  }
}

// 연결 상태 테스트 함수
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Supabase 연결 테스트 실패:', error.message);
      return false;
    }
    console.log('✅ Supabase 연결 테스트 성공');
    return true;
  } catch (err) {
    console.error('❌ Supabase 연결 중 오류 발생:', err);
    return false;
  }
};

// Auth helper functions
export const auth = {
  // 현재 사용자 정보 가져오기
  getCurrentUser: () => supabase.auth.getUser(),
  
  // 현재 세션 정보 가져오기
  getCurrentSession: () => supabase.auth.getSession(),
  
  // 로그아웃
  signOut: () => supabase.auth.signOut(),
  
  // 인증 상태 변화 감지
  onAuthStateChange: (callback) => supabase.auth.onAuthStateChange(callback)
};

// Database helper functions
export const db = {
  // 그래프 관련
  graphs: {
    // 모든 그래프 조회 (현재 사용자)
    getAll: () => supabase
      .from('graphs')
      .select('*')
      .order('updated_at', { ascending: false }),
    
    // 특정 그래프 조회
    getById: (id) => supabase
      .from('graphs')
      .select('*')
      .eq('id', id)
      .single(),
    
    // 그래프 생성
    create: (graphData) => supabase
      .from('graphs')
      .insert(graphData)
      .select()
      .single(),
    
    // 그래프 업데이트
    update: (id, updates) => supabase
      .from('graphs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single(),
    
    // 그래프 삭제
    delete: (id) => supabase
      .from('graphs')
      .delete()
      .eq('id', id)
  },
  
  // 이벤트 관련
  events: {
    // 특정 그래프의 모든 이벤트 조회
    getByGraphId: (graphId) => supabase
      .from('events')
      .select('*')
      .eq('graph_id', graphId)
      .order('date', { ascending: true }),
    
    // 이벤트 생성
    create: (eventData) => supabase
      .from('events')
      .insert(eventData)
      .select()
      .single(),
    
    // 이벤트 업데이트
    update: (id, updates) => supabase
      .from('events')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single(),
    
    // 이벤트 삭제
    delete: (id) => supabase
      .from('events')
      .delete()
      .eq('id', id)
  }
};

// Storage helper functions (이미지 업로드용)
export const storage = {
  // 이미지 업로드
  uploadImage: async (file, path) => {
    const { data, error } = await supabase.storage
      .from('event-images')
      .upload(path, file);
    return { data, error };
  },
  
  // 이미지 URL 가져오기
  getImageUrl: (path) => {
    const { data } = supabase.storage
      .from('event-images')
      .getPublicUrl(path);
    return data.publicUrl;
  },
  
  // 이미지 삭제
  deleteImage: (path) => supabase.storage
    .from('event-images')
    .remove([path])
};

export default supabase;