# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_ 환경변수는 빌드 시 번들에 삽입되므로 ARG로 주입
ARG VITE_KAKAO_JS_APP_KEY
ARG VITE_KAKAO_REST_API_KEY
ARG VITE_ODSAY_API_KEY

RUN VITE_KAKAO_JS_APP_KEY=$VITE_KAKAO_JS_APP_KEY \
    VITE_KAKAO_REST_API_KEY=$VITE_KAKAO_REST_API_KEY \
    VITE_ODSAY_API_KEY=$VITE_ODSAY_API_KEY \
    npm run build

# ---- Stage 2: Serve ----
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
