import React, { useState, useEffect, useContext } from "react";
import axios from "axios";



// UI Components
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

// Icons
import { MessageSquare, BarChart, Calendar, Clock, Users, Plus, AlertCircle, CheckCircle, ExternalLink, ChevronRight, Loader2, User, Percent, Timer } from 'lucide-react';
import AuthContext from "@/context/authContext";
import { toast } from "sonner";
import RecentChats from "@/Dashboard/RecentChats";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DashboardHome = () => {
  const { token } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBots, setLoadingBots] = useState(true);
  const [selectedBot, setSelectedBot] = useState(bots[0]?.metaCode || '');

  useEffect(() => {
    if (bots.length > 0) {
      setSelectedBot(bots[0].metaCode); // Set to first bot's metaCode
    }
  }, [bots]);
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedBot) return;
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:7400/api/auth/dashboard-data?metaCode=${selectedBot}`
        );
        setDashboardData(response.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast(error.response?.data?.message || "Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedBot]);

  // Fetch chatbots
  useEffect(() => {
    const fetchChatbots = async () => {
      setLoadingBots(true);
      try {
        const res = await axios.get(
          `http://localhost:7400/api/auth/get-my-chatbot?token=${token}`
        );
        setBots(res.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Could not fetch your chatbots";
        toast({
          variant: "destructive",
          title: "Failed to fetch chatbots",
          description: errorMessage,
          icon: <AlertCircle className="h-5 w-5" />
        });
      } finally {
        setLoadingBots(false);
      }
    };

    if (token) {
      fetchChatbots();
    }
  }, [token]);

  // Loading state
  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage your chatbot performance
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={selectedBot} onValueChange={(value) => setSelectedBot(value)}>
              <SelectTrigger className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                <SelectValue placeholder="Select Bot" />
              </SelectTrigger>
              <SelectContent>
                {bots.map((bot) => (
                  <SelectItem key={bot.metaCode} value={bot.metaCode}>
                    {bot.metaCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Last 7 Days
          </Button>
          <Button onClick={() => window.location.href = '/dashboard/chatbots'}>
            <Plus className="mr-2 h-4 w-4" />
            New Chatbot
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Chats</p>
                <h3 className="text-2xl font-bold mt-1">{dashboardData?.totalChatsIn7Days || 0}</h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-500 font-medium">
                {dashboardData?.chatConversionRate || "0%"}
              </span>
              <span className="text-muted-foreground ml-1">conversion rate</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bookings</p>
                <h3 className="text-2xl font-bold mt-1">{dashboardData?.bookingsIn7Days || 0}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-500 font-medium">
                {dashboardData?.bookingConversionRate || "0%"}
              </span>
              <span className="text-muted-foreground ml-1">booking rate</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Users</p>
                <h3 className="text-2xl font-bold mt-1">{dashboardData?.totalUniqueChatUsers || 0}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-blue-500 font-medium">
                {dashboardData?.totalUniqueBookingUsers || 0}
              </span>
              <span className="text-muted-foreground ml-1">converted to bookings</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Chat Time</p>
                <h3 className="text-2xl font-bold mt-1">{dashboardData?.averageChatTime || "0s"}</h3>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Timer className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-muted-foreground">
                {dashboardData?.chatsWithNameAndContact || 0} chats with contact info
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chatbots">My Chatbots</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Bookings */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
                <CardDescription>
                  You have {dashboardData?.upcomingBookings?.reduce((acc, booking) => acc + booking.totalBookings, 0) || 0} upcoming bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.upcomingBookings?.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.upcomingBookings.map((booking, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{booking.date}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.totalBookings} {booking.totalBookings === 1 ? "booking" : "bookings"}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No upcoming bookings</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Bookings will appear here when customers schedule appointments.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversion Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Metrics</CardTitle>
                <CardDescription>Performance overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Chat Conversion</span>
                    <span className="text-sm font-medium">{dashboardData?.chatConversionRate || "0%"}</span>
                  </div>
                  <Progress value={parseFloat(dashboardData?.chatConversionRate || "0")} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {dashboardData?.chatsWithNameAndContact || 0} of {dashboardData?.totalChatsIn7Days || 0} chats collected contact info
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Booking Rate</span>
                    <span className="text-sm font-medium">{dashboardData?.bookingConversionRate || "0%"}</span>
                  </div>
                  <Progress value={parseFloat(dashboardData?.bookingConversionRate || "0")} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {dashboardData?.bookingsIn7Days || 0} bookings from {dashboardData?.chatsWithNameAndContact || 0} contacts
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Avg. Response Time</span>
                    <span className="text-sm font-medium">{dashboardData?.averageChatTime || "0s"}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Average time users spend in chat
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chatbots">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingBots ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="opacity-70">
                  <CardHeader className="pb-2 animate-pulse">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent className="animate-pulse">
                    <div className="space-y-4">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-8 bg-muted rounded mt-4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                {bots.length > 0 ? (
                  bots.map((bot, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{bot.titleShowAtChatBot || bot.website_name}</CardTitle>
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            Active
                          </Badge>
                        </div>
                        <CardDescription>
                          {bot.url}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            {bot.logo ? (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={bot.logo || "/placeholder.svg"} alt={bot.website_name} />
                                <AvatarFallback>{bot.website_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium">{bot.website_name}</p>
                              <p className="text-xs text-muted-foreground">ID: {bot.website_id}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Meta Code</span>
                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{bot.metaCode}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Hours</span>
                            <span>{bot.timings?.open} - {bot.timings?.close}</span>
                          </div>

                          <div className="pt-2 cursor-pointer flex gap-2">
                            <Button className="cursor-pointer" onClick={(e) => window.location.href = `/dashboard/chatbot/${bot._id}?metaCode=${bot.metaCode}`} variant="outline" className="w-full">
                              Manage
                            </Button>
                            <Button className="cursor-pointer" onClick={(e) => window.location.href = `http://localhost:5173/?metacode=${bot.metaCode}`} variant="secondary" size="icon">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-full">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                      <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <MessageSquare className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Chatbots Found</h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't created any chatbots yet. Get started by creating your first chatbot.
                      </p>
                      <Button onClick={() => window.location.href = '/dashboard/chatbots'}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Chatbot
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Create New Chatbot Card */}
                {bots.length > 0 && (
                  <Card className="border-dashed border-2">
                    <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[220px]">
                      <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <Plus className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Create New Chatbot</h3>
                      <p className="text-muted-foreground text-sm text-center mb-4">
                        Set up a new chatbot for your website or application
                      </p>
                      <Button onClick={() => window.location.href = '/dashboard/chatbots'}>Get Started</Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Integration</CardTitle>
              <CardDescription>
                Add your chatbot to any website with a simple code snippet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Your Meta Code</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <code className="bg-background p-2 rounded border flex-1 font-mono text-sm">
                      chatbot-QUP9P-CCQS2
                    </code>
                 
                  </div>

                  <h3 className="font-medium mb-2">Integration Code</h3>
                  <div className="bg-background p-3 rounded border font-mono text-sm overflow-x-auto">
                    <pre>{`<iframe 
  src="https://embeded.chat.adsdigitalmedia.com/?metacode=chatbotid" 
  width="400px" 
  height="500px" 
  style="border:none;">
</iframe>
`}</pre>
                  </div>
                </div>


              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest chat interactions and bookings
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <RecentChats />
        </CardContent>
      </Card> */}
    </div>
  );
};

export default DashboardHome;
