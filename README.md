# URL2QR - 스마트한 웹 QR코드 생성기

URL을 입력하면 즉시 고화질 QR코드를 생성하고 클릭 한 번으로 JPG 파일로 다운로드할 수 있는 순수 프론트엔드 웹 애플리케이션입니다.

Node.js나 백엔드 서버 없이 **순수 HTML, CSS, JavaScript**만으로 100% 브라우저 클라이언트에서 동작하므로 **GitHub Pages**에 바로 배포하여 사용할 수 있습니다.

---

## 🌟 주요 기능
1. **상단 브랜드 로고**: 좌측 상단 `img/logo.png` 로고 배치 및 클릭 시 초기화
2. **미니멀 URL 입력 폼**: 화면 중앙 심플 입력창, 클립보드 붙여넣기, 빠른 테스트 칩
3. **스무스 레이아웃 전이**: 확인(또는 Enter) 시 입력창이 하단으로 이동하고 화면 정중앙에 QR코드 생성
4. **원클릭 JPG 다운로드**: QR코드 캔버스를 직접 클릭하면 1024×1024 고해상도 백색 배경 합성 `.jpg` 파일 다운로드
5. **마우스 반응형 인터랙티브 그라데이션**: 커서 위치에 따라 조명과 색조가 부드럽게 반응하는 라이트 톤 디자인

---

## 🚀 GitHub Pages 배포 방법
1. 본 레포지토리를 GitHub에 Push합니다.
2. GitHub 저장소의 **Settings** > **Pages** 메뉴로 이동합니다.
3. **Build and deployment** 항목의 **Source**를 `Deploy from a branch`로 선택합니다.
4. **Branch**를 `main` (또는 `master`) / `/ (root)`로 설정하고 **Save**를 클릭합니다.
5. 1~2분 후 생성되는 GitHub Pages 주소(`https://<username>.github.io/<repo>/`)로 접속하면 즉시 서비스됩니다!

---

## 📂 파일 구조
```
Project04/
├── index.html          # 메인 웹 페이지 (시맨틱 HTML5)
├── css/
│   └── style.css       # 라이트 톤 & 커서 인터랙티브 그라데이션 스타일
├── js/
│   ├── app.js          # QR 생성 및 JPG 다운로드, 인터랙션 로직
│   └── qrious.min.js   # 경량 내장형 QR코드 캔버스 라이브러리 (오프라인 지원)
├── img/
│   └── logo.png        # 상단 좌측 브랜드 로고
└── .gitignore          # 깃 제외 설정
```
