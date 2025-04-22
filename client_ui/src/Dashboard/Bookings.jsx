
import { useState, useEffect } from "react"
import axios from "axios"
import { format, parseISO } from "date-fns"

// UI Components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Skeleton } from "../components/ui/skeleton"

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../components/ui/pagination"

// Icons
import {
    Calendar,
    Edit,
    Filter,
    MoreHorizontal,
    Phone,
    Search,
    Trash2,
    User,
    X,
    CheckCircle,
    XCircle,
    Clock,
    MapPin,
    CalendarRange,
} from "lucide-react"
import { toast } from "sonner"
import { ServiceDatePicker } from "./DatePicker"
import useGetBotIds from "@/hooks/GetBotIds"

const Bookings = () => {
    // State management
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalBookings, setTotalBookings] = useState(0)
    const [limit, setLimit] = useState(10)
    const [selectedMetaCode, setSelectedMetaCode] = useState('');

    const { bots } = useGetBotIds();


    // Filter states
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [dateFilter, setDateFilter] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("")

    // Modal states
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [cancelModalOpen, setCancelModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [cancelReason, setCancelReason] = useState("")

    // Edit form state
    const [editForm, setEditForm] = useState({
        name: "",
        phone: "",
        address: "",
        serviceDate: "",
    })

    console.log("i am boyts", selectedMetaCode)
    useEffect(() => {
        if (bots && bots.length > 0) {
            setSelectedMetaCode(bots[0].metaCode)
        }
    }, [bots])

    // Fetch bookings data
    useEffect(() => {
        if (selectedMetaCode) {
            const timeout = setTimeout(() => {
                fetchBookings()
            }, 2000)

            return () => clearTimeout(timeout)
        }
    }, [currentPage, limit, searchTerm, statusFilter, dateFilter, categoryFilter, selectedMetaCode])


    const fetchBookings = async () => {
        setLoading(true)
        try {
            // In a real implementation, you would include filters in the API call
            const response = await axios.get(
                `http://localhost:7400/api/auth/get-my-booking?metacode=${selectedMetaCode || bots[0].metaCode}&page=${currentPage}&limit=${limit}`,
            )

            // Apply client-side filtering (in a real app, this would be done server-side)
            let filteredBookings = response.data.bookings

            if (searchTerm) {
                filteredBookings = filteredBookings.filter(
                    (booking) =>
                        booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        booking.phone.includes(searchTerm) ||
                        booking.address.toLowerCase().includes(searchTerm.toLowerCase()),
                )
            }

            if (statusFilter !== "all") {
                filteredBookings = filteredBookings.filter((booking) => booking.status === statusFilter)
            }

            if (dateFilter) {
                filteredBookings = filteredBookings.filter((booking) => booking.serviceDate.includes(dateFilter))
            }

            if (categoryFilter) {
                filteredBookings = filteredBookings.filter((booking) => booking.selectedCategory === categoryFilter)
            }

            setBookings(filteredBookings)
            setTotalPages(response.data.totalPages)
            setTotalBookings(response.data.total)
        } catch (error) {
            console.error("Error fetching bookings:", error)
            toast({
                variant: "destructive",
                title: "Failed to fetch bookings",
                description: error.response?.data?.message || "An error occurred",
            })
        } finally {
            setLoading(false)
        }
    }


    // Handle status change
    const handleStatusChange = async (bookingId, newStatus) => {
        if (newStatus === "cancelled" && !cancelReason) {
            toast({
                variant: "destructive",
                title: "Cancellation reason required",
                description: "Please provide a reason for cancellation",
            });
            return;
        }

        try {
            const url =
                newStatus === "cancelled"
                    ? `http://localhost:7400/api/auth/booking-status/cancel/${bookingId}`
                    : `http://localhost:7400/api/auth/booking-status/confirm/${bookingId}`;

            await axios.post(url, {
                cancelReason: newStatus === "cancelled" ? cancelReason : undefined,
            });

            // Update local state
            setBookings((prev) =>
                prev.map((booking) =>
                    booking._id === bookingId ? { ...booking, status: newStatus } : booking
                )
            );

            toast(`Booking status changed to ${newStatus}`);

            // Reset cancellation state
            setCancelModalOpen(false);
            setCancelReason("");
        } catch (error) {
            console.error("Error updating status:", error);
            toast(error.response?.data?.message);
        }
    };


    // Handle booking edit
    const handleEditBooking = async () => {
        if (!selectedBooking) return

        try {

            await axios.put(`http://localhost:7400/api/auth/booking-status/update/${selectedBooking._id}`, editForm)

            // For demo purposes, we'll update the state directly
            setBookings(
                bookings.map((booking) => (booking._id === selectedBooking._id ? { ...booking, ...editForm } : booking)),
            )

            toast('Booking details have been updated successfully')

            setEditModalOpen(false)
        } catch (error) {
            console.error("Error updating booking:", error)
            toast(error.response?.data?.message)
        }
    }

    // Handle booking deletion
    const handleDeleteBooking = async () => {
        if (!selectedBooking) return

        try {
            // In a real implementation, you would make an API call here
            await axios.delete(`http://localhost:7400/api/auth/booking-status/delete/${selectedBooking._id}`)

            // For demo purposes, we'll update the state directly
            setBookings(bookings.filter((booking) => booking._id !== selectedBooking._id))

            toast.success('Booking has been deleted successfully')

            setDeleteModalOpen(false)
        } catch (error) {
            console.error("Error deleting booking:", error)
            toast.error(error.response?.data?.message)
        }
    }

    // Open edit modal and set form data
    const openEditModal = (booking) => {
        setSelectedBooking(booking)
        setEditForm({
            name: booking.name,
            phone: booking.phone,
            address: booking.address,
            serviceDate: booking.serviceDate,
        })
        setEditModalOpen(true)
    }

    // Open cancel modal
    const openCancelModal = (booking) => {
        setSelectedBooking(booking)
        setCancelReason("")
        setCancelModalOpen(true)
    }

    // Open delete modal
    const openDeleteModal = (booking) => {
        setSelectedBooking(booking)
        setDeleteModalOpen(true)
    }

    // Format date for display
    const formatDate = (dateString) => {
        try {
            if (dateString.includes(",")) return dateString // Already formatted
            const date = parseISO(dateString)
            return format(date, "EEEE, MMMM d, yyyy")
        } catch (e) {
            return dateString
        }
    }

    // Format timestamp for display
    const formatTimestamp = (timestamp) => {
        try {
            const date = parseISO(timestamp)
            return format(date, "MMM d, yyyy h:mm a")
        } catch (e) {
            return timestamp
        }
    }

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
            case "cancelled":
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm("")
        setStatusFilter("all")
        setDateFilter("")
        setCategoryFilter("")
    }

    // Get unique categories for filter
    const uniqueCategories = [...new Set(bookings.map((booking) => booking.selectedCategory))]

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
                    <p className="text-muted-foreground mt-1">Manage and track all your service bookings</p>
                </div>
                {/* <div className="mt-4 md:mt-0">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Export Bookings
          </Button>
        </div> */}
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Label htmlFor="search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Name, phone or address..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
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

                        </div>
                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {uniqueCategories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="date">Date Filter</Label>
                            <Input
                                id="date"
                                type="text"
                                placeholder="Enter date..."
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={resetFilters} className="mr-2">
                            <X className="mr-2 h-4 w-4" />
                            Reset Filters
                        </Button>
                        <Button onClick={fetchBookings}>
                            <Filter className="mr-2 h-4 w-4" />
                            Apply Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Bookings Table */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">
                            Booking List
                            <Badge variant="outline" className="ml-2">
                                {totalBookings} bookings
                            </Badge>
                        </CardTitle>
                        <Select value={limit.toString()} onValueChange={(value) => setLimit(Number(value))}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="10 per page" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5 per page</SelectItem>
                                <SelectItem value="10">10 per page</SelectItem>
                                <SelectItem value="20">20 per page</SelectItem>
                                <SelectItem value="50">50 per page</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((_, index) => (
                                <div key={index} className="flex items-center space-x-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-[250px]" />
                                        <Skeleton className="h-4 w-[200px]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-10">
                            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No bookings found</h3>
                            <p className="mt-2 text-muted-foreground">Try adjusting your filters or search terms</p>
                            <Button onClick={resetFilters} className="mt-4">
                                Reset Filters
                            </Button>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Service Details</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookings.map((booking) => (
                                        <TableRow key={booking._id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <div className="font-medium flex items-center">
                                                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                                        {booking.name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground flex items-center mt-1">
                                                        <Phone className="mr-2 h-4 w-4" />
                                                        {booking.phone}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground flex items-center mt-1">
                                                        <MapPin className="mr-2 h-4 w-4" />
                                                        {booking.address}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{booking.selectedCategory}</div>
                                                <div className="text-sm text-muted-foreground">{booking.selectedService}</div>
                                                <div className="text-xs text-muted-foreground mt-1">ID: {booking._id.substring(0, 8)}...</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <div className="font-medium flex items-center">
                                                        <CalendarRange className="mr-2 h-4 w-4 text-muted-foreground" />
                                                        {formatDate(booking.serviceDate)}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        <Clock className="inline mr-1 h-3 w-3" />
                                                        Booked on: {formatTimestamp(booking.createdAt)}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <div>
                                                <TableCell>{getStatusBadge(booking.status)}

                                                    {booking.status === "cancelled" && (
                                                        <div className="text-sm text-red-600 mt-1">
                                                            <XCircle className="inline mr-1 h-3 w-3" />
                                                            {booking.cancelReason || ""}
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </div>

                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => openEditModal(booking)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                                        {booking.status !== "completed" && (
                                                            <DropdownMenuItem onClick={() => handleStatusChange(booking._id, "completed")}>
                                                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                                Mark as Completed
                                                            </DropdownMenuItem>
                                                        )}
                                                        {booking.status !== "pending" && (
                                                            <DropdownMenuItem onClick={() => handleStatusChange(booking._id, "pending")}>
                                                                <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                                                                Mark as Pending
                                                            </DropdownMenuItem>
                                                        )}
                                                        {booking.status !== "cancelled" && (
                                                            <DropdownMenuItem onClick={() => openCancelModal(booking)}>
                                                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                                                Cancel Booking
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => openDeleteModal(booking)}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Booking
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && bookings.length > 0 && (
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing {bookings.length} of {totalBookings} bookings
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                        />
                                    </PaginationItem>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page}>
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Booking Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Booking</DialogTitle>
                        <DialogDescription>Update the booking details below.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                                Phone
                            </Label>
                            <Input
                                id="phone"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="address" className="text-right">
                                Address
                            </Label>
                            <Input
                                id="address"
                                value={editForm.address}
                                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <ServiceDatePicker editForm={editForm} setEditForm={setEditForm} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditBooking}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Booking Modal */}
            <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Cancel Booking</DialogTitle>
                        <DialogDescription>Please provide a reason for cancellation.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cancelReason" className="text-right">
                                Reason
                            </Label>
                            <Textarea
                                id="cancelReason"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Enter cancellation reason..."
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
                            Back
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleStatusChange(selectedBooking?._id, "cancelled")}
                            disabled={!cancelReason}
                        >
                            Confirm Cancellation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Booking Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Booking</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this booking? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {selectedBooking && (
                            <div className="border rounded-md p-3 bg-muted/50">
                                <div className="font-medium">{selectedBooking.name}</div>
                                <div className="text-sm text-muted-foreground">{selectedBooking.phone}</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    {selectedBooking.selectedCategory} - {selectedBooking.selectedService}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">{formatDate(selectedBooking.serviceDate)}</div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteBooking}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Booking
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Bookings
