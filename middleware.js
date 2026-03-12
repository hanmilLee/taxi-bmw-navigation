/**
 * Vercel Edge Middleware - Basic Auth 비밀번호 보호
 * Vercel 환경 변수에 AUTH_PASSWORD를 설정하세요.
 */
export function middleware(request) {
  const auth = request.headers.get('authorization')

  if (auth) {
    const [scheme, encoded] = auth.split(' ')
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded)
      const colonIdx = decoded.indexOf(':')
      const password = decoded.slice(colonIdx + 1)

      if (password === process.env.AUTH_PASSWORD) {
        return // 인증 성공 → 통과
      }
    }
  }

  // 인증 실패 → 비밀번호 팝업 요청
  return new Response('접근 불가', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Private App"',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}

export const config = {
  // 정적 파일과 api 라우트는 미들웨어 제외
  matcher: '/((?!_next/static|_next/image|favicon\\.ico|.*\\.svg|.*\\.png).*)',
}
