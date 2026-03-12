# 🚕 택시 + 대중교통 최적 경로

일반 지도 앱에서 제공하지 않는 **택시 ↔ 대중교통 조합 경로**를 계산해 가장 빠른 이동 방법을 찾아주는 웹앱입니다.

## 기능

- 출발지/도착지 입력 시 자동완성 (Kakao Local API)
- 순수 택시, 순수 대중교통 경로 비교
- **택시 → 대중교통** 조합 (중간 역/정류장까지 택시)
- **대중교통 → 택시** 조합 (중간 역/정류장에서 택시)
- 결과를 소요 시간 기준 오름차순 정렬
- Kakao 지도에 선택 경로 시각화

## 기술 스택

- React + Vite
- Kakao Maps JavaScript SDK (지도 렌더링)
- Kakao Mobility REST API (택시 경로)
- Kakao Local REST API (장소 검색)
- Odsay API (대중교통 경로)

## 필요 API 키

| 변수 | 발급처 | 설명 |
|------|--------|------|
| `VITE_KAKAO_JS_APP_KEY` | [developers.kakao.com](https://developers.kakao.com/console/app) | 내 애플리케이션 > 앱 키 > JavaScript 키 |
| `VITE_KAKAO_REST_API_KEY` | [developers.kakao.com](https://developers.kakao.com/console/app) | 내 애플리케이션 > 앱 키 > REST API 키 |
| `VITE_ODSAY_API_KEY` | [lab.odsay.com](https://lab.odsay.com/guide/kr/guide#apikey) | 회원가입 후 마이페이지 > API 키 관리 |

### Kakao 추가 설정 (앱 생성 후)

1. **지도 서비스 활성화**
   [내 애플리케이션](https://developers.kakao.com/console/app) > 앱 선택 > **제품 설정 > 카카오맵** > 활성화

2. **JS SDK 도메인 등록** (지도 렌더링 허용)
   [내 애플리케이션](https://developers.kakao.com/console/app) > 앱 선택 > **플랫폼 키 > JavaScript 키 > JS SDK 도메인**
   → 로컬: `http://localhost:5173`
   → 배포 후: `https://your-domain.vercel.app`

### Odsay 추가 설정 (키 발급 후)

**Service URI 등록** (도메인 인증)
[마이페이지 > API 키 관리](https://lab.odsay.com/guide/kr/guide#apikey) > 해당 키 > Service URI
→ 로컬: `http://localhost:5173`
→ 배포 후: `https://your-domain.vercel.app`

## 로컬 실행

```bash
# 1. 환경 변수 설정
cp .env.example .env
# .env 파일에 API 키 입력

# 2. 패키지 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

## Docker 실행

```bash
docker build \
  --build-arg VITE_KAKAO_JS_APP_KEY=your_js_key \
  --build-arg VITE_KAKAO_REST_API_KEY=your_rest_key \
  --build-arg VITE_ODSAY_API_KEY=your_odsay_key \
  -t taxi-subway-map .

docker run -p 8080:80 taxi-subway-map
# http://localhost:8080
```

## Vercel 배포

`vercel.json` 포함되어 있어 Vercel에 바로 배포 가능합니다.  
배포 후 발급된 URL을 Kakao JS SDK 도메인 및 Odsay Service URI에 등록하세요.
