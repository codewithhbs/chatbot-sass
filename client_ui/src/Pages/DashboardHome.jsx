

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import {
    MessageSquare,
    BarChart,

    Plus,
    ChevronDown,

    Users,
} from "lucide-react"

import { Avatar, AvatarFallback } from "../components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,

    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Link } from "react-router-dom"
const DashboardHome = () => {
    return (
        <>
            <main className="flex-1 p-4 md:p-6 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Dashboard</h1>
                            <p className="text-gray-500">Welcome back, John Doe</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create New Chatbot
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total Conversations</p>
                                        <h3 className="text-2xl font-bold mt-1">1,284</h3>
                                    </div>
                                    <div className="bg-blue-100 p-3 rounded-full">
                                        <MessageSquare className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <span className="text-green-500 font-medium">+12.5%</span>
                                    <span className="text-gray-500 ml-1">from last month</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Active Users</p>
                                        <h3 className="text-2xl font-bold mt-1">342</h3>
                                    </div>
                                    <div className="bg-green-100 p-3 rounded-full">
                                        <Users className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <span className="text-green-500 font-medium">+8.2%</span>
                                    <span className="text-gray-500 ml-1">from last month</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Response Rate</p>
                                        <h3 className="text-2xl font-bold mt-1">94.2%</h3>
                                    </div>
                                    <div className="bg-purple-100 p-3 rounded-full">
                                        <BarChart className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <span className="text-green-500 font-medium">+1.8%</span>
                                    <span className="text-gray-500 ml-1">from last month</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Avg. Response Time</p>
                                        <h3 className="text-2xl font-bold mt-1">1.2s</h3>
                                    </div>
                                    <div className="bg-yellow-100 p-3 rounded-full">
                                        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <span className="text-red-500 font-medium">+0.3s</span>
                                    <span className="text-gray-500 ml-1">from last month</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs Section */}
                    <Tabs defaultValue="chatbots" className="mb-6">
                        <TabsList className="mb-4">
                            <TabsTrigger value="chatbots">My Chatbots</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            <TabsTrigger value="integrations">Integrations</TabsTrigger>
                        </TabsList>

                        <TabsContent value="chatbots">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Existing Chatbot */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">Customer Support Bot</CardTitle>
                                        <CardDescription>Created 2 months ago</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Status</span>
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Active</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Conversations</span>
                                                <span>842</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Satisfaction</span>
                                                <span>92%</span>
                                            </div>
                                            <div className="pt-2">
                                                <Button variant="outline" className="w-full">
                                                    Manage
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Existing Chatbot */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">Sales Assistant</CardTitle>
                                        <CardDescription>Created 1 month ago</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Status</span>
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Active</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Conversations</span>
                                                <span>324</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Satisfaction</span>
                                                <span>88%</span>
                                            </div>
                                            <div className="pt-2">
                                                <Button variant="outline" className="w-full">
                                                    Manage
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Create New Chatbot Card */}
                                <Card className="border-dashed">
                                    <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[220px]">
                                        <div className="bg-blue-100 p-3 rounded-full mb-4">
                                            <Plus className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-medium mb-2">Create New Chatbot</h3>
                                        <p className="text-gray-500 text-sm text-center mb-4">
                                            Set up a new chatbot for your website or application
                                        </p>
                                        <Link to="/dashboard/chatbots">
                                            <Button>Get Started</Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="analytics">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Analytics Overview</CardTitle>
                                    <CardDescription>View detailed analytics for all your chatbots</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px] flex items-center justify-center border rounded-md bg-gray-50">
                                        <p className="text-gray-500">Analytics charts will appear here</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="integrations">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Available Integrations</CardTitle>
                                    <CardDescription>Connect your chatbots with other services</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="border rounded-md p-4 flex items-center space-x-4">
                                            <div className="bg-blue-100 p-2 rounded-md">
                                                <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none">
                                                    <path
                                                        d="M18 8V7.2C18 6.0799 18 5.51984 17.782 5.09202C17.5903 4.71569 17.2843 4.40973 16.908 4.21799C16.4802 4 15.9201 4 14.8 4H9.2C8.07989 4 7.51984 4 7.09202 4.21799C6.71569 4.40973 6.40973 4.71569 6.21799 5.09202C6 5.51984 6 6.0799 6 7.2V8M6 8H18M6 8H4M18 8H20M9 13V17M15 13V17M3 8H21V16.8C21 17.9201 21 18.4802 20.782 18.908C20.5903 19.2843 20.2843 19.5903 19.908 19.782C19.4802 20 18.9201 20 17.8 20H6.2C5.0799 20 4.51984 20 4.09202 19.782C3.71569 19.5903 3.40973 19.2843 3.21799 18.908C3 18.4802 3 17.9201 3 16.8V8Z"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-medium">Slack</h3>
                                                <p className="text-sm text-gray-500">Connect with Slack</p>
                                            </div>
                                        </div>

                                        <div className="border rounded-md p-4 flex items-center space-x-4">
                                            <div className="bg-blue-100 p-2 rounded-md">
                                                <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none">
                                                    <path
                                                        d="M21 8V16.8C21 17.9201 21 18.4802 20.782 18.908C20.5903 19.2843 20.2843 19.5903 19.908 19.782C19.4802 20 18.9201 20 17.8 20H6.2C5.0799 20 4.51984 20 4.09202 19.782C3.71569 19.5903 3.40973 19.2843 3.21799 18.908C3 18.4802 3 17.9201 3 16.8V8M21 8L14.5 3.5C13.4139 2.77543 12.8708 2.41315 12.2855 2.2723C11.7787 2.14848 11.2475 2.14848 10.7408 2.2723C10.1555 2.41315 9.61251 2.77543 8.52652 3.5L2 8M21 8H3"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-medium">Email</h3>
                                                <p className="text-sm text-gray-500">Email integration</p>
                                            </div>
                                        </div>

                                        <div className="border rounded-md p-4 flex items-center space-x-4">
                                            <div className="bg-blue-100 p-2 rounded-md">
                                                <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none">
                                                    <path
                                                        d="M9 12.75L11.25 15L15 9.75M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-medium">Zendesk</h3>
                                                <p className="text-sm text-gray-500">Customer support</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Activity</CardTitle>
                                    <CardDescription>Latest conversations from your chatbots</CardDescription>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            All Chatbots
                                            <ChevronDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>All Chatbots</DropdownMenuItem>
                                        <DropdownMenuItem>Customer Support Bot</DropdownMenuItem>
                                        <DropdownMenuItem>Sales Assistant</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Activity Item */}
                                <div className="flex items-start space-x-4 pb-4 border-b">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback>JD</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium">John Doe</div>
                                            <div className="text-xs text-gray-500">2 hours ago</div>
                                        </div>
                                        <p className="text-sm text-gray-600">Asked about product pricing and availability</p>
                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Sales Assistant</span>
                                            <span>12 messages</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Item */}
                                <div className="flex items-start space-x-4 pb-4 border-b">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback>AS</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium">Alice Smith</div>
                                            <div className="text-xs text-gray-500">5 hours ago</div>
                                        </div>
                                        <p className="text-sm text-gray-600">Reported an issue with account login</p>
                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Customer Support Bot</span>
                                            <span>8 messages</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Item */}
                                <div className="flex items-start space-x-4 pb-4 border-b">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback>RJ</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium">Robert Johnson</div>
                                            <div className="text-xs text-gray-500">Yesterday</div>
                                        </div>
                                        <p className="text-sm text-gray-600">Requested information about enterprise plans</p>
                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Sales Assistant</span>
                                            <span>15 messages</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Item */}
                                <div className="flex items-start space-x-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback>EW</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium">Emma Wilson</div>
                                            <div className="text-xs text-gray-500">2 days ago</div>
                                        </div>
                                        <p className="text-sm text-gray-600">Asked about integration with Shopify</p>
                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Customer Support Bot</span>
                                            <span>6 messages</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 text-center">
                                <Button variant="link">View All Activity</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    )
}

export default DashboardHome