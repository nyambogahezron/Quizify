import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { playSoundEffect } from "@/lib/sounds";
import { insertUserSchema } from "@shared/schema";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  displayName: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  
  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      displayName: "",
      email: "",
      terms: false,
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    playSoundEffect("buttonClick");
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    playSoundEffect("buttonClick");
    // Omit confirmPassword and terms from the submitted data
    const { confirmPassword, terms, ...userData } = data;
    registerMutation.mutate(userData);
  };

  // Handle demo login
  const handleDemoLogin = async () => {
    try {
      const response = await fetch('/api/demo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to login with demo account');
      }
      
      const user = await response.json();
      
      // The queryClient in loginMutation will be updated in the useEffect
      // when the auth API responds with the user data
      playSoundEffect("achievement");
      
      // Refresh to trigger the useEffect hook with the new user data
      window.location.href = '/';
    } catch (error) {
      console.error('Demo login error:', error);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    playSoundEffect("buttonClick");
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full">
          {/* Left column - Form */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-poppins font-bold text-xl mx-auto">
                QM
              </div>
              <h1 className="font-poppins font-bold text-2xl mt-4 text-text">
                Welcome to QuizMaster
              </h1>
              <p className="text-text/60 mt-2">
                {activeTab === "login" 
                  ? "Sign in to continue your quiz journey" 
                  : "Create an account and start your quiz journey"}
              </p>
            </div>

            <Tabs defaultValue="login" value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between">
                      <FormField
                        control={loginForm.control}
                        name="remember"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm cursor-pointer">Remember me</FormLabel>
                          </FormItem>
                        )}
                      />
                      <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                  <Button 
                    variant="secondary" 
                    className="w-full mb-4"
                    onClick={() => {
                      playSoundEffect("buttonClick");
                      handleDemoLogin();
                    }}
                  >
                    <span className="ri-user-smile-line mr-2"></span>
                    <span>Try with Demo Account</span>
                  </Button>
                
                  <p className="text-text/60 mb-4">Or continue with</p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" className="flex-1">
                      <span className="ri-google-fill mr-2"></span>
                      <span>Google</span>
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <span className="ri-facebook-fill mr-2"></span>
                      <span>Facebook</span>
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <span className="ri-apple-fill mr-2"></span>
                      <span>Apple</span>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your display name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Create a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="terms"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm">
                              I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
                              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                  <p className="text-text/60 mb-4">Or sign up with</p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" className="flex-1">
                      <span className="ri-google-fill mr-2"></span>
                      <span>Google</span>
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <span className="ri-facebook-fill mr-2"></span>
                      <span>Facebook</span>
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <span className="ri-apple-fill mr-2"></span>
                      <span>Apple</span>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-8 text-center">
              {activeTab === "login" ? (
                <p className="text-text/60">
                  Don't have an account?{" "}
                  <Button variant="link" className="p-0" onClick={() => setActiveTab("register")}>
                    Sign up
                  </Button>
                </p>
              ) : (
                <p className="text-text/60">
                  Already have an account?{" "}
                  <Button variant="link" className="p-0" onClick={() => setActiveTab("login")}>
                    Sign in
                  </Button>
                </p>
              )}
            </div>
          </div>

          {/* Right column - Hero */}
          <div className="hidden md:block bg-gradient-to-br from-primary/10 to-background rounded-xl p-10 flex flex-col justify-center">
            <h2 className="font-poppins font-bold text-3xl mb-4 text-text">Test Your Knowledge with <span className="text-primary">QuizMaster</span></h2>
            <p className="text-lg mb-6 text-text/80">Challenge yourself with quizzes across Science, History, Pop Culture, Geography, and Technology.</p>
            
            <div className="space-y-4 mt-6">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full text-primary mt-1">
                  <span className="ri-checkbox-circle-line"></span>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Multiple Categories</h3>
                  <p className="text-text/70">Choose from 5 diverse categories with challenging questions</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-secondary/10 p-2 rounded-full text-secondary mt-1">
                  <span className="ri-trophy-line"></span>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Track Your Progress</h3>
                  <p className="text-text/70">Earn achievements and climb the leaderboard</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-accent/10 p-2 rounded-full text-accent mt-1">
                  <span className="ri-award-line"></span>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Unlock Achievements</h3>
                  <p className="text-text/70">Complete quizzes to earn badges and special recognition</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
