import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import AchievementCard from "@/components/quiz/achievement-card";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trophy } from "lucide-react";
import { playSoundEffect } from "@/lib/sounds";
import { Achievement } from "@shared/schema";

export default function AchievementsPage() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<string>("unlocked");

  const { data: allAchievements, isLoading: loadingAllAchievements } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
    enabled: !!user,
  });

  const { data: userAchievements, isLoading: loadingUserAchievements } = useQuery<(Achievement & { unlockedAt: Date })[]>({
    queryKey: ["/api/users/me/achievements"],
    enabled: !!user,
  });

  // Calculate progress for each achievement
  const calculateAchievementProgress = (achievement: Achievement): number => {
    // This is a placeholder - in a real app, this would be calculated based on user activity
    const random = Math.floor(Math.random() * 100);
    return Math.min(random, 99); // Cap at 99% for achievements that aren't unlocked yet
  };

  // Handle tab change
  const handleViewChange = (value: string) => {
    playSoundEffect("buttonClick");
    setCurrentView(value);
  };

  // Get locked achievements
  const getLockedAchievements = () => {
    if (!allAchievements || !userAchievements) return [];
    
    return allAchievements.filter(
      achievement => !userAchievements.some(ua => ua.id === achievement.id)
    );
  };

  // Get the total percentage completion
  const completionPercentage = userAchievements && allAchievements
    ? Math.round((userAchievements.length / allAchievements.length) * 100)
    : 0;

  if (loadingAllAchievements || loadingUserAchievements) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading achievements...</span>
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
          <h1 className="font-poppins font-bold text-3xl mb-2 text-text">Your Achievements</h1>
          <p className="text-text/70">
            Track your progress and earn badges as you complete quizzes
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="md:col-span-2"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-12 w-12 text-primary" />
                  </div>
                  <div className="flex-grow text-center sm:text-left">
                    <h2 className="font-poppins font-semibold text-xl mb-2">
                      Achievement Progress
                    </h2>
                    <p className="text-text/70 mb-4">
                      You've unlocked {userAchievements?.length || 0} out of {allAchievements?.length || 0} achievements
                    </p>
                    <Progress 
                      value={completionPercentage} 
                      className="h-3 mb-2" 
                    />
                    <p className="text-sm text-text/60">
                      {completionPercentage}% complete
                    </p>
                  </div>
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
                <div className="text-center">
                  <h3 className="font-poppins font-semibold text-lg mb-2">Rarest Achievement</h3>
                  {userAchievements && userAchievements.length > 0 ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <IconComponent 
                          name={userAchievements[0].icon} 
                          size={32} 
                          color="#6C63FF" 
                        />
                      </div>
                      <p className="font-medium">{userAchievements[0].name}</p>
                      <p className="text-sm text-text/60">
                        Earned on {new Date(userAchievements[0].unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-text/60">
                      Keep playing to unlock achievements!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Tabs defaultValue="unlocked" value={currentView} onValueChange={handleViewChange}>
            <TabsList className="mb-6">
              <TabsTrigger value="unlocked">Unlocked ({userAchievements?.length || 0})</TabsTrigger>
              <TabsTrigger value="locked">Locked ({getLockedAchievements().length})</TabsTrigger>
              <TabsTrigger value="all">All Achievements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="unlocked">
              {userAchievements && userAchievements.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userAchievements.map(achievement => (
                    <AchievementCard 
                      key={achievement.id}
                      achievement={{
                        ...achievement,
                        unlocked: true,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <CardContent className="pt-6">
                    <h3 className="font-poppins font-semibold text-xl mb-4">No Achievements Yet</h3>
                    <p className="text-text/60 max-w-md mx-auto">
                      Start playing quizzes to earn achievements and track your progress!
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="locked">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {getLockedAchievements().map(achievement => (
                  <AchievementCard 
                    key={achievement.id}
                    achievement={{
                      ...achievement,
                      unlocked: false,
                      progress: calculateAchievementProgress(achievement),
                      total: 100
                    }}
                  />
                ))}
                
                {getLockedAchievements().length === 0 && (
                  <div className="col-span-full">
                    <Card className="p-12 text-center">
                      <CardContent className="pt-6">
                        <h3 className="font-poppins font-semibold text-xl mb-4">All Achievements Unlocked!</h3>
                        <p className="text-text/60 max-w-md mx-auto">
                          Congratulations! You've unlocked all available achievements.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>Achievement Collection</CardTitle>
                  <CardDescription>All available achievements in QuizMaster</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {allAchievements?.map(achievement => {
                      const isUnlocked = userAchievements?.some(ua => ua.id === achievement.id);
                      const unlockedAt = userAchievements?.find(ua => ua.id === achievement.id)?.unlockedAt;
                      
                      return (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition"
                        >
                          <div className={`w-12 h-12 rounded-full ${
                            isUnlocked ? 'bg-primary/10' : 'bg-gray-100'
                          } flex items-center justify-center`}>
                            <IconComponent 
                              name={achievement.icon} 
                              size={24} 
                              color={isUnlocked ? '#6C63FF' : '#94A3B8'} 
                            />
                          </div>
                          
                          <div className="flex-grow">
                            <h3 className="font-medium text-text">{achievement.name}</h3>
                            <p className="text-text/60 text-sm">{achievement.description}</p>
                          </div>
                          
                          <div className="text-right">
                            {isUnlocked ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                                Unlocked
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                Locked
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
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
