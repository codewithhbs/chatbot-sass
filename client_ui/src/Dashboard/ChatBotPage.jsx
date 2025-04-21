import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle, Globe, Building, Phone, Clock, MapPin, ImageIcon, FileText, Instagram, Facebook, Youtube, Copy, ExternalLink } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import AuthContext from "@/context/authContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

const ChatBotPage = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();
  const { token } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [metaCode, setMetaCode] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:7400/api/auth/register-website?token=${token}`,
        data
      );
      setMetaCode(res.data.metaCode);
      setWebsiteUrl(data.url);
      toast.success("Website registered successfully!", {
        description: "Your website has been registered for chatbot integration.",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });
      reset();
    } catch (err) {
      console.log(err.response?.data);
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
      toast.error("Error", {
        description: errorMessage,
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
    } finally {
      setLoading(false);
    }
  };


 

  const handleVerify = async () => {
    setVerifyLoading(true);
    setVerificationStatus(null);

    try {
      // Replace with your actual verification API endpoint
      const res = await axios.post(
        `http://localhost:7400/api/auth/check-meta-code?token=${token}`,
        {
          url: websiteUrl,
          metaCode: metaCode
        }
      );
      console.log(res.data)
      setVerificationStatus("success");
      toast.success("Website verified successfully!", {
        description: "Your chatbot is now ready to be deployed on your website.",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });
    } catch (err) {
      setVerificationStatus("error");
      const errorMessage = err.response?.data?.message || "Verification failed. Please make sure the meta tag is correctly placed in your website's head section.";
      toast.error("Verification Failed", {
        description: errorMessage,
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  const copyMetaTag = () => {
    navigator.clipboard.writeText(`<meta name="chatbot-verification" content="${metaCode}" />`);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Card className="shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-2xl font-semibold text-center flex items-center justify-center gap-2">
            <Globe className="h-5 w-5 text-purple-600" />
            Make Your Chatbot
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label htmlFor="website_name" className="flex items-center gap-2">
                <Building className="h-4 w-4 text-slate-600" />
                Website Name
              </Label>
              <Input
                {...register("website_name", {
                  required: "Website name is required"
                })}
                className={errors.website_name ? "border-red-300" : ""}
                placeholder="My Awesome Website"
              />
              {errors.website_name && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.website_name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="url" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-600" />
                Website URL
              </Label>
              <Input
                {...register("url", {
                  required: "Website URL is required",
                  pattern: {
                    value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                    message: "Please enter a valid URL"
                  }
                })}
                className={errors.url ? "border-red-300" : ""}
                placeholder="https://mywebsite.com"
              />
              {errors.url && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.url.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="logo" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-slate-600" />
                Logo URL
              </Label>
              <Input
                {...register("logo")}
                placeholder="https://mywebsite.com/logo.png"
              />
            </div>

            <div>
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-600" />
                Description
              </Label>
              <Textarea
                {...register("info.description")}
                placeholder="A brief description of your website or business"
                className="min-h-24"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactNumber" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-600" />
                  Contact Number
                </Label>
                <Input
                  {...register("info.contactNumber")}
                  placeholder="+1 (234) 567-8900"
                />
              </div>

              <div>
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-600" />
                  Address
                </Label>
                <Input
                  {...register("info.address")}
                  placeholder="123 Business St, City, State"
                />
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-600" />
                Business Hours
              </Label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="openingTime" className="text-xs text-slate-500">
                    Opening Time
                  </Label>
                  <Input
                    {...register("info.timings.open")}
                    placeholder="9:00 AM"
                  />
                </div>
                <div>
                  <Label htmlFor="closingTime" className="text-xs text-slate-500">
                    Closing Time
                  </Label>
                  <Input
                    {...register("info.timings.close")}
                    placeholder="5:00 PM"
                  />
                </div>
              </div>

              <div className="mt-2 text-sm text-slate-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                <span>Example: 9:00 AM - 5:00 PM, Mon-Fri</span>
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-slate-600" />
                Social Media Links
              </Label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Instagram className="h-4 w-4 text-pink-500 absolute left-3 top-3" />
                  <Input
                    {...register("info.social_links.insta")}
                    placeholder="Instagram handle"
                    className="pl-9"
                  />
                </div>
                <div className="relative">
                  <Facebook className="h-4 w-4 text-purple-600 absolute left-3 top-3" />
                  <Input
                    {...register("info.social_links.fb")}
                    placeholder="Facebook page"
                    className="pl-9"
                  />
                </div>
                <div className="relative">
                  <Youtube className="h-4 w-4 text-red-600 absolute left-3 top-3" />
                  <Input
                    {...register("info.social_links.youtube")}
                    placeholder="YouTube channel"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <Button
              disabled={loading}
              type="submit"
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Create Chatbot
                </span>
              )}
            </Button>
          </form>

          {metaCode && (
            <div className="mt-6 p-4 border rounded-md bg-green-50">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <CheckCircle className="w-5 h-5" />
                <span>Verification Meta Code Generated</span>
              </div>
              <p className="text-sm text-slate-600 mt-1 mb-2">
                Add this meta tag to your website's &lt;head&gt; section to complete verification:
              </p>
              <div className="relative">
                <code className="block p-3 bg-white border rounded-md text-sm font-mono overflow-x-auto">
                  &lt;meta name="chatbot-verification" content="{metaCode}" /&gt;
                </code>
                <Button
                  onClick={copyMetaTag}
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-2"
                >
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                </Button>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setIsVerifyModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Verify Website
                </Button>

                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(`https://validator.w3.org/nu/?doc=${encodeURIComponent(websiteUrl)}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" /> Validate HTML
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Modal */}
      <Dialog open={isVerifyModalOpen} onOpenChange={setIsVerifyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Your Website</DialogTitle>
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
                  onChange={(e) => setMetaCode(e.target.value)}
                  className="pr-10"
                  readOnly
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                  onClick={copyMetaTag}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {verificationStatus === "success" && (
              <div className="bg-green-50 p-3 rounded-md flex items-start gap-2 text-green-700">
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Verification Successful!</p>
                  <p className="text-sm">Your chatbot is now ready to be deployed on your website.</p>
                </div>
              </div>
            )}

            {verificationStatus === "error" && (
              <div className="bg-red-50 p-3 rounded-md flex items-start gap-2 text-red-700">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Verification Failed</p>
                  <p className="text-sm">We couldn't find the meta tag on your website. Please make sure:</p>
                  <ul className="text-sm list-disc ml-4 mt-1">
                    <li>The meta tag is placed in the &lt;head&gt; section</li>
                    <li>The content attribute matches exactly</li>
                    <li>Your website is accessible</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsVerifyModalOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={handleVerify}
              disabled={verifyLoading || !websiteUrl || !metaCode}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {verifyLoading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Now
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatBotPage;
