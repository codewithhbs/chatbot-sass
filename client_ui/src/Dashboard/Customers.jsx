import AuthContext from '@/context/authContext';
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Calendar, Phone, MessageSquare, BookOpen } from 'lucide-react';
import useGetBotIds from '@/hooks/GetBotIds';

const Customers = () => {
    const { token } = useContext(AuthContext);
    const { bots } = useGetBotIds();

    const [data, setData] = useState({
        totalChatUsers: 0,
        totalBookedUsers: 0,
        chatOnlyUsers: [],
        bookedUsers: [],
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedMetaCode, setSelectedMetaCode] = useState('');

    useEffect(() => {
        if (bots.length > 0) {
            console.log(bots, 'bots data',selectedMetaCode);
            setSelectedMetaCode(bots[0].metaCode);
        }
    }, [bots]);

    useEffect(() => {
        if (selectedMetaCode && token) {
            fetchCustomers();
        }
    }, [selectedMetaCode, token]);

    const fetchCustomers = async () => {
        try {
            console.log(bots, 'bots data',selectedMetaCode);
            setLoading(true);
            const response = await axios.get(`https://api.chatbot.adsdigitalmedia.com/api/auth/meta-user/${selectedMetaCode}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data, 'customer data');
            setData({
                totalChatUsers: response.data.totalChatUsers || 0,
                totalBookedUsers: response.data.totalBookedUsers || 0,
                chatOnlyUsers: response.data.chatOnlyUsers || [],
                bookedUsers: response.data.bookedUsers || [],
            });
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        if (dateString.includes(',')) return dateString;

        const date = new Date(dateString);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const allUsers = [...data.chatOnlyUsers, ...data.bookedUsers];

    const filteredUsers = allUsers.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone.includes(searchTerm);

        if (activeTab === 'all') return matchesSearch;
        if (activeTab === 'chat') return matchesSearch && user.source === 'chat';
        if (activeTab === 'booked') return matchesSearch && user.source === 'booking';

        return matchesSearch;
    });

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader className="bg-slate-50 border-b">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-2xl font-bold">Customers</CardTitle>
                            <CardDescription>
                                Total customers: {allUsers.length} | Chat only: {data.totalChatUsers} | Booked: {data.totalBookedUsers}
                            </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <select
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                value={selectedMetaCode}
                                onChange={(e) => setSelectedMetaCode(e.target.value)}
                            >
                                {bots.map((bot) => (
                                    <option key={bot.metaCode} value={bot.metaCode}>
                                        {bot.metaCode}
                                    </option>
                                ))}
                            </select>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search by name or phone..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button onClick={fetchCustomers}>Refresh</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                        <div className="px-4 pt-4">
                            <TabsList className="grid w-full grid-cols-3 max-w-md">
                                <TabsTrigger value="all">All Users ({allUsers.length})</TabsTrigger>
                                <TabsTrigger value="chat">Chat Only ({data.chatOnlyUsers.length})</TabsTrigger>
                                <TabsTrigger value="booked">Booked ({data.bookedUsers.length})</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="all" className="mt-0">
                            {renderUserTable(filteredUsers, loading, formatDate)}
                        </TabsContent>
                        <TabsContent value="chat" className="mt-0">
                            {renderUserTable(filteredUsers.filter(user => user.source === 'chat'), loading, formatDate)}
                        </TabsContent>
                        <TabsContent value="booked" className="mt-0">
                            {renderUserTable(filteredUsers.filter(user => user.source === 'booking'), loading, formatDate)}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

const renderUserTable = (users, loading, formatDate) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p>Loading customer data...</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Service Date</TableHead>
                        <TableHead>Source</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length > 0 ? (
                        users.map((user, index) => (
                            <TableRow key={`${user.phone}-${index}`}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <span>{user.phone}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span>{formatDate(user.serviceDate)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        className={
                                            user.source === 'booking'
                                                ? 'bg-green-100 text-green-800 flex items-center gap-1'
                                                : 'bg-blue-100 text-blue-800 flex items-center gap-1'
                                        }
                                    >
                                        {user.source === 'booking' ? (
                                            <>
                                                <BookOpen className="h-3 w-3" />
                                                <span>Booked</span>
                                            </>
                                        ) : (
                                            <>
                                                <MessageSquare className="h-3 w-3" />
                                                <span>Chat Only</span>
                                            </>
                                        )}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-6">
                                No customers found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-gray-500">
                    Showing {users.length} customer{users.length !== 1 ? 's' : ''}
                </p>
            </div>
        </div>
    );
};

export default Customers;
