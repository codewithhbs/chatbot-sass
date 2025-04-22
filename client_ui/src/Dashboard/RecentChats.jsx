

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
const RecentChats = () => {
  return (
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
  )
}

export default RecentChats