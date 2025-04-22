import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Calendar, LogOut, Lock, CreditCard, Mail, Shield, AtSign, Eye, EyeOff, Clock, User } from "lucide-react";
import AuthContext from "@/context/authContext";
import { API_URL } from "@/constant/Urls";

const Profile = () => {
  const { user, logout ,token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [profileProgress, setProfileProgress] = useState(0);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  // Calculate profile completion percentage
  useEffect(() => {
    if (user) {
      let completionScore = 0;
      if (user.name) completionScore += 25;
      if (user.email) completionScore += 25;
      if (user.password) completionScore += 25;

      if (user.authType) completionScore += 25;
      setProfileProgress(completionScore);
    }
  }, [user, imageError]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  const handleChangePlan = () => {
    navigate("/change-plan");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
  };

  const handlePasswordSubmit = async () => {
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setIsSubmitting(true);
      // Replace with your actual API endpoint
      await axios.post(
        `${API_URL}/auth/update-password`,
        { password: passwordForm.password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Password updated successfully");
      setIsPasswordDialogOpen(false);
      setPasswordForm({ password: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "NA";
    const nameParts = name.split(" ");
    const firstLetter = nameParts[0]?.charAt(0)?.toUpperCase();
    const lastLetter = nameParts[nameParts.length - 1]?.charAt(0)?.toUpperCase();
    return `${firstLetter}${lastLetter}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Calculate joined date from _id (MongoDB ObjectId contains a timestamp)
  const getJoinedDateFromObjectId = (objectId) => {
    if (!objectId) return "Unknown";
    // Extract timestamp from MongoDB ObjectId (first 4 bytes)
    const timestamp = parseInt(objectId.substring(0, 8), 16) * 1000;
    return formatDate(new Date(timestamp));
  };

  const getAuthTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "google":
        return <AtSign className="h-4 w-4" />;
      case "facebook":
        return <Shield className="h-4 w-4" />;
      case "custom":
        return <Mail className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const joinedDate = getJoinedDateFromObjectId(user._id);

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {imageError ? (
                <div className="w-24 h-24 flex items-center justify-center bg-blue-600 text-white rounded-full text-xl font-bold shadow-md">
                  {getInitials(user?.name || "")}
                </div>
              ) : (
                <img
                  src={
                    user?.picture ||
                    "https://res.cloudinary.com/dglihfwse/image/upload/v1745318543/user_2_pltaly.png"
                  }
                  alt="User"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  onError={() => setImageError(true)}
                />
              )}
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow">
                {getAuthTypeIcon(user.authType)}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold mt-4">{user.name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-1 text-gray-500">
              <Mail className="h-4 w-4" /> {user.email}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Profile Completion</span>
              <span className="font-medium">{profileProgress}%</span>
            </div>
            <Progress value={profileProgress} className="h-2" />
          </div>

          <div className="grid gap-4">
            <div className="flex items-center p-3 rounded-lg bg-blue-50">
              <Clock className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Joined On</p>
                <p className="font-medium">{joinedDate}</p>
              </div>
            </div>

            <div className="flex items-center p-3 rounded-lg bg-purple-50">
              <AtSign className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Login Method</p>
                <p className="font-medium capitalize">{user.authType || "Email"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2 border-2"
                >
                  <Lock className="h-4 w-4" /> Set Password
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Set New Password</DialogTitle>
                  <DialogDescription>
                    Create a secure password for your account
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="New password"
                      value={passwordForm.password}
                      onChange={handlePasswordChange}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPasswordDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handlePasswordSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Password"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="w-full flex items-center gap-2 border-2"
              onClick={handleChangePlan}
            >
              <CreditCard className="h-4 w-4" /> Change Plan
            </Button>

            <Button
              variant="destructive"
              className="w-full flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="pt-0 text-center text-xs text-gray-500">
          <p className="w-full">User ID: {user._id}</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Profile;