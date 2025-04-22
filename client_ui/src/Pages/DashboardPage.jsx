import { useContext, useState } from "react"
import { Link, Route, Routes, Navigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import {
  MessageSquare,
  BarChart,
  Settings,
  Code,
  Plus,
  ChevronDown,
  X,
  Users,
  LogOut,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import AuthContext from "@/context/authContext"
import DashboardHeader from "@/own_components/DashboardHeader"
import DashboardHome from "./DashboardHome"
import ChatBotPage from "@/Dashboard/ChatBotPage"
import AllBots from "@/Dashboard/AllBots"
import CompleteSetup from "@/Dashboard/CompleteSetup"
import Bookings from "@/Dashboard/Bookings"
import Customers from "@/Dashboard/Customers"
import Profile from "./Profile"


const DashboardPage = () => {
  const {
    loading,
    user,
    isAuthenticated,
    logout
  } = useContext(AuthContext)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Please log in to access the dashboard</h1>
          <Link to="/signin" className="mt-4 inline-block text-blue-600 hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <DashboardHeader toggleMobileMenu={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} user={user} logout={() => logout()} />

      <div className="flex flex-1">
        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden">
            <div className="bg-white w-64 h-full overflow-auto">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                    <span className="text-xl font-bold">ChatWave</span>
                  </div>
                  <button onClick={toggleMobileMenu}>
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <nav className="space-y-1">
                  <Link to="/dashboard"
                    className="flex items-center space-x-3 px-3 py-2 rounded-md bg-blue-50 text-blue-700"
                    onClick={toggleMobileMenu}>
                    <BarChart className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link  to="/dashboard/all-chatbots"
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={toggleMobileMenu}>
                    <MessageSquare className="h-5 w-5" />
                    <span>Chatbots</span>
                  </Link>
                  <Link to="/dashboard/customers"
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={toggleMobileMenu}>
                    <Users className="h-5 w-5" />
                    <span>Customers</span>
                  </Link>
                  <Link  to="/dashboard/Bookings" 
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={toggleMobileMenu}>
                    <Code className="h-5 w-5" />
                    <span>Bookings</span>
                  </Link>
                  <Link to="/dashboard/Profile" 
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={toggleMobileMenu}>
                    <Users className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                 
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 bg-white border-r">
          <div className="p-4 space-y-4">
            <nav className="space-y-1">
              <Link to="/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-md bg-blue-50 text-blue-700">
                <BarChart className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link to="/dashboard/all-chatbots" className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                <MessageSquare className="h-5 w-5" />
                <span>Chatbots</span>
              </Link>
              <Link to="/dashboard/customers" className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                <Users className="h-5 w-5" />
                <span>Customers</span>
              </Link>
              <Link to="/dashboard/Bookings" className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                <Code className="h-5 w-5" />
                <span>Bookings</span>
              </Link>
              <Link to="/dashboard/Profile" className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                <Users className="h-5 w-5" />
                <span>Profile</span>
              </Link>
              <Link onClick={logout} className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/chatbots" element={<ChatBotPage />} />
            <Route path="/all-chatbots" element={<AllBots />} />
            <Route path="/Bookings" element={<Bookings />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/chatbot/:id" element={<CompleteSetup />} />
            <Route path="/Profile" element={<Profile />} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default DashboardPage