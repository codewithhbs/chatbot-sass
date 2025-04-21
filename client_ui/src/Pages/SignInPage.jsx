import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../components/ui/card";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import Cookies from "js-cookie";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const token = Cookies.get("_usertoken");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:7400/api/auth/login", {
        email,
        password
      });

      toast.success("You have successfully signed in!");
      Cookies.set("_usertoken", res.data.token, { expires: 7 });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.log("error",error.response.data.message);
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log("Google decoded data:", decoded);

    try {
      const res = await axios.post("http://localhost:7400/api/auth/google-login", {
        token: credentialResponse.credential
      });

      toast.success("You have successfully signed in!");
      Cookies.set("_usertoken", res.data.token, { expires: 7 });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("Google login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center text-gray-600 mb-8 hover:text-blue-600">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-blue-600 p-2 rounded-full">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Sign in to ChatWave</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="#" className="text-sm text-blue-600 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </form>

            <div className="mt-4 text-center text-sm">
              <span>Don't have an account? </span>
              <Link to="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col">
            <div className="relative w-full mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  toast.error("Google login failed.");
                }}
              />
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignInPage;
