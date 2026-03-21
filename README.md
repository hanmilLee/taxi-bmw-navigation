# 🚕 Taxi + Transit Navigator

택시와 대중교통을 조합해, 단순 택시/단순 대중교통보다 더 빠른 경로를 한 화면에서 비교하는 웹앱입니다.

## 스크린샷

![Taxi + Transit Navigator 미리보기](docs/app-preview.png)

## 핵심 기능

- 출발지/도착지 자동완성 검색 (Kakao Local API)
- `택시만`, `대중교통만`, `택시 → 대중교통`, `대중교통 → 택시` 경로 동시 비교
- 지하철 구간의 중간역까지 환승 후보로 확장해 조합 경로 탐색
- 계산이 끝난 경로부터 점진적으로 리스트에 반영
- API 한도 소진/요청량 제한 감지 시 사용자 안내 배너 표시
- 선택 경로를 지도에 즉시 시각화
- 네이버 지도 / 카카오 지도 웹 링크로 외부 열기
- 집/직장 즐겨찾기 저장 (localStorage)

## 경로 계산 방식

1. 출발지/도착지 기준으로 순수 택시 + 순수 대중교통 경로를 먼저 계산합니다.
2. 최적 대중교통 경로에서 환승 후보 지점을 추출합니다.
3. 각 후보 지점에 대해 `택시 → 대중교통`, `대중교통 → 택시`를 병렬 계산합니다.
4. 계산된 결과를 소요시간 기준으로 정렬해 즉시 갱신합니다.
5. 대중교통 API 요청량 제한이 걸린 경우 일부 조합은 잠시 뒤 재시도합니다.

## 기술 스택

- Frontend: React 19, Vite 7, Tailwind CSS 4, shadcn 스타일 컴포넌트
- Map: Kakao Maps JavaScript SDK
- Places: Kakao Local REST API
- Taxi route: Kakao Mobility Directions API
- Transit route: ODSAY API

## 시작하기

### 1) 요구 사항

- Node.js 20+
- npm 10+

### 2) 환경 변수 설정

`.env.example`을 복사해서 `.env`를 만든 뒤 키를 입력하세요.

```bash
cp .env.example .env
```

| 변수 | 설명 |
|------|------|
| `VITE_KAKAO_JS_APP_KEY` | Kakao JavaScript 키 (지도 SDK) |
| `VITE_KAKAO_REST_API_KEY` | Kakao REST API 키 (장소 검색/택시 경로) |
| `VITE_ODSAY_API_KEY` | ODSAY API 키 (대중교통 경로) |

### 3) API 공급자 설정

Kakao 설정:

1. [Kakao Developers 콘솔](https://developers.kakao.com/console/app)에서 앱 생성
2. 제품 설정에서 카카오맵 활성화
3. `JavaScript 키 > JS SDK 도메인`에 실행 주소 등록

예시:

- `http://localhost:5173`
- `https://your-domain.com`

ODSAY 설정:

1. [ODSAY 가이드](https://lab.odsay.com/guide/guide#guideWeb_1)에서 API 키 발급
2. `마이페이지 > API 키 관리`에서 Service URI 등록

예시:

- `http://localhost:5173`
- `https://your-domain.com`

> ODSAY는 Service URI에 포트까지 정확히 일치해야 합니다.

### 4) 로컬 실행

```bash
npm install
npm run dev
```

기본 주소: `http://localhost:5173`

## 빌드 / 배포

### 프로덕션 빌드

```bash
npm run build
```

### 로컬 프리뷰

```bash
npm run preview
```

### Docker

```bash
docker build \
  --build-arg VITE_KAKAO_JS_APP_KEY=your_js_key \
  --build-arg VITE_KAKAO_REST_API_KEY=your_rest_key \
  --build-arg VITE_ODSAY_API_KEY=your_odsay_key \
  -t taxi-subway-map .

docker run -p 8080:80 taxi-subway-map
```

### GitHub Actions 배포

`main` 브랜치에 push 되면 [`.github/workflows/deploy.yml`](/Users/hanmillee/Documents/New%20project/taxi-bmw-navigation/.github/workflows/deploy.yml)가 서버에 SSH 접속해서 아래 순서로 배포합니다.

1. 서버의 `DEPLOY_APP_DIR` 경로에 저장소를 clone 또는 pull
2. Docker 이미지 재빌드
3. 같은 포트를 사용 중인 기존 컨테이너를 내리고 새 컨테이너로 교체
4. `DEPLOY_APP_PORT:80` 포트로 재실행
5. 컨테이너를 `--restart unless-stopped`로 실행해 서버 재부팅 후에도 자동 복구

GitHub repository variables:

- `DEPLOY_HOST`
- `DEPLOY_PORT`
- `DEPLOY_USER`
- `DEPLOY_APP_DIR`
- `DEPLOY_IMAGE_NAME`
- `DEPLOY_CONTAINER_NAME`
- `DEPLOY_APP_PORT`

GitHub repository secrets:

- `DEPLOY_SSH_PRIVATE_KEY`
- `VITE_KAKAO_JS_APP_KEY`
- `VITE_KAKAO_REST_API_KEY`
- `VITE_ODSAY_API_KEY`

실제 운영 값은 workflow 파일에 하드코딩하지 말고, repository `Variables`와 `Secrets`에만 저장하는 구성을 권장합니다.

## 트러블슈팅

- 지도가 안 뜰 때:
  `VITE_KAKAO_JS_APP_KEY`와 Kakao JS SDK 도메인 등록 값을 먼저 확인하세요.
- ODSAY 경로가 자주 실패할 때:
  Service URI 등록(포트 포함)과 일일 한도를 확인하세요.
- 결과 패널에 API 제한 안내가 뜰 때:
  일부 조합 경로가 제외된 상태입니다. 잠시 후 재검색하면 일부가 복구될 수 있습니다.

## 프로젝트 구조

```text
src/
  api/         # Kakao/ODSAY API 호출
  core/        # 경로 조합 최적화 로직
  hooks/       # 검색/저장 상태 관리
  components/  # SearchPanel, ResultsPanel, MapView
  utils/       # 포맷팅, 외부지도 URL 등
```
