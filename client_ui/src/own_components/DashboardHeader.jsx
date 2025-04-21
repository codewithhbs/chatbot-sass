import { Input } from '@/components/ui/input'
import { Bell, LogOut, Menu, MessageSquare, Search, Settings, Users, X } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
const DashboardHeader = ({ toggleMobileMenu, isMobileMenuOpen, user ,logout}) => {
    return (
        <header className="bg-white border-b sticky top-0 z-10">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <button className="md:hidden mr-2" onClick={toggleMobileMenu}>
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                        <Link to="/" className="flex items-center space-x-2">
                            <MessageSquare className="h-6 w-6 text-blue-600" />
                            <span className="text-xl font-bold hidden md:inline-block">ChatWave</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-4">
                        <div className="relative w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input type="search" placeholder="Search..." className="w-full pl-8 bg-gray-50" />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="relative p-1 rounded-full hover:bg-gray-100">
                            <Bell className="h-5 w-5 text-gray-600" />
                            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                        </button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div>
                                    <img src={user.picture} alt="User" className="w-8 h-8 rounded-full object-cover" />
                                </div>

                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Users className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <LogOut onClick={logout} className="mr-2 h-4 w-4" />
                                    <span onClick={logout} >Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default DashboardHeader