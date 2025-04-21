import { Button } from '@/components/ui/button'
import AuthContext from '@/context/authContext'
import { LogOut, Menu, MessageSquare, User, X } from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Header = ({ scrollToSection, isMenuOpen, toggle }) => {
    const { 
        loading,
        user,
        isAuthenticated,
        logout 
    } = useContext(AuthContext)
    
    const [scrolled, setScrolled] = useState(false)
    
    // Add scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }
        
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    
    const handleLogout = () => {
        logout()
    }

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
            scrolled ? 'bg-white shadow-md' : 'bg-white'
        }`}>
            <div className="container mx-auto px-4 py-4">
                <nav className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <MessageSquare className="h-6 w-6 text-black" />
                        <span className="text-xl font-bold text-black">ChatWave</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <button onClick={() => scrollToSection('features')} className="text-gray-800 hover:text-black transition-colors">
                            Features
                        </button>
                        <button onClick={() => scrollToSection('how-it-works')} className="text-gray-800 hover:text-black transition-colors">
                            How It Works
                        </button>
                        <button onClick={() => scrollToSection('pricing')} className="text-gray-800 hover:text-black transition-colors">
                            Pricing
                        </button>
                        <button onClick={() => scrollToSection('testimonials')} className="text-gray-800 hover:text-black transition-colors">
                            Testimonials
                        </button>
                        <button onClick={() => scrollToSection('faq')} className="text-gray-800 hover:text-black transition-colors">
                            FAQ
                        </button>
                    </div>

                    {/* Authentication Buttons - Desktop */}
                    <div className="hidden md:flex items-center space-x-4">
                        {loading ? (
                            <div className="w-20 h-10 bg-gray-200 animate-pulse rounded-md"></div>
                        ) : isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/dashboard">
                                    <Button variant="outline" className="border-black text-black hover:bg-gray-100">
                                        <User className="h-4 w-4 mr-2" />
                                        {user?.name || 'Dashboard'}
                                    </Button>
                                </Link>
                                <Button 
                                    variant="default" 
                                    onClick={handleLogout}
                                    className="bg-black text-white hover:bg-gray-800"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Link to="/signin">
                                    <Button variant="outline" className="border-black text-black hover:bg-gray-100">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link to="/signup">
                                    <Button className="bg-black text-white hover:bg-gray-800">
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button className="md:hidden" onClick={toggle}>
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </nav>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 space-y-4">
                        <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 text-gray-800 hover:text-black">
                            Features
                        </button>
                        <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left py-2 text-gray-800 hover:text-black">
                            How It Works
                        </button>
                        <button onClick={() => scrollToSection('pricing')} className="block w-full text-left py-2 text-gray-800 hover:text-black">
                            Pricing
                        </button>
                        <button onClick={() => scrollToSection('testimonials')} className="block w-full text-left py-2 text-gray-800 hover:text-black">
                            Testimonials
                        </button>
                        <button onClick={() => scrollToSection('faq')} className="block w-full text-left py-2 text-gray-800 hover:text-black">
                            FAQ
                        </button>
                        
                        {/* Authentication Buttons - Mobile */}
                        <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                            {loading ? (
                                <div className="w-full h-10 bg-gray-200 animate-pulse rounded-md"></div>
                            ) : isAuthenticated ? (
                                <>
                                    <Link to="/dashboard">
                                        <Button 
                                            variant="outline" 
                                            className="w-full border-black text-black hover:bg-gray-100"
                                        >
                                            <User className="h-4 w-4 mr-2" />
                                            Dashboard
                                        </Button>
                                    </Link>
                                    <Button 
                                        className="w-full bg-black text-white hover:bg-gray-800" 
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link to="/signin">
                                        <Button 
                                            variant="outline" 
                                            className="w-full border-black text-black hover:bg-gray-100"
                                        >
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link to="/signup">
                                        <Button className="w-full bg-black text-white hover:bg-gray-800">
                                            Sign Up
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {/* Add padding spacer to prevent content from jumping when header becomes fixed */}
            {isMenuOpen && <div className="h-12 md:h-0"></div>}
        </header>
    )
}


const HeaderSpacer = () => {
    return <div className="h-16"></div>
}

export { Header, HeaderSpacer }