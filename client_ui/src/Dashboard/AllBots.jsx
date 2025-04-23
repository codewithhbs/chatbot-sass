

import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import AuthContext from '@/context/authContext';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from "@/components/ui/badge";
import { Globe, Trash2, Edit, CheckCircle, AlertCircle, ArrowUpRight, Loader2, Copy, Phone, MapPin, Clock, Instagram, Facebook, Youtube } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const AllBots = () => {
  const { token } = useContext(AuthContext);
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [metaCode, setMetaCode] = useState('');
  const [selectedBot, setSelectedBot] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [botToDelete, setBotToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    contactNumber: '',
    address: '',
    titleShowAtChatBot: '',
    openTime: '',
    closeTime: '',
    instagram: '',
    facebook: '',
    youtube: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const botsPerPage = 6;
  const totalPages = Math.ceil(bots.length / botsPerPage);
  const indexOfLastBot = currentPage * botsPerPage;
  const indexOfFirstBot = indexOfLastBot - botsPerPage;
  const currentBots = bots.slice(indexOfFirstBot, indexOfLastBot);

  // Fetch chatbots on load
  const handleFoundChatBots = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:7400/api/auth/get-my-chatbot?token=${token}`
      );
      setBots(res.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Could not fetch your chatbots";
      toast.error("Failed to fetch chatbots", {
        description: errorMessage,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
    } finally {
      setLoading(false);
    }
  };

  // Verification handler
  const handleVerify = async () => {
    setVerifyLoading(true);
    setVerificationStatus(null);

    try {
      const res = await axios.post(
        `http://localhost:7400/api/auth/check-meta-code?token=${token}`,
        {
          url: websiteUrl,
          metaCode: metaCode,
        }
      );
      setVerificationStatus("success");
      toast.success("Website verified successfully!", {
        description: "Your chatbot is now ready to be deployed on your website.",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />
      });

      // Update the verified status in the UI
      if (selectedBot) {
        setBots(bots.map(bot =>
          bot._id === selectedBot._id ? { ...bot, metaCodeVerify: true } : bot
        ));
      }
    } catch (err) {
      setVerificationStatus("error");
      const errorMessage =
        err.response?.data?.message ||
        "Verification failed. Please make sure the meta tag is correctly placed in your website's head section.";
      toast.error("Verification Failed", {
        description: errorMessage,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  // Delete chatbot confirmation
  const openDeleteConfirm = (bot, e) => {
    e.stopPropagation();
    setBotToDelete(bot);
    setDeleteConfirmOpen(true);
  };

  // Delete chatbot handler
  const handleDelete = async () => {
    if (!botToDelete) return;

    try {
      await axios.delete(
        `http://localhost:7400/api/auth/delete-chatbot/${botToDelete._id}?token=${token}`
      );
      toast.success("Chatbot deleted successfully", {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />
      });
      setBots(bots.filter((bot) => bot._id !== botToDelete._id));
      setDeleteConfirmOpen(false);
      setBotToDelete(null);
    } catch (err) {
      toast.error("Failed to delete chatbot", {
        description: err.response?.data?.message || "An error occurred while deleting",
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
    }
  };

  // Open modal for verification
  const handleVerifyModal = (bot, e) => {
    e.stopPropagation();
    setSelectedBot(bot);
    setWebsiteUrl(bot.url);
    setMetaCode(bot.metaCode);
    setVerificationStatus(null);
    setIsVerifyModalOpen(true);
  };

  // Open edit modal
  const handleEditClick = (bot, e) => {
    e.stopPropagation();
    setSelectedBot(bot);
    setEditFormData({
      contactNumber: bot.info?.contactNumber || '',
      titleShowAtChatBot: bot.titleShowAtChatBot || '',
      address: bot.info?.address || '',
      openTime: bot.info?.timings?.open || '',
      closeTime: bot.info?.timings?.close || '',
      instagram: bot.info?.social_links?.insta || '',
      facebook: bot.info?.social_links?.fb || '',
      youtube: bot.info?.social_links?.youtube || '',
    });
    setIsEditModalOpen(true);
  };

  // Handle card click to open edit modal
  const handleCardClick = (bot) => {
    setSelectedBot(bot);
    setEditFormData({
      contactNumber: bot.info?.contactNumber || '',
      address: bot.info?.address || '',
      openTime: bot.info?.timings?.open || '',
      titleShowAtChatBot: bot.titleShowAtChatBot || '',
      closeTime: bot.info?.timings?.close || '',
      instagram: bot.info?.social_links?.insta || '',
      facebook: bot.info?.social_links?.fb || '',
      youtube: bot.info?.social_links?.youtube || '',
    });
    setIsEditModalOpen(true);
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Save edited chatbot details
  const handleSaveEdit = async () => {
    try {
      // Construct the updated info object
      const updatedInfo = {
        ...selectedBot.info,
        contactNumber: editFormData.contactNumber,

        address: editFormData.address,
        timings: {
          open: editFormData.openTime,
          close: editFormData.closeTime
        },
        social_links: {
          insta: editFormData.instagram,
          fb: editFormData.facebook,
          youtube: editFormData.youtube
        }
      };

      // API call to update the bot info
      await axios.post(
        `http://localhost:7400/api/auth/update-chatbot/${selectedBot._id}?token=${token}`,
        {
          info: updatedInfo,
          titleShowAtChatBot: editFormData.titleShowAtChatBot,
        }
      );

      // Update the bot in the state
      setBots(bots.map(bot =>
        bot._id === selectedBot._id ? { ...bot, info: updatedInfo } : bot
      ));

      toast.success("Chatbot details updated successfully", {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />
      });

      setIsEditModalOpen(false);
    } catch (err) {
      console.log(err)
      toast.error("Failed to update chatbot details", {
        description: err.response?.data?.message || "An error occurred while updating",
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
    }
  };

  // Copy meta code to clipboard
  const copyMetaCode = (code) => {
    navigator.clipboard.writeText(`<meta name="chatbot-verification" content="${code}" />`);
    toast.success("Copied to clipboard", {
      icon: <Copy className="h-4 w-4" />
    });
  };

  useEffect(() => {
    handleFoundChatBots();
  }, [token]);

  // For loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Chatbots</h2>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="w-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-20" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="h-6 w-6 text-violet-600" />
          My Chatbots
        </h2>
        <Button
          onClick={() => window.location.href = '/dashboard/chatbots'}
          className="bg-violet-600 hover:bg-violet-700"
        >
          Create New Chatbot
        </Button>
      </div>

      {bots.length === 0 ? (
        <Card className="w-full border-dashed bg-slate-50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-slate-100 p-4 mb-4">
              <Globe className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-medium mb-2">No chatbots found</h3>
            <p className="text-slate-500 mb-6 text-center max-w-md">
              You haven't created any chatbots yet. Create your first chatbot to enhance your website with AI assistance.
            </p>
            <Button
              onClick={() => window.location.href = '/dashboard/chatbots'}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Create Your First Chatbot
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentBots.map((bot) => (
              <Card
                key={bot._id}
                className="w-full overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              // onClick={() => handleCardClick(bot)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-4">
                    {bot.logo ? (
                      <img
                        src={bot.logo || "/placeholder.svg"}
                        alt={bot.website_name}
                        className="w-16 h-16 rounded-full object-cover border"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/100/e2e8f0/64748b?text=Logo";
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                        <Globe className="h-8 w-8 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle>{bot.website_name}</CardTitle>
                        {bot.metaCodeVerify && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" /> Verified
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        <a
                          href={bot.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline flex items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {bot.url}
                          <ArrowUpRight className="h-3 w-3 ml-1" />
                        </a>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3 text-sm">
                    {bot.info?.description && (
                      <p className="text-slate-700 line-clamp-2">{bot.info.description}</p>
                    )}

                    <div className="grid grid-cols-1 gap-2 pt-2">
                      {bot.info?.contactNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-500" />
                          <span>{bot.info.contactNumber}</span>
                        </div>
                      )}

                      {bot.info?.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span className="truncate">{bot.info.address}</span>
                        </div>
                      )}

                      {bot.info?.timings && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <span>{bot.info.timings.open} - {bot.info.timings.close}</span>
                        </div>
                      )}
                    </div>

                    {(bot.info?.social_links?.insta || bot.info?.social_links?.fb || bot.info?.social_links?.youtube) && (
                      <div className="pt-2">
                        <div className="flex gap-3">
                          {bot.info?.social_links?.insta && (
                            <a
                              href={bot.info.social_links.insta}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="sr-only">Instagram</span>
                              <Instagram size={18} />
                            </a>
                          )}

                          {bot.info?.social_links?.fb && (
                            <a
                              href={bot.info.social_links.fb}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="sr-only">Facebook</span>
                              <Facebook size={18} />
                            </a>
                          )}

                          {bot.info?.social_links?.youtube && (
                            <a
                              href={bot.info.social_links.youtube}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="sr-only">YouTube</span>
                              <Youtube size={18} />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between items-center border-t pt-4">
                  {/* <div className="text-xs text-slate-500">
                    {new Date(bot.joinedData).toLocaleDateString()}
                  </div> */}

                  <div className="flex gap-2">
                    {bot.metaCodeVerify && (
                      <>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => window.location.href = `/dashboard/chatbot/${bot._id}?metaCode=${bot.metaCode}`}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Complete Setup
                        </Button>

                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => window.location.href = `/dashboard/make-flow/chatbot/${bot._id}?metaCode=${bot.metaCode}`}
                          className="flex items-center gap-1"
                        >
                          
                          Make a Flow
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleEditClick(bot, e)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>

                    {!bot.metaCodeVerify && (
                      <Button
                        size="sm"
                        onClick={(e) => handleVerifyModal(bot, e)}
                        className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Verify
                      </Button>
                    )}

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => openDeleteConfirm(bot, e)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Verification Modal */}
      <Dialog open={isVerifyModalOpen} onOpenChange={setIsVerifyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-600" />
              Verify Your Website
            </DialogTitle>
            <DialogDescription>
              We'll check if the verification meta tag has been added to your website.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="verify-url">Website URL</Label>
              <Input
                id="verify-url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta-code">Meta Code</Label>
              <div className="relative">
                <Input
                  id="meta-code"
                  value={metaCode}
                  readOnly
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => copyMetaCode(metaCode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-md border text-sm">
              <p className="font-medium mb-1">How to verify your website:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-700">
                <li>Copy the meta tag code above</li>
                <li>Add it to your website's <code className="bg-slate-100 px-1 py-0.5 rounded">&lt;head&gt;</code> section</li>
                <li>Click "Verify Now" below</li>
              </ol>
            </div>

            {verificationStatus === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Verification Successful!</AlertTitle>
                <AlertDescription>
                  Your website has been verified and the chatbot is ready to be deployed.
                </AlertDescription>
              </Alert>
            )}

            {verificationStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription>
                  Could not find the meta tag on your website. Make sure it's correctly placed in the head section.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsVerifyModalOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={handleVerify}
              disabled={verifyLoading || !websiteUrl || !metaCode}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {verifyLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Verify Now
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-3xl h-[700px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-emerald-600" />
              Edit Chatbot Details
            </DialogTitle>
            <DialogDescription>
              Update contact information and social media links for your chatbot.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                name="contactNumber"
                value={editFormData.contactNumber}
                onChange={handleEditInputChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={editFormData.address}
                onChange={handleEditInputChange}
                placeholder="123 Main St, City, Country"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleShowAtChatBot">Title Shows At Chatbot To User</Label>
              <Input
                id="titleShowAtChatBot"
                name="titleShowAtChatBot"
                value={editFormData.titleShowAtChatBot}
                onChange={(e) => setEditFormData({ ...editFormData, titleShowAtChatBot: e.target.value })}
                placeholder="Title Shows At Chatbot To User"

              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openTime">Opening Time</Label>
                <Input
                  id="openTime"
                  name="openTime"
                  value={editFormData.openTime}
                  onChange={handleEditInputChange}
                  placeholder="9:00 AM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closeTime">Closing Time</Label>
                <Input
                  id="closeTime"
                  name="closeTime"
                  value={editFormData.closeTime}
                  onChange={handleEditInputChange}
                  placeholder="5:00 PM"
                />
              </div>
            </div>

            <Separator />

            <h4 className="font-medium text-sm">Social Media Links</h4>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="flex items-center gap-2">
                <Instagram size={16} className="text-pink-600" />
                Instagram
              </Label>
              <Input
                id="instagram"
                name="instagram"
                value={editFormData.instagram}
                onChange={handleEditInputChange}
                placeholder="https://instagram.com/youraccount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook" className="flex items-center gap-2">
                <Facebook size={16} className="text-purple-600" />
                Facebook
              </Label>
              <Input
                id="facebook"
                name="facebook"
                value={editFormData.facebook}
                onChange={handleEditInputChange}
                placeholder="https://facebook.com/youraccount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube" className="flex items-center gap-2">
                <Youtube size={16} className="text-red-600" />
                YouTube
              </Label>
              <Input
                id="youtube"
                name="youtube"
                value={editFormData.youtube}
                onChange={handleEditInputChange}
                placeholder="https://youtube.com/yourchannel"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete Chatbot
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chatbot? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {botToDelete && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-md border">
                {botToDelete.logo ? (
                  <img
                    src={botToDelete.logo || "/placeholder.svg"}
                    alt={botToDelete.website_name}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-slate-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{botToDelete.website_name}</p>
                  <p className="text-sm text-slate-500">{botToDelete.url}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete Chatbot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllBots;
