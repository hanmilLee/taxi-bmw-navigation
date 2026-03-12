import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Kakao Maps SDK 비동기 로드 후 React 마운트
// StrictMode 제거: Kakao Maps가 useEffect 이중 실행을 처리 못함
const script = document.createElement('script')
script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_APP_KEY}&libraries=services&autoload=false`
document.head.appendChild(script)

script.onload = () => {
  window.kakao.maps.load(() => {
    createRoot(document.getElementById('root')).render(<App />)
  })
}

script.onerror = () => {
  console.error('Kakao Maps SDK 로드 실패. VITE_KAKAO_JS_APP_KEY를 확인하세요.')
  createRoot(document.getElementById('root')).render(<App />)
}
