import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Trophy, Medal, Award } from "lucide-react";
import { playSoundEffect } from "@/lib/sounds";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<string>("weekly");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const previousRankRef = useRef<number | null>(null);

  const { data: topUsers, isLoading } = useQuery<User[]>({
    queryKey: ["/api/leaderboard", { limit: 50 }],
    enabled: !!user,
  });

  // Get user rank from the user object
  const userRank = user?.rank || 0;

  // Track rank changes and play notification sound when rank improves
  useEffect(() => {
    if (user && previousRankRef.current !== null) {
      // Check if rank improved (smaller rank number is better)
      if (userRank < previousRankRef.current) {
        // Play notification sound
        playSoundEffect("achievement");
        
        // Show toast notification
        toast({
          title: "Rank Improved!",
          description: `You moved up the leaderboard from #${previousRankRef.current} to #${userRank}!`,
          variant: "default",
        });
      }
    }
    
    // Update previous rank
    previousRankRef.current = userRank;
  }, [userRank, user, toast]);

  // Filter handlers
  const handlePeriodChange = (value: string) => {
    playSoundEffect("buttonClick");
    setLeaderboardPeriod(value);
  };

  const handleCategoryChange = (value: string) => {
    playSoundEffect("buttonClick");
    setCategoryFilter(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading leaderboard...</span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-poppins font-bold text-3xl mb-2 text-text">Leaderboard</h1>
          <p className="text-text/70">
            See how you rank against other players and compete for the top spots
          </p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-white">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/80 font-medium">Your Rank</p>
                    <h3 className="font-poppins font-bold text-3xl mt-1">#{userRank}</h3>
                  </div>
                  <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-white/80 text-sm">
                    {userRank <= 10 ? "Excellent! You're in the top 10" : 
                     userRank <= 50 ? "Great job! Keep climbing" : 
                     "Keep practicing to improve your rank"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-text/60 font-medium">Your Score</p>
                    <h3 className="font-poppins font-bold text-3xl mt-1">{user?.score.toLocaleString()}</h3>
                  </div>
                  <div className="bg-secondary/10 w-12 h-12 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-secondary" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-text/60 text-sm">Keep playing to increase your score!</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="md:col-span-2"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <p className="text-text/60 font-medium">Top Scorer</p>
                    {topUsers && topUsers.length > 0 && (
                      <div className="flex items-center gap-3 mt-2">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <span className="font-bold">
                            {topUsers[0].displayName?.[0] || topUsers[0].username[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-poppins font-bold text-xl">
                            {topUsers[0].displayName || topUsers[0].username}
                          </h3>
                          <p className="text-text/60 text-sm">
                            Score: {topUsers[0].score.toLocaleString()} • Rank: #1
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-text/60 text-sm mb-1">Time Period</p>
                      <Select defaultValue="weekly" onValueChange={handlePeriodChange}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Time Period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">This Week</SelectItem>
                          <SelectItem value="monthly">This Month</SelectItem>
                          <SelectItem value="alltime">All Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <p className="text-text/60 text-sm mb-1">Category</p>
                      <Select defaultValue="all" onValueChange={handleCategoryChange}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="1">Science</SelectItem>
                          <SelectItem value="2">History</SelectItem>
                          <SelectItem value="3">Pop Culture</SelectItem>
                          <SelectItem value="4">Geography</SelectItem>
                          <SelectItem value="5">Technology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Tabs defaultValue="everyone" onValueChange={() => playSoundEffect("buttonClick")}>
            <TabsList className="mb-6">
              <TabsTrigger value="everyone">Everyone</TabsTrigger>
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="nearby">Nearby</TabsTrigger>
            </TabsList>
            
            <TabsContent value="everyone">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {leaderboardPeriod === "weekly" ? "Weekly" : 
                     leaderboardPeriod === "monthly" ? "Monthly" : "All-Time"} Leaderboard
                     {categoryFilter !== "all" ? ` - ${getCategoryName(categoryFilter)}` : ""}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-3 px-6 text-left text-xs font-medium text-text/60 uppercase tracking-wider">Rank</th>
                          <th className="py-3 px-6 text-left text-xs font-medium text-text/60 uppercase tracking-wider">Player</th>
                          <th className="py-3 px-6 text-left text-xs font-medium text-text/60 uppercase tracking-wider">Score</th>
                          <th className="py-3 px-6 text-left text-xs font-medium text-text/60 uppercase tracking-wider hidden md:table-cell">Quizzes</th>
                          <th className="py-3 px-6 text-left text-xs font-medium text-text/60 uppercase tracking-wider hidden md:table-cell">Achievements</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topUsers?.map((topUser, index) => {
                          const isCurrentUser = user?.id === topUser.id;
                          
                          return (
                            <tr 
                              key={topUser.id} 
                              className={`border-b border-gray-100 ${isCurrentUser ? "bg-primary/5" : ""}`}
                            >
                              <td className="py-4 px-6">
                                <div className="flex items-center">
                                  {index < 3 ? (
                                    <div className={`w-8 h-8 rounded-full ${
                                      index === 0 ? "bg-primary" : 
                                      index === 1 ? "bg-secondary" : 
                                      "bg-accent"
                                    } text-white flex items-center justify-center font-medium`}>
                                      {index + 1}
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 text-text/70 flex items-center justify-center font-medium">
                                      {index + 1}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center">
                                  <div className={`w-10 h-10 rounded-full ${
                                    isCurrentUser ? "bg-primary/30" : "bg-primary/10"
                                  } flex items-center justify-center text-primary mr-3`}>
                                    <span className="font-bold">
                                      {topUser.displayName?.[0] || topUser.username[0].toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium">
                                      {topUser.displayName || topUser.username}
                                      {isCurrentUser && " (You)"}
                                    </div>
                                    <div className="text-xs text-text/60">
                                      {topUser.profileTitle || getDefaultTitle(index)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="font-semibold">{topUser.score.toLocaleString()}</div>
                              </td>
                              <td className="py-4 px-6 hidden md:table-cell">
                                {/* This would need additional data */}
                                {Math.floor(Math.random() * 20) + 10}
                              </td>
                              <td className="py-4 px-6 hidden md:table-cell">
                                <div className="flex -space-x-1">
                                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                    </svg>
                                  </div>
                                  <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                    </svg>
                                  </div>
                                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                  </div>
                                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                    +{Math.floor(Math.random() * 5) + 2}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        
                        {topUsers?.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-text/60">
                              No leaderboard data available for the selected filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="friends">
              <Card className="flex flex-col items-center justify-center p-12">
                <Medal className="h-16 w-16 text-primary/50 mb-4" />
                <h3 className="font-poppins font-semibold text-xl mb-2 text-text">Friends Leaderboard</h3>
                <p className="text-text/60 text-center max-w-md">
                  Connect with friends to see how you rank against them and challenge each other to improve your scores.
                </p>
              </Card>
            </TabsContent>
            
            <TabsContent value="nearby">
              <Card className="flex flex-col items-center justify-center p-12">
                <Award className="h-16 w-16 text-primary/50 mb-4" />
                <h3 className="font-poppins font-semibold text-xl mb-2 text-text">Nearby Players</h3>
                <p className="text-text/60 text-center max-w-md">
                  Enable location to see players in your area and compete with them on the local leaderboard.
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}

// Helper functions
function getCategoryName(categoryId: string): string {
  const categories: Record<string, string> = {
    "1": "Science",
    "2": "History",
    "3": "Pop Culture",
    "4": "Geography",
    "5": "Technology"
  };
  
  return categories[categoryId] || "Unknown";
}

function getDefaultTitle(rank: number): string {
  if (rank === 0) return "Quiz Champion";
  if (rank === 1) return "Quiz Master";
  if (rank === 2) return "Knowledge Expert";
  if (rank < 10) return "Quiz Enthusiast";
  return "Quiz Learner";
}
