"use client"

import { useContext, useState, useEffect } from "react"
import axios from "axios"
import AuthContext from "@/context/authContext"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Plus, Trash2, Loader2, Edit, MoreHorizontal, Tag, List, Grid, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Create axios instance with base URL and default headers
const api = axios.create({
    baseURL: "http://localhost:7400/api/auth",
    timeout: 10000,
})

const CompleteSetup = () => {
    const getMetaCodeFromUrl = () => {
        if (typeof window !== "undefined") {
            const location = new URLSearchParams(window.location.search)
            return location.get("metaCode")
        }
        return null
    }


    const metaCodeFromUrl = getMetaCodeFromUrl()
    const { token } = useContext(AuthContext)
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // UI state
    const [viewMode, setViewMode] = useState("grid") // grid or list
    const [searchQuery, setSearchQuery] = useState("")

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isDeleteSubcategoryModalOpen, setIsDeleteSubcategoryModalOpen] = useState(false)

    // Form states
    const [submitting, setSubmitting] = useState(false)
    const [selectedService, setSelectedService] = useState(null)
    const [selectedSubcategoryIndex, setSelectedSubcategoryIndex] = useState(null)
    const [newSubCategory, setNewSubCategory] = useState("")

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        subCategories: [],
        metaCode: "",
    })

    // Set up axios request interceptor to add auth token
    useEffect(() => {
        api.interceptors.request.use(
            (config) => {
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`
                }
                return config
            },
            (error) => Promise.reject(error),
        )
    }, [token])

    // Fetch all services
    useEffect(() => {
        fetchServices()

    }, [])

    const fetchServices = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await api.get(`/service?metaCode=${metaCodeFromUrl}`)

            if (response.data.success) {
                setServices(response.data.data || [])
            }
        } catch (err) {
            console.error("Error fetching services:", err)
            setError(err.response?.data?.message || "Failed to load services. Please try again.")
            toast.error("Failed to load services")
        } finally {
            setLoading(false)
        }
    }

    // Filter services based on search query
    const filteredServices = services.filter(
        (service) =>
            service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.metaCode.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    // Add subcategory to form
    const addSubCategory = () => {
        if (!newSubCategory.trim()) return

        setFormData((prev) => ({
            ...prev,
            subCategories: [...prev.subCategories, { name: newSubCategory.trim() }],
        }))

        setNewSubCategory("")
        toast.success(`Subcategory added`)
    }

    // Remove subcategory from form
    const removeSubCategory = (index) => {
        setFormData((prev) => ({
            ...prev,
            subCategories: prev.subCategories.filter((_, i) => i !== index),
        }))
        toast.success(`Subcategory removed`)
    }

    // Open create service modal
    const handleCreateNew = () => {
        setFormData({
            name: "",
            description: "",
            subCategories: [],
            metaCode: "",
        })
        setIsCreateModalOpen(true)
    }

    // Open edit service modal
    const handleEdit = (service) => {
        setSelectedService(service)
        setFormData({
            name: service.name,
            description: service.description || "",
            subCategories: service.subCategories || [],
            metaCode: service.metaCode,
        })
        setIsEditModalOpen(true)
    }

    // Open delete service modal
    const handleDeleteClick = (service) => {
        setSelectedService(service)
        setIsDeleteModalOpen(true)
    }

    // Open delete subcategory modal
    const handleDeleteSubcategory = (service, index) => {
        setSelectedService(service)
        setSelectedSubcategoryIndex(index)
        setIsDeleteSubcategoryModalOpen(true)
    }

    // Create new service
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
    
        if (!formData.name.trim()) {
            toast.error("Service name is required");
            return;
        }
    
        const finalFormData = {
            ...formData,
            metaCode: metaCodeFromUrl || formData.metaCode,
        };
    
        try {
            setSubmitting(true);
            setError(null);
    
            const response = await api.post("/service", finalFormData);
    
            if (response.data.success) {
                toast.success("Service created successfully");
                setIsCreateModalOpen(false);
                fetchServices();
            }
        } catch (err) {
            console.error("Error creating service:", err);
            setError(err.response?.data?.message || "An error occurred while creating the service");
            toast.error(err.response?.data?.message || "Failed to create service");
        } finally {
            setSubmitting(false);
        }
    };
    

    // Update existing service
    const handleUpdateSubmit = async (e) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast.error("Service name is required")
            return
        }

        if (!formData.metaCode.trim()) {
            toast.error("Meta code is required")
            return
        }

        try {
            setSubmitting(true)
            setError(null)

            const response = await api.put(`/service/${selectedService._id}`, formData)

            if (response.data.success) {
                toast.success("Service updated successfully")
                setIsEditModalOpen(false)
                fetchServices()
            }
        } catch (err) {
            console.error("Error updating service:", err)
            setError(err.response?.data?.message || "An error occurred while updating the service")
            toast.error(err.response?.data?.message || "Failed to update service")
        } finally {
            setSubmitting(false)
        }
    }

    // Delete service
    const handleDeleteService = async () => {
        if (!selectedService) return

        try {
            setSubmitting(true)
            setError(null)

            const response = await api.delete(`/service/${selectedService._id}`)

            if (response.data.success) {
                toast.success("Service deleted successfully")
                setIsDeleteModalOpen(false)
                fetchServices()
            }
        } catch (err) {
            console.error("Error deleting service:", err)
            setError(err.response?.data?.message || "An error occurred while deleting the service")
            toast.error(err.response?.data?.message || "Failed to delete service")
        } finally {
            setSubmitting(false)
        }
    }

    // Delete subcategory
    const handleDeleteSubcategoryConfirm = async () => {
        if (!selectedService || selectedSubcategoryIndex === null) return

        try {
            setSubmitting(true)
            setError(null)

            // Create a copy of the service with the subcategory removed
            const updatedService = { ...selectedService }
            updatedService.subCategories = selectedService.subCategories.filter(
                (_, index) => index !== selectedSubcategoryIndex,
            )

            const response = await api.put(`/service/${selectedService._id}`, updatedService)

            if (response.data.success) {
                toast.success("Subcategory deleted successfully")
                setIsDeleteSubcategoryModalOpen(false)
                fetchServices()
            }
        } catch (err) {
            console.error("Error deleting subcategory:", err)
            setError(err.response?.data?.message || "An error occurred while deleting the subcategory")
            toast.error(err.response?.data?.message || "Failed to delete subcategory")
        } finally {
            setSubmitting(false)
        }
    }

    // Loading skeleton
    if (loading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="w-full">
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-8 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    // Error state
    if (error && !loading && services.length === 0) {
        return (
            <div className="container mx-auto py-8">
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="flex justify-center">
                    <Button onClick={fetchServices} className="mr-2">
                        Try Again
                    </Button>
                    <Button variant="outline" onClick={handleCreateNew}>
                        Create New Service
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Services</h1>
                    <p className="text-muted-foreground">Manage your services and subcategories</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search services..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === "grid" ? "default" : "outline"}
                            size="icon"
                            onClick={() => setViewMode("grid")}
                            className="h-10 w-10"
                        >
                            <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "default" : "outline"}
                            size="icon"
                            onClick={() => setViewMode("list")}
                            className="h-10 w-10"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button onClick={handleCreateNew} className="whitespace-nowrap">
                            <Plus className="h-4 w-4 mr-2" />
                            New Service
                        </Button>
                    </div>
                </div>
            </div>

            {/* Empty state */}
            {services.length === 0 ? (
                <Card className="w-full border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <Tag className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">No services found</h3>
                        <p className="text-muted-foreground mb-6 text-center max-w-md">
                            You haven't created any services yet. Create your first service to get started.
                        </p>
                        <Button onClick={handleCreateNew}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Service
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Services grid/list */}
                    {filteredServices.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No services match your search criteria</p>
                        </div>
                    ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredServices.map((service) => (
                                <Card key={service._id} className="w-full hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{service.name}</CardTitle>
                                                <CardDescription className="truncate max-w-[200px]">{service.metaCode}</CardDescription>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(service)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDeleteClick(service)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                                            {service.description || "No description provided"}
                                        </p>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-medium">Subcategories</h4>
                                                <span className="text-xs text-muted-foreground">{service.subCategories?.length || 0}</span>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {service.subCategories && service.subCategories.length > 0 ? (
                                                    service.subCategories.slice(0, 3).map((subCat, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="outline"
                                                            className="flex items-center gap-1 group cursor-pointer"
                                                            onClick={() => handleDeleteSubcategory(service, index)}
                                                        >
                                                            {subCat.name}
                                                            <Trash2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">No subcategories</span>
                                                )}
                                                {service.subCategories && service.subCategories.length > 3 && (
                                                    <Badge variant="outline">+{service.subCategories.length - 3} more</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between border-t pt-4">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(service)} className="w-full">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Service
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredServices.map((service) => (
                                <Card key={service._id} className="w-full">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="flex-1 p-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-medium">{service.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{service.metaCode}</p>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(service)}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => handleDeleteClick(service)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <p className="text-sm mt-2">{service.description || "No description provided"}</p>
                                        </div>
                                        <div className="border-t md:border-t-0 md:border-l p-6 md:w-64">
                                            <h4 className="text-sm font-medium mb-2">Subcategories</h4>
                                            <div className="space-y-2">
                                                {service.subCategories && service.subCategories.length > 0 ? (
                                                    service.subCategories.map((subCat, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="outline"
                                                            className="flex items-center gap-1 group cursor-pointer mr-2"
                                                            onClick={() => handleDeleteSubcategory(service, index)}
                                                        >
                                                            {subCat.name}
                                                            <Trash2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">No subcategories</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="border-t md:border-t-0 md:border-l p-6 flex flex-col justify-center gap-2 md:w-48">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                                                onClick={() => handleDeleteClick(service)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Create Service Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Service</DialogTitle>
                        <DialogDescription>Add a new service to your website</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Service Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter service name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe your service"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="metaCode">
                                    Meta Code <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="metaCode"
                                    name="metaCode"
                                    value={metaCodeFromUrl || formData.metaCode}
                                    onChange={handleChange}
                                    readOnly
                                    placeholder="Enter meta code"
                                    required
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label>Subcategories</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newSubCategory}
                                        onChange={(e) => setNewSubCategory(e.target.value)}
                                        placeholder="Enter subcategory name"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && newSubCategory.trim()) {
                                                e.preventDefault()
                                                addSubCategory()
                                            }
                                        }}
                                    />
                                    <Button type="button" onClick={addSubCategory} size="icon" disabled={!newSubCategory.trim()}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                                    {formData.subCategories.length > 0 ? (
                                        formData.subCategories.map((subCat, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                                <span className="text-sm">{subCat.name}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeSubCategory(index)}
                                                    className="h-7 w-7"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-2">No subcategories added</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Create Service
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Service Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Service</DialogTitle>
                        <DialogDescription>Update service details and subcategories</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUpdateSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">
                                    Service Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter service name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe your service"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-metaCode">
                                    Meta Code <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-metaCode"
                                    name="metaCode"
                                    value={formData.metaCode}
                                    onChange={handleChange}
                                    readOnly
                                    placeholder="Enter meta code"
                                    required
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label>Subcategories</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newSubCategory}
                                        onChange={(e) => setNewSubCategory(e.target.value)}
                                        placeholder="Enter subcategory name"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && newSubCategory.trim()) {
                                                e.preventDefault()
                                                addSubCategory()
                                            }
                                        }}
                                    />
                                    <Button type="button" onClick={addSubCategory} size="icon" disabled={!newSubCategory.trim()}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                                    {formData.subCategories.length > 0 ? (
                                        formData.subCategories.map((subCat, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                                <span className="text-sm">{subCat.name}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeSubCategory(index)}
                                                    className="h-7 w-7"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-2">No subcategories added</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Update Service
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Service Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-destructive">Delete Service</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this service? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {selectedService && (
                            <div className="p-4 border rounded-md bg-muted/50">
                                <h3 className="font-medium">{selectedService.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{selectedService.metaCode}</p>
                                {selectedService.description && <p className="text-sm mt-2 italic">"{selectedService.description}"</p>}
                                <div className="mt-2">
                                    <span className="text-xs text-muted-foreground">
                                        {selectedService.subCategories?.length || 0} subcategories
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDeleteService} disabled={submitting}>
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Delete Service
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Subcategory Modal */}
            <Dialog open={isDeleteSubcategoryModalOpen} onOpenChange={setIsDeleteSubcategoryModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-destructive">Delete Subcategory</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this subcategory? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {selectedService && selectedSubcategoryIndex !== null && (
                            <div className="p-4 border rounded-md bg-muted/50">
                                <h3 className="font-medium">{selectedService.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Subcategory: {selectedService.subCategories[selectedSubcategoryIndex].name}
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteSubcategoryModalOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDeleteSubcategoryConfirm} disabled={submitting}>
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Delete Subcategory
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CompleteSetup
