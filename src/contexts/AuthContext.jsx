import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, auth } from '../services/supabase';

// 인증 컨텍스트 생성
const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signOut: () => {},
  refreshSession: () => {}
});

// 인증 프로바이더 컴포넌트
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 세션 확인
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await auth.getCurrentSession();
        
        if (error) {
          console.error('세션 확인 중 오류:', error.message);
        } else {
          setSession(session);
          setUser(session?.user || null);
        }
      } catch (error) {
        console.error('인증 초기화 중 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 인증 상태 변화 감지
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        console.log('인증 상태 변화:', event, session?.user?.email || 'No user');
        
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
        
        // 인증 이벤트에 따른 추가 처리
        switch (event) {
          case 'SIGNED_IN':
            console.log('✅ 사용자 로그인:', session.user.email);
            // 필요시 사용자 프로필 생성 또는 업데이트
            break;
          case 'SIGNED_OUT':
            console.log('👋 사용자 로그아웃');
            // 로컬 상태 정리
            break;
          case 'TOKEN_REFRESHED':
            console.log('🔄 토큰 갱신됨');
            break;
          case 'USER_UPDATED':
            console.log('👤 사용자 정보 업데이트됨');
            break;
          case 'PASSWORD_RECOVERY':
            console.log('🔑 비밀번호 복구 요청됨');
            break;
        }
      }
    );

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // 로그아웃 함수
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await auth.signOut();
      if (error) {
        console.error('로그아웃 중 오류:', error.message);
        throw error;
      }
      console.log('✅ 로그아웃 성공');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 세션 수동 갱신
  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('세션 갱신 중 오류:', error.message);
        throw error;
      }
      return session;
    } catch (error) {
      console.error('세션 갱신 실패:', error);
      throw error;
    }
  };

  // 사용자 권한 확인 헬퍼
  const hasPermission = (permission) => {
    if (!user) return false;
    // 향후 역할 기반 권한 시스템 구현 시 사용
    return true;
  };

  // 인증된 사용자인지 확인
  const isAuthenticated = !!user;

  // 이메일 인증 여부 확인
  const isEmailConfirmed = user?.email_confirmed_at != null;

  const value = {
    // 상태
    user,
    session,
    loading,
    isAuthenticated,
    isEmailConfirmed,
    
    // 함수
    signOut,
    refreshSession,
    hasPermission,
    
    // 사용자 정보 헬퍼
    userEmail: user?.email,
    userId: user?.id,
    userMetadata: user?.user_metadata || {},
    
    // 인증 제공자 정보
    authProvider: user?.app_metadata?.provider || 'email'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 인증 컨텍스트 사용 훅
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다');
  }
  
  return context;
}

// 인증된 사용자만 접근 가능한 컴포넌트 래퍼
export function RequireAuth({ children, fallback = null }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <span className="ml-2 text-gray-600">로그인 확인 중...</span>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-500">이 기능을 사용하려면 먼저 로그인해주세요.</p>
        </div>
      </div>
    );
  }
  
  return children;
}

export default AuthContext;