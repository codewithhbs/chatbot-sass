import React from 'react'
import { MessageSquare, Zap, Globe, Code, BarChart, CheckCircle, Menu, X, ChevronDown, Star, ArrowRight, Send, Brain, Bot, Sparkles, Users, Shield, Clock, Laptop, Phone, Tablet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'

const AiSection = ({ registerSection, isVisible }) => {
    return (
        <>

            <section
                id="features"
                ref={(el) => registerSection('features', el)}
                className="py-20 bg-white"
            >
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                            Features
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful AI Features</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our chatbots come packed with advanced features to help you engage visitors, answer questions, and convert leads.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Brain className="h-6 w-6 text-blue-600" />,
                                title: "AI-Powered Responses",
                                description: "Leverage advanced AI to provide intelligent, contextual responses to your visitors' questions.",
                                delay: 0
                            },
                            {
                                icon: <Globe className="h-6 w-6 text-blue-600" />,
                                title: "Multi-language Support",
                                description: "Communicate with visitors in over 50 languages, automatically detecting and responding in their preferred language.",
                                delay: 100
                            },
                            {
                                icon: <Code className="h-6 w-6 text-blue-600" />,
                                title: "Easy Integration",
                                description: "Add our chatbot to your website with a simple code snippet. No coding experience required.",
                                delay: 200
                            },
                            {
                                icon: <BarChart className="h-6 w-6 text-blue-600" />,
                                title: "Analytics Dashboard",
                                description: "Track conversations, user satisfaction, and conversion rates with our comprehensive analytics.",
                                delay: 300
                            },
                            {
                                icon: <CheckCircle className="h-6 w-6 text-blue-600" />,
                                title: "Customizable Workflows",
                                description: "Create custom conversation flows to guide visitors toward specific actions or information.",
                                delay: 400
                            },
                            {
                                icon: <Users className="h-6 w-6 text-blue-600" />,
                                title: "Human Handoff",
                                description: "Seamlessly transfer complex conversations to your human support team when needed.",
                                delay: 500
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className={`bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 transform ${isVisible.features ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                                    }`}
                                style={{ transitionDelay: `${feature.delay}ms` }}
                            >
                                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section
                id="how-it-works"
                ref={(el) => registerSection('how-it-works', el)}
                className="py-20 bg-gray-50"
            >
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                            Simple Process
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">How ChatWave Works</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Get up and running with ChatWave in just a few simple steps
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            {
                                step: "01",
                                title: "Sign Up",
                                description: "Create your account and choose a plan that fits your business needs.",
                                icon: <Users className="h-8 w-8 text-blue-600" />
                            },
                            {
                                step: "02",
                                title: "Customize",
                                description: "Personalize your chatbot's appearance and train it with your business information.",
                                icon: <Sparkles className="h-8 w-8 text-blue-600" />
                            },
                            {
                                step: "03",
                                title: "Integrate",
                                description: "Add a simple code snippet to your website and your chatbot is ready to engage visitors.",
                                icon: <Code className="h-8 w-8 text-blue-600" />
                            }
                        ].map((item, index) => (
                            <div
                                key={index}
                                className={`text-center p-6 ${isVisible['how-it-works'] ? 'animate-fade-in' : 'opacity-0'
                                    }`}
                                style={{ animationDelay: `${index * 200}ms` }}
                            >
                                <div className="relative mx-auto mb-6">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                        {item.icon}
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {item.step}
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <Link to="/signup">
                            <Button size="lg" className="group">
                                Get Started Now
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* AI Showcase Section */}
            <section className="py-20 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="lg:w-1/2">
                            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                                AI Technology
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Powered by Advanced AI</h2>
                            <p className="text-gray-600 mb-6">
                                Our chatbots use state-of-the-art natural language processing to understand and respond to your customers' needs with remarkable accuracy.
                            </p>

                            <div className="space-y-4">
                                {[
                                    {
                                        title: "Natural Language Understanding",
                                        description: "Understands context and intent behind customer queries"
                                    },
                                    {
                                        title: "Continuous Learning",
                                        description: "Improves over time by learning from conversations"
                                    },
                                    {
                                        title: "Sentiment Analysis",
                                        description: "Detects customer emotions and responds appropriately"
                                    }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-start">
                                        <div className="mt-1 mr-4 bg-blue-100 rounded-full p-1">
                                            <CheckCircle className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{item.title}</h3>
                                            <p className="text-gray-600 text-sm">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative">
                            {/* AI visualization */}
                            <div className="relative w-full h-80 bg-blue-50 rounded-lg overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative w-40 h-40">
                                        <div className="absolute inset-0 bg-blue-600 rounded-full opacity-20 animate-pulse"></div>
                                        <div className="absolute inset-4 bg-blue-500 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                                        <div className="absolute inset-8 bg-blue-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Brain className="h-16 w-16 text-blue-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Animated connections */}
                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
                                    <path
                                        d="M200,150 C150,100 100,120 50,100"
                                        stroke="#3B82F6"
                                        strokeWidth="2"
                                        fill="none"
                                        strokeDasharray="5,5"
                                        className="animate-dash"
                                    />
                                    <path
                                        d="M200,150 C250,100 300,120 350,100"
                                        stroke="#3B82F6"
                                        strokeWidth="2"
                                        fill="none"
                                        strokeDasharray="5,5"
                                        className="animate-dash-reverse"
                                    />
                                    <path
                                        d="M200,150 C150,200 100,180 50,200"
                                        stroke="#3B82F6"
                                        strokeWidth="2"
                                        fill="none"
                                        strokeDasharray="5,5"
                                        className="animate-dash-delayed"
                                    />
                                    <path
                                        d="M200,150 C250,200 300,180 350,200"
                                        stroke="#3B82F6"
                                        strokeWidth="2"
                                        fill="none"
                                        strokeDasharray="5,5"
                                        className="animate-dash-reverse-delayed"
                                    />
                                </svg>

                                {/* Data nodes */}
                                <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center animate-float">
                                        <MessageSquare className="h-4 w-4 text-blue-600" />
                                    </div>
                                </div>
                                <div className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center animate-float-delayed">
                                        <Users className="h-4 w-4 text-blue-600" />
                                    </div>
                                </div>
                                <div className="absolute bottom-1/4 left-1/4 transform -translate-x-1/2 translate-y-1/2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center animate-float-reverse">
                                        <Globe className="h-4 w-4 text-blue-600" />
                                    </div>
                                </div>
                                <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center animate-float-slow">
                                        <Shield className="h-4 w-4 text-blue-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section></>
    )
}

export default AiSection