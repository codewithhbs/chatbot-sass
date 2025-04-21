import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/authContext'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId='866831196807-n0sovdtmtgro9mick04n5rjngmvmrpu7.apps.googleusercontent.com'>
      <AuthProvider>
        <App />
      </AuthProvider>

      <Toaster position='top-center' theme={'system'} swipeDirections={'right'} duration={1500} />
    </GoogleOAuthProvider>
  </BrowserRouter>

)
