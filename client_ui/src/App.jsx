
import { Route, Routes } from 'react-router-dom'
import './App.css'
import { Button } from './components/ui/button'
import Landing from './Pages/Landing'
import SignInPage from './Pages/SignInPage'
import SignUpPage from './Pages/SignUpPage'
import DashboardPage from './Pages/DashboardPage'
import NotFoundPage from './Pages/NotFoundPage'

function App() {

  return (
    <Routes>
      <Route path="/" Component={Landing} />
      <Route path="/signin" Component={SignInPage} />
      <Route path="/signup" element={<SignUpPage />} />
          <Route path="/dashboard/*" element={<DashboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
