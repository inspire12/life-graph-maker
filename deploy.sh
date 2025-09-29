#!/bin/bash

# Life Graph Maker v1.0.0 배포 스크립트
# 다양한 PaaS 플랫폼 지원: Vercel, Netlify, GitHub Pages

set -e  # 에러 발생시 스크립트 종료

echo "🚀 Life Graph Maker v1.0.0 배포 준비 중..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 환경 체크
check_environment() {
    echo "🔍 환경 체크 중..."
    
    # Node.js 버전 체크
    if ! command -v node &> /dev/null; then
        print_error "Node.js가 설치되지 않았습니다."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    print_info "Node.js 버전: $NODE_VERSION"
    
    # npm 버전 체크
    if ! command -v npm &> /dev/null; then
        print_error "npm이 설치되지 않았습니다."
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    print_info "npm 버전: $NPM_VERSION"
    
    print_success "환경 체크 완료"
}

# 의존성 설치
install_dependencies() {
    echo "📦 의존성 설치 중..."
    npm ci --silent
    print_success "의존성 설치 완료"
}

# 빌드
build_project() {
    echo "🔨 프로젝트 빌드 중..."
    npm run build
    
    if [ -d "dist" ]; then
        print_success "빌드 완료 (dist/ 폴더 생성됨)"
        
        # 빌드 결과 분석
        echo "📊 빌드 결과 분석:"
        if [ -f "dist/index.html" ]; then
            INDEX_SIZE=$(du -h dist/index.html | cut -f1)
            print_info "index.html: $INDEX_SIZE"
        fi
        
        if [ -d "dist/assets" ]; then
            ASSETS_SIZE=$(du -sh dist/assets | cut -f1)
            print_info "assets 폴더: $ASSETS_SIZE"
            
            # JS/CSS 파일 크기 표시
            echo "  주요 파일들:"
            for file in dist/assets/*.js dist/assets/*.css; do
                if [ -f "$file" ]; then
                    FILE_SIZE=$(du -h "$file" | cut -f1)
                    FILE_NAME=$(basename "$file")
                    echo "    - $FILE_NAME: $FILE_SIZE"
                fi
            done
        fi
    else
        print_error "빌드 실패: dist 폴더가 생성되지 않았습니다."
        exit 1
    fi
}

# 빌드 미리보기
preview_build() {
    echo "👀 빌드 미리보기 실행 중..."
    print_info "http://localhost:4173 에서 확인 가능합니다"
    print_warning "Ctrl+C로 미리보기를 종료하세요"
    npm run preview
}

# 배포 플랫폼 선택
select_platform() {
    echo "🌐 배포 플랫폼을 선택하세요:"
    echo "1) Vercel (추천)"
    echo "2) Netlify"
    echo "3) GitHub Pages"
    echo "4) 로컬 빌드만 (수동 배포)"
    echo "5) 미리보기만"
    echo "0) 종료"
    
    read -p "선택 (0-5): " platform_choice
    
    case $platform_choice in
        1)
            deploy_vercel
            ;;
        2)
            deploy_netlify
            ;;
        3)
            deploy_github_pages
            ;;
        4)
            print_success "로컬 빌드가 완료되었습니다. dist/ 폴더를 원하는 호스팅 서비스에 업로드하세요."
            ;;
        5)
            preview_build
            ;;
        0)
            echo "배포를 취소했습니다."
            exit 0
            ;;
        *)
            print_error "잘못된 선택입니다."
            select_platform
            ;;
    esac
}

# Vercel 배포
deploy_vercel() {
    echo "🔺 Vercel 배포 준비 중..."
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI가 설치되지 않았습니다. 설치 중..."
        npm install -g vercel
    fi
    
    print_info "Vercel CLI 로그인이 필요할 수 있습니다."
    vercel --prod
    
    print_success "Vercel 배포 완료!"
    print_info "배포된 URL을 확인하세요."
}

# Netlify 배포
deploy_netlify() {
    echo "🌊 Netlify 배포 준비 중..."
    
    if ! command -v netlify &> /dev/null; then
        print_warning "Netlify CLI가 설치되지 않았습니다. 설치 중..."
        npm install -g netlify-cli
    fi
    
    print_info "Netlify CLI 로그인이 필요할 수 있습니다."
    netlify deploy --prod --dir=dist
    
    print_success "Netlify 배포 완료!"
}

# GitHub Pages 배포
deploy_github_pages() {
    echo "🐙 GitHub Pages 배포 준비 중..."
    
    # gh-pages 패키지 확인
    if ! npm list gh-pages &> /dev/null; then
        print_warning "gh-pages 패키지가 설치되지 않았습니다. 설치 중..."
        npm install --save-dev gh-pages
    fi
    
    # package.json에 homepage 설정 확인
    if ! grep -q '"homepage"' package.json; then
        print_warning "package.json에 homepage가 설정되지 않았습니다."
        read -p "GitHub 저장소 URL을 입력하세요 (예: https://username.github.io/repository-name): " homepage_url
        
        # homepage 추가
        node -e "
        const pkg = require('./package.json');
        pkg.homepage = '$homepage_url';
        require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        "
        
        print_success "homepage가 package.json에 추가되었습니다."
    fi
    
    # GitHub Pages용 빌드 및 배포
    npx gh-pages -d dist
    
    print_success "GitHub Pages 배포 완료!"
    print_info "몇 분 후 GitHub Pages URL에서 확인 가능합니다."
}

# 메인 실행 함수
main() {
    echo "=================================="
    echo "🌟 Life Graph Maker v1.0.0 배포"
    echo "=================================="
    echo ""
    
    # 환경 체크
    check_environment
    echo ""
    
    # 의존성 설치
    install_dependencies
    echo ""
    
    # 빌드
    build_project
    echo ""
    
    # 배포 플랫폼 선택
    select_platform
    echo ""
    
    print_success "배포 스크립트 완료!"
    echo ""
    echo "🎉 Life Graph Maker v1.0.0이 성공적으로 배포되었습니다!"
    echo ""
    echo "📚 추가 정보:"
    echo "- 프로젝트 문서: README.md"
    echo "- 이슈 리포트: GitHub Issues"
    echo "- 로컬 개발: npm run dev"
    echo ""
}

# 도움말 표시
show_help() {
    echo "Life Graph Maker 배포 스크립트"
    echo ""
    echo "사용법:"
    echo "  ./deploy.sh           # 대화형 배포"
    echo "  ./deploy.sh --help    # 도움말 표시"
    echo "  ./deploy.sh --build   # 빌드만 실행"
    echo "  ./deploy.sh --preview # 미리보기만 실행"
    echo ""
    echo "지원 플랫폼:"
    echo "  - Vercel (추천)"
    echo "  - Netlify"
    echo "  - GitHub Pages"
    echo ""
}

# 명령행 인수 처리
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --build)
        check_environment
        install_dependencies
        build_project
        exit 0
        ;;
    --preview)
        check_environment
        install_dependencies
        build_project
        preview_build
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "알 수 없는 옵션: $1"
        show_help
        exit 1
        ;;
esac