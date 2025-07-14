import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Loader2, User, Settings, Award, ChevronDown, Edit, Trophy, LogOut, Check } from "lucide-react";
import { playSoundEffect } from "@/lib/sounds";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { QuizAttempt, Achievement } from "@shared/schema";

// Define form schema for profile updates
const profileFormSchema = z.object({
  displayName: z.string().min(3, "Display name must be at least 3 characters"),
  profileTitle: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  
  // Profile form setup
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || user?.username || "",
      profileTitle: user?.profileTitle || "",
      email: user?.email || "",
    },
  });

  // Fetch user's quiz attempts
  const { data: quizAttempts, isLoading: loadingAttempts } = useQuery<QuizAttempt[]>({
    queryKey: ["/api/users/me/quiz-attempts"],
    enabled: !!user,
  });

  // Fetch user's achievements
  const { data: achievements, isLoading: loadingAchievements } = useQuery<(Achievement & { unlockedAt: Date })[]>({
    queryKey: ["/api/users/me/achievements"],
    enabled: !!user,
  });

  // Fetch categories for quiz attempts
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    enabled: !!user,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/users/me", values);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsEditing(false);
      playSoundEffect("achievement");
    },
  });

  // Handle profile form submission
  const onSubmitProfile = (data: ProfileFormValues) => {
    playSoundEffect("buttonClick");
    updateProfileMutation.mutate(data);
  };

  // Handle tab changes
  const handleTabChange = (value: string) => {
    playSoundEffect("buttonClick");
    setActiveTab(value);
  };

  // Handle logout
  const handleLogout = () => {
    playSoundEffect("buttonClick");
    logoutMutation.mutate();
  };

  // Format date for display
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get category name by ID
  const getCategoryName = (categoryId: number) => {
    const category = categories?.find(c => c.id === categoryId);
    return category?.name || "Unknown";
  };

  // Get category color by ID
  const getCategoryColor = (categoryId: number) => {
    const category = categories?.find(c => c.id === categoryId);
    return category?.color || "#6C63FF";
  };

  // Calculate average score
  const calculateAverageScore = () => {
    if (!quizAttempts || quizAttempts.length === 0) return 0;
    const total = quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    return Math.round(total / quizAttempts.length);
  };

  // Calculate accuracy rate
  const calculateAccuracyRate = () => {
    if (!quizAttempts || quizAttempts.length === 0) return 0;
    const totalCorrect = quizAttempts.reduce((sum, attempt) => sum + attempt.correctAnswers, 0);
    const totalQuestions = quizAttempts.reduce((sum, attempt) => sum + attempt.totalQuestions, 0);
    return Math.round((totalCorrect / totalQuestions) * 100);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading profile...</span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-poppins font-bold text-3xl mb-2 text-text">My Profile</h1>
            <p className="text-text/70">
              View and manage your profile information and quiz progress
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                playSoundEffect("buttonClick");
                setIsEditing(!isEditing);
                if (!isEditing) {
                  setActiveTab("settings");
                }
              }}
            >
              {isEditing ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              {isEditing ? "Done" : "Edit Profile"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar - Profile Summary */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <span className="text-4xl font-bold text-primary">
                      {user.displayName?.[0] || user.username[0].toUpperCase()}
                    </span>
                  </div>
                  <h2 className="font-poppins font-semibold text-xl text-center">
                    {user.displayName || user.username}
                  </h2>
                  <p className="text-text/60 text-sm text-center mb-4">
                    {user.profileTitle || "Quiz Enthusiast"}
                  </p>
                  
                  <div className="w-full mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text/60">Rank</span>
                      <span className="font-medium">#{user.rank || "-"}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text/60">Score</span>
                      <span className="font-medium">{user.score.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text/60">Quizzes</span>
                      <span className="font-medium">{quizAttempts?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text/60">Achievements</span>
                      <span className="font-medium">{achievements?.length || 0}/10</span>
                    </div>
                  </div>
                  
                  <div className="w-full mt-6 pt-4 border-t border-gray-100">
                    <h3 className="font-medium text-sm mb-2">Latest Achievements</h3>
                    {achievements && achievements.length > 0 ? (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {achievements.slice(0, 4).map(achievement => (
                          <div 
                            key={achievement.id} 
                            title={achievement.name}
                            className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                          >
                            <IconComponent name={achievement.icon} size={16} color="#6C63FF" />
                          </div>
                        ))}
                        {achievements.length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text/60 text-xs">
                            +{achievements.length - 4}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-text/60 text-xs text-center">
                        No achievements yet
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Quiz Activity</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Average Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-primary">
                          {calculateAverageScore().toLocaleString()}
                        </div>
                        <p className="text-text/60 text-sm">
                          Points per quiz
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Accuracy Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-secondary">
                          {calculateAccuracyRate()}%
                        </div>
                        <p className="text-text/60 text-sm">
                          Correct answers
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Quiz Completion</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-accent">
                          {quizAttempts?.length || 0}/50
                        </div>
                        <p className="text-text/60 text-sm">
                          Total completed quizzes
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Performance by Category</CardTitle>
                      <CardDescription>Your quiz performance across different categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {categories && categories.length > 0 ? (
                        <div className="space-y-4">
                          {categories.map(category => {
                            const categoryAttempts = quizAttempts?.filter(a => a.categoryId === category.id) || [];
                            const totalAttempts = categoryAttempts.length;
                            const categoryCompletion = (totalAttempts / 10) * 100;
                            const categoryAccuracy = categoryAttempts.length > 0 
                              ? Math.round((categoryAttempts.reduce((sum, a) => sum + a.correctAnswers, 0) / 
                                categoryAttempts.reduce((sum, a) => sum + a.totalQuestions, 0)) * 100)
                              : 0;
                            
                            return (
                              <div key={category.id}>
                                <div className="flex justify-between items-center mb-1">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-6 h-6 rounded-full flex items-center justify-center"
                                      style={{ backgroundColor: `${category.color}20` }}
                                    >
                                      <IconComponent name={category.icon} size={14} color={category.color} />
                                    </div>
                                    <span className="font-medium">{category.name}</span>
                                  </div>
                                  <div className="text-sm text-text/60">
                                    {totalAttempts}/10 quizzes • {categoryAccuracy}% accuracy
                                  </div>
                                </div>
                                <Progress value={categoryCompletion} className="h-2" />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-text/60">
                          No category data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Quiz Activity</CardTitle>
                      <CardDescription>Your most recent quizzes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {quizAttempts && quizAttempts.length > 0 ? (
                        <div className="space-y-3">
                          {quizAttempts.slice(0, 5).map(attempt => (
                            <div 
                              key={attempt.id} 
                              className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-50 transition"
                            >
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-10 h-10 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: `${getCategoryColor(attempt.categoryId)}10` }}
                                >
                                  <Trophy className="h-5 w-5" style={{ color: getCategoryColor(attempt.categoryId) }} />
                                </div>
                                <div>
                                  <h4 className="font-medium">{getCategoryName(attempt.categoryId)} Quiz</h4>
                                  <p className="text-sm text-text/60">
                                    {formatDate(attempt.completedAt)} • 
                                    Score: {attempt.score} pts
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  attempt.correctAnswers / attempt.totalQuestions >= 0.8 
                                    ? "bg-accent/10 text-accent" 
                                    : attempt.correctAnswers / attempt.totalQuestions >= 0.5
                                    ? "bg-primary/10 text-primary"
                                    : "bg-secondary/10 text-secondary"
                                }`}>
                                  {attempt.correctAnswers}/{attempt.totalQuestions}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-text/60">
                          No quiz activity yet. Start playing to see your results!
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
              
              {/* Quiz Activity Tab */}
              <TabsContent value="activity">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>All Quiz Attempts</CardTitle>
                      <CardDescription>Your complete quiz history</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {quizAttempts && quizAttempts.length > 0 ? (
                        <div className="relative overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-4 py-3 text-sm font-medium text-text/60">Date</th>
                                <th className="px-4 py-3 text-sm font-medium text-text/60">Category</th>
                                <th className="px-4 py-3 text-sm font-medium text-text/60">Score</th>
                                <th className="px-4 py-3 text-sm font-medium text-text/60">Correct</th>
                                <th className="px-4 py-3 text-sm font-medium text-text/60">Time</th>
                                <th className="px-4 py-3 text-sm font-medium text-text/60">Accuracy</th>
                              </tr>
                            </thead>
                            <tbody>
                              {quizAttempts.map(attempt => {
                                const accuracyPercentage = Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100);
                                const minutes = Math.floor(attempt.timeTaken / 60);
                                const seconds = attempt.timeTaken % 60;
                                const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                                
                                return (
                                  <tr key={attempt.id} className="border-b hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 text-sm">
                                      {formatDate(attempt.completedAt)}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <div 
                                          className="w-6 h-6 rounded-full flex items-center justify-center"
                                          style={{ backgroundColor: `${getCategoryColor(attempt.categoryId)}10` }}
                                        >
                                          <IconComponent 
                                            name={categories?.find(c => c.id === attempt.categoryId)?.icon || "trophy"} 
                                            size={14} 
                                            color={getCategoryColor(attempt.categoryId)} 
                                          />
                                        </div>
                                        <span>{getCategoryName(attempt.categoryId)}</span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium">{attempt.score}</td>
                                    <td className="px-4 py-3">{attempt.correctAnswers}/{attempt.totalQuestions}</td>
                                    <td className="px-4 py-3">{timeFormatted}</td>
                                    <td className="px-4 py-3">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                        accuracyPercentage >= 80 
                                          ? "bg-accent/10 text-accent" 
                                          : accuracyPercentage >= 50
                                          ? "bg-primary/10 text-primary"
                                          : "bg-secondary/10 text-secondary"
                                      }`}>
                                        {accuracyPercentage}%
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-text/60">
                          No quiz attempts yet. Start playing to see your results!
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
              
              {/* Achievements Tab */}
              <TabsContent value="achievements">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Achievements Progress</CardTitle>
                      <CardDescription>
                        You've unlocked {achievements?.length || 0} out of 10 achievements
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Progress 
                        value={((achievements?.length || 0) / 10) * 100} 
                        className="h-3 mb-4" 
                      />
                      
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
                        {Array.from({ length: 10 }).map((_, i) => {
                          const achievement = achievements?.find(a => a.id === i + 1);
                          const isUnlocked = !!achievement;
                          
                          return (
                            <div 
                              key={i} 
                              className={`flex flex-col items-center p-3 rounded-lg border ${
                                isUnlocked ? "border-primary/30 bg-primary/5" : "border-gray-200 bg-gray-50"
                              }`}
                            >
                              <div className={`w-12 h-12 rounded-full ${
                                isUnlocked ? "bg-primary/20" : "bg-gray-200"
                              } flex items-center justify-center mb-2`}>
                                {achievement ? (
                                  <IconComponent 
                                    name={achievement.icon} 
                                    size={24} 
                                    color={isUnlocked ? "#6C63FF" : "#94A3B8"} 
                                  />
                                ) : (
                                  <Award className="w-6 h-6 text-gray-400" />
                                )}
                              </div>
                              <p className="text-sm font-medium text-center">
                                {achievement ? achievement.name : "Locked"}
                              </p>
                              {isUnlocked && (
                                <p className="text-xs text-text/60 text-center mt-1">
                                  {formatDate(achievement.unlockedAt)}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {achievements && achievements.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Achievements</CardTitle>
                        <CardDescription>Details about achievements you've earned</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {achievements.map(achievement => (
                            <motion.div 
                              key={achievement.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition"
                            >
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <IconComponent name={achievement.icon} size={24} color="#6C63FF" />
                              </div>
                              
                              <div className="flex-grow">
                                <h3 className="font-medium text-text">{achievement.name}</h3>
                                <p className="text-text/60 text-sm">{achievement.description}</p>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-accent text-sm font-medium">Completed</div>
                                <div className="text-text/60 text-xs">
                                  {formatDate(achievement.unlockedAt)}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </TabsContent>
              
              {/* Settings Tab */}
              <TabsContent value="settings">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Settings</CardTitle>
                      <CardDescription>Update your profile information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                          <FormField
                            control={profileForm.control}
                            name="displayName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Display Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your display name" {...field} />
                                </FormControl>
                                <FormDescription>
                                  This is how you'll appear to other users
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="profileTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Profile Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Quiz Champion, History Buff, etc." {...field} />
                                </FormControl>
                                <FormDescription>
                                  A short title that appears under your name
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="Your email address" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Used for notifications and password recovery
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : "Save Changes"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// Helper component to render icons
function IconComponent({ name, size = 24, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  // Map icon names to Remix icons
  switch (name) {
    case 'flask':
      return <span className="ri-flask-line" style={{ fontSize: size, color }}></span>;
    case 'book-open':
      return <span className="ri-book-open-line" style={{ fontSize: size, color }}></span>;
    case 'movie':
      return <span className="ri-movie-line" style={{ fontSize: size, color }}></span>;
    case 'earth':
      return <span className="ri-earth-line" style={{ fontSize: size, color }}></span>;
    case 'computer':
      return <span className="ri-computer-line" style={{ fontSize: size, color }}></span>;
    case 'trophy':
      return <span className="ri-trophy-line" style={{ fontSize: size, color }}></span>;
    case 'award':
      return <span className="ri-award-line" style={{ fontSize: size, color }}></span>;
    case 'fire':
      return <span className="ri-fire-line" style={{ fontSize: size, color }}></span>;
    case 'star':
      return <span className="ri-star-line" style={{ fontSize: size, color }}></span>;
    case 'target':
      return <span className="ri-focus-3-line" style={{ fontSize: size, color }}></span>;
    default:
      return <span className="ri-award-line" style={{ fontSize: size, color }}></span>;
  }
}
