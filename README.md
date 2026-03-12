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
| `VITE_KAKAO_JS_APP_KEY` | [developers.kakao.com](https://developers.kakao.com) | JavaScript 키 |
| `VITE_KAKAO_REST_API_KEY` | [developers.kakao.com](https://developers.kakao.com) | REST API 키 |
| `VITE_ODSAY_API_KEY` | [lab.odsay.com](https://lab.odsay.com) | Odsay API 키 |

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

Kakao 개발자 콘솔 설정:
- **플랫폼 키 > JavaScript 키 > JS SDK 도메인**: `http://localhost:5173` 등록
- **제품 설정 > 카카오맵**: 활성화

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
