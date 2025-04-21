

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardFooter } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { MessageSquare, CheckCircle, X, ChevronDown, Star, ArrowRight, Send, Bot } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Badge } from "../components/ui/badge"
import { toast } from "sonner"
import AiSection from "@/own_components/AiSection"
import Footer from "@/own_components/Footer"
import Multidevice from "@/own_components/Multidevice"
import { Header, HeaderSpacer } from "@/own_components/header"

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState({})
  const [activeTab, setActiveTab] = useState("monthly")
  const [chatMessages, setChatMessages] = useState([
    { role: "bot", content: "Hi there! Welcome to ChatWave. I'm your virtual assistant and I'll help you explore our services. Could you please share your name?" }
  ])
  const [userInput, setUserInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const sectionsRef = useRef({})


  // Register section refs
  const registerSection = (id, ref) => {
    sectionsRef.current[id] = ref
  }

  // Smooth scroll to section
  const scrollToSection = (id) => {
    setIsMenuOpen(false)
    const section = sectionsRef.current[id]
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Handle chat input
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!userInput.trim()) return

    // Add user message
    setChatMessages([...chatMessages, { role: "user", content: userInput }])
    setUserInput("")

    // Simulate bot typing
    setIsTyping(true)

    // Simulate bot response after delay
    setTimeout(() => {
      setIsTyping(false)
      const botResponses = [
        "Thanks! How can I help you today?",
        "I'd be happy to tell you more about our pricing plans.",
        "Our AI chatbot can be integrated with any website in minutes!",
        "We offer 24/7 support for all our customers.",
        "You can try ChatWave for free for 14 days, no credit card required."
      ]
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)]
      setChatMessages(prev => [...prev, { role: "bot", content: randomResponse }])
    }, 1500)
  }

  // Intersection Observer for animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    }

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({ ...prev, [entry.target.id]: true }))
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Observe all sections
    Object.values(sectionsRef.current).forEach(section => {
      if (section) observer.observe(section)
    })

    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [])

  // Newsletter subscription handler
  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const email = formData.get('email')

    if (email) {
      toast({
        title: "Subscription successful!",
        description: "Thank you for subscribing to our newsletter.",
      })
      e.target.reset()
    }
  }

  // Contact form handler
  const handleContactSubmit = (e) => {
    e.preventDefault()
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    })
    e.target.reset()
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Navigation */}

      {/* <Header /> */}
      <Header scrollToSection={scrollToSection} isMenuOpen={isMenuOpen} toggle={() => setIsMenuOpen(!isMenuOpen)} />
      <HeaderSpacer />


      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white py-20 md:py-28 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 rounded-full opacity-50 animate-float-slow"></div>
          <div className="absolute top-40 -left-20 w-80 h-80 bg-blue-100 rounded-full opacity-40 animate-float"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-100 rounded-full opacity-30 animate-float-reverse"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 animate-fade-in">
              <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                AI-Powered Chatbot
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Transform Customer Experience with <span className="text-blue-600">Intelligent</span> Chatbots
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Integrate powerful AI chatbots on your website in minutes. Boost conversions, provide 24/7 support, and
                delight your customers with natural conversations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto group">
                    Get Started for Free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <button onClick={() => scrollToSection('demo')} className="group">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    See Demo
                    <ChevronDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" />
                  </Button>
                </button>
              </div>
              <div className="mt-8 flex items-center space-x-4">
                <div className="flex -space-x-2">
                  <img src="/placeholder.svg?height=32&width=32" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                  <img src="/placeholder.svg?height=32&width=32" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                  <img src="/placeholder.svg?height=32&width=32" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">1,000+</span> businesses trust ChatWave
                </div>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-10 animate-fade-in-delayed">
              <div id="demo" ref={(el) => registerSection('demo', el)} className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md mx-auto transform transition-all hover:scale-105 duration-300">
                <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-500 rounded-full p-1">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">ChatWave Assistant</p>
                      <p className="text-xs">Always ready to help</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="h-2 w-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                    <span className="text-xs">Online</span>
                  </div>
                </div>
                <div className="p-4 h-80 flex flex-col bg-gray-50">
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {chatMessages.map((message, index) => (
                      <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : ''}`}>
                        {message.role === 'bot' && (
                          <div className="bg-blue-100 rounded-full p-2 mr-3 h-8 w-8 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        <div className={`rounded-lg p-3 max-w-[80%] ${message.role === 'user'
                          ? 'bg-blue-600 text-white ml-auto'
                          : 'bg-white border border-gray-200'
                          }`}>
                          <p>{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex">
                        <div className="bg-blue-100 rounded-full p-2 mr-3 h-8 w-8 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleSendMessage} className="mt-auto">
                    <div className="relative">
                      <Input
                        placeholder="Type your message..."
                        className="pr-10"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full w-8 h-8 p-0"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="py-10 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 mb-8">Trusted by leading companies worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {/* Replace with actual brand logos */}
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="h-8 w-24 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 font-semibold">Brand 1</span>
              </div>
            </div>
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="h-8 w-24 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 font-semibold">Brand 2</span>
              </div>
            </div>
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="h-8 w-24 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 font-semibold">Brand 3</span>
              </div>
            </div>
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="h-8 w-24 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 font-semibold">Brand 4</span>
              </div>
            </div>
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="h-8 w-24 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 font-semibold">Brand 5</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      <AiSection registerSection={registerSection} isVisible={isVisible} />


      <section
        id="pricing"
        ref={(el) => registerSection('pricing', el)}
        className="py-20 bg-gray-50"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
              Pricing
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works best for your business. All plans include core features.
            </p>

            <div className="mt-8 inline-flex items-center p-1 bg-gray-100 rounded-lg">
              <Tabs defaultValue="monthly" className="w-full max-w-md mx-auto">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="monthly"
                    onClick={() => setActiveTab('monthly')}
                    className="data-[state=active]:bg-white"
                  >
                    Monthly
                  </TabsTrigger>
                  <TabsTrigger
                    value="annual"
                    onClick={() => setActiveTab('annual')}
                    className="data-[state=active]:bg-white"
                  >
                    Annual <span className="ml-1 text-xs text-green-600 font-medium">Save 20%</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <Card className={`relative overflow-hidden transition-all duration-500 ${isVisible.pricing ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-200"></div>
              <CardContent className="pt-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold">Starter</h3>
                  <p className="text-gray-500 text-sm mt-1">For small businesses</p>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold">${activeTab === 'monthly' ? '29' : '23'}</span>
                    <span className="text-gray-500">/month</span>
                    {activeTab === 'annual' && (
                      <div className="text-xs text-green-600 mt-1">Billed annually (${23 * 12}/year)</div>
                    )}
                  </div>
                </div>
                <div className="space-y-4 text-sm mb-8">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span><span className="font-semibold">1,000</span> messages/month</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Basic customization</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Email support</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span><span className="font-semibold">1</span> website integration</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <X className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span>Analytics dashboard</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <X className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span>Custom workflows</span>
                  </div>
                </div>
                <Button className="w-full">Get Started</Button>
              </CardContent>
              <CardFooter className="text-center text-xs text-gray-500 pb-6">
                No credit card required
              </CardFooter>
            </Card>

            {/* Professional Plan */}
            <Card className={`relative border-blue-200 shadow-xl transition-all duration-500 ${isVisible.pricing ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`} style={{ transitionDelay: '200ms' }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
              <div className="absolute -top-4 inset-x-0 mx-auto w-fit bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <CardContent className="pt-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold">Professional</h3>
                  <p className="text-gray-500 text-sm mt-1">For growing teams</p>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold">${activeTab === 'monthly' ? '79' : '63'}</span>
                    <span className="text-gray-500">/month</span>
                    {activeTab === 'annual' && (
                      <div className="text-xs text-green-600 mt-1">Billed annually (${63 * 12}/year)</div>
                    )}
                  </div>
                </div>
                <div className="space-y-4 text-sm mb-8">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span><span className="font-semibold">10,000</span> messages/month</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Advanced customization</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Priority email support</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span><span className="font-semibold">5</span> website integrations</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Analytics dashboard</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Basic workflows</span>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Get Started</Button>
              </CardContent>
              <CardFooter className="text-center text-xs text-gray-500 pb-6">
                14-day free trial
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className={`relative transition-all duration-500 ${isVisible.pricing ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`} style={{ transitionDelay: '400ms' }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-200"></div>
              <CardContent className="pt-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold">Enterprise</h3>
                  <p className="text-gray-500 text-sm mt-1">For large organizations</p>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold">${activeTab === 'monthly' ? '199' : '159'}</span>
                    <span className="text-gray-500">/month</span>
                    {activeTab === 'annual' && (
                      <div className="text-xs text-green-600 mt-1">Billed annually (${159 * 12}/year)</div>
                    )}
                  </div>
                </div>
                <div className="space-y-4 text-sm mb-8">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span><span className="font-semibold">Unlimited</span> messages</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Full customization</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>24/7 phone & email support</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span><span className="font-semibold">Unlimited</span> integrations</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Advanced analytics</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Advanced workflows</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
              <CardFooter className="text-center text-xs text-gray-500 pb-6">
                Custom onboarding included
              </CardFooter>
            </Card>
          </div>


        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        ref={(el) => registerSection('testimonials', el)}
        className="py-20 bg-white"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. See what our customers have to say about ChatWave.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                position: "Marketing Director, TechCorp",
                image: "https://t3.ftcdn.net/jpg/02/43/12/34/360_F_243123463_zTooub557xEWABDLk0jJklDyLSGl2jrr.jpg",
                quote: "ChatWave has transformed how we interact with our website visitors. Our conversion rate has increased by 35% since implementing the chatbot.",
                stars: 5
              },
              {
                name: "Michael Chen",
                position: "E-commerce Manager, ShopRight",
                image: "https://t3.ftcdn.net/jpg/02/43/12/34/360_F_243123463_zTooub557xEWABDLk0jJklDyLSGl2jrr.jpg",
                quote: "The AI capabilities are impressive. Our customers get accurate answers instantly, and our support team can focus on more complex issues.",
                stars: 5
              },
              {
                name: "Emily Rodriguez",
                position: "Customer Success, FinanceApp",
                image: "https://t3.ftcdn.net/jpg/02/43/12/34/360_F_243123463_zTooub557xEWABDLk0jJklDyLSGl2jrr.jpg",
                quote: "Setup was incredibly easy, and the customization options allowed us to make the chatbot match our brand perfectly. Highly recommended!",
                stars: 4
              },
              {
                name: "David Wilson",
                position: "CEO, StartupX",
                image: "https://t3.ftcdn.net/jpg/02/43/12/34/360_F_243123463_zTooub557xEWABDLk0jJklDyLSGl2jrr.jpg",
                quote: "As a small business, we couldn't afford 24/7 support staff. ChatWave solved that problem completely. Our customers love the instant responses.",
                stars: 5
              },
              {
                name: "Lisa Thompson",
                position: "Head of Support, SaaS Platform",
                image: "https://t3.ftcdn.net/jpg/02/43/12/34/360_F_243123463_zTooub557xEWABDLk0jJklDyLSGl2jrr.jpg",
                quote: "The analytics provided by ChatWave have given us valuable insights into customer needs. We've used this data to improve our product roadmap.",
                stars: 4
              },
              {
                name: "Robert Garcia",
                position: "Digital Director, RetailBrand",
                image: "https://t3.ftcdn.net/jpg/02/43/12/34/360_F_243123463_zTooub557xEWABDLk0jJklDyLSGl2jrr.jpg",
                quote: "We've tried several chatbot solutions, but ChatWave is by far the most intelligent and easiest to use. The ROI has been outstanding.",
                stars: 5
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className={`bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all ${isVisible.testimonials ? 'animate-fade-in' : 'opacity-0'
                  }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-gray-500 text-sm">{testimonial.position}</p>
                  </div>
                </div>
                <div className="mb-4 flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < testimonial.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        ref={(el) => registerSection('faq', el)}
        className="py-20 bg-gray-50"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about ChatWave
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  question: "How does ChatWave's AI technology work?",
                  answer: "ChatWave uses advanced natural language processing (NLP) and machine learning algorithms to understand user queries and provide relevant responses. Our AI is trained on vast datasets to recognize intent, context, and sentiment, allowing it to have natural conversations with your website visitors."
                },
                {
                  question: "Is ChatWave difficult to set up?",
                  answer: "Not at all! ChatWave is designed to be user-friendly. You can set up your chatbot in minutes with our simple interface. Just create an account, customize your chatbot's appearance, and add a small code snippet to your website. No coding experience is required."
                },
                {
                  question: "Can I customize the chatbot to match my brand?",
                  answer: "ChatWave offers extensive customization options. You can change colors, fonts, and the chatbot avatar to match your brand identity. You can also customize the welcome message, conversation flows, and responses to align with your brand voice."
                },
                {
                  question: "What languages does ChatWave support?",
                  answer: "ChatWave supports over 50 languages, including English, Spanish, French, German, Chinese, Japanese, Arabic, and many more. The chatbot automatically detects the user's language and responds accordingly, making it perfect for global businesses."
                },
                {
                  question: "Can ChatWave integrate with my existing tools?",
                  answer: "Yes, ChatWave integrates seamlessly with popular CRM systems, help desks, e-commerce platforms, and other business tools. We offer ready-made integrations with Salesforce, Zendesk, Shopify, and many others. We also provide API access for custom integrations."
                },
                {
                  question: "What kind of analytics does ChatWave provide?",
                  answer: "ChatWave provides comprehensive analytics to help you understand your customers better. You can track conversation volumes, popular topics, user satisfaction rates, conversion rates, and more. These insights can help you optimize your chatbot and improve your business strategies."
                },
                {
                  question: "Is there a limit to the number of conversations?",
                  answer: "Each pricing plan comes with a specific number of monthly conversations. The Starter plan includes 1,000 conversations, Professional includes 10,000, and Enterprise offers unlimited conversations. If you need more, you can always upgrade your plan or contact us for a custom solution."
                },
                {
                  question: "How secure is ChatWave?",
                  answer: "Security is our top priority. ChatWave uses bank-level encryption to protect all data. We are GDPR compliant and follow strict data protection protocols. Your data and your customers' information are always safe with us."
                }
              ].map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className={`border-b last:border-b-0 ${isVisible.faq ? 'animate-fade-in' : 'opacity-0'
                    }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <AccordionTrigger className="text-left font-medium py-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-12 text-center">
            <p className="mb-4 text-gray-600">Still have questions?</p>
            <Button onClick={() => scrollToSection('contact')} variant="outline">
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated with ChatWave</h2>
            <p className="mb-8">
              Subscribe to our newsletter for the latest updates, tips, and special offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white"
                required
              />
              <Button type="submit" className="bg-white text-blue-600 hover:bg-white/90">
                Subscribe
              </Button>
            </form>
            <p className="mt-4 text-sm text-white/80">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        ref={(el) => registerSection('contact', el)}
        className="py-20 bg-white"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
              Contact Us
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Have questions or need help? Our team is here to assist you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className={`${isVisible.contact ? 'animate-fade-in' : 'opacity-0'}`}>
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-4">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Phone</h4>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-4">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-gray-600">support@chatwave.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-4">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Office</h4>
                    <p className="text-gray-600">123 Innovation Street, Tech City, CA 94043</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Connect With Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                    <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>
                  <a href="#" className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                    <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                    <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                    <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className={`${isVisible.contact ? 'animate-fade-in-delayed' : 'opacity-0'}`}>
              <h3 className="text-xl font-semibold mb-4">Send Us a Message</h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <Input id="subject" name="subject" required />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <Textarea id="message" name="message" rows={5} required />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-device Section */}
      <Multidevice />

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Customer Experience?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using ChatWave to engage visitors and boost conversions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 group">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" onClick={() => scrollToSection('demo')}>
              See Demo
            </Button>
          </div>
          <p className="mt-6 text-sm text-white/80">
            No credit card required. 14-day free trial.
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  )
}

export default LandingPage
