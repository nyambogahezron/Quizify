import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CategoryCard from "@/components/quiz/category-card";
import AchievementCard from "@/components/quiz/achievement-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Medal, Award } from "lucide-react";
import { playSoundEffect } from "@/lib/sounds";
import { Category, QuizAttempt, Achievement } from "@shared/schema";

export default function HomePage() {
  const { user } = useAuth();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: !!user,
  });

  const { data: quizAttempts } = useQuery<QuizAttempt[]>({
    queryKey: ["/api/users/me/quiz-attempts"],
    enabled: !!user,
  });

  const { data: completedCount } = useQuery<{ count: number }>({
    queryKey: ["/api/users/me/completed-quizzes"],
    enabled: !!user,
  });

  const { data: achievements } = useQuery<(Achievement & { unlockedAt: Date })[]>({
    queryKey: ["/api/users/me/achievements"],
    enabled: !!user,
  });

  const { data: topUsers } = useQuery<any[]>({
    queryKey: ["/api/leaderboard"],
    enabled: !!user,
  });

  // Calculate category completion stats
  const getCategoryCompletedQuizzes = (categoryId: number) => {
    if (!quizAttempts) return 0;
    return quizAttempts.filter(attempt => attempt.categoryId === categoryId).length;
  };

  // Get user rank from the user object
  const userRank = user?.rank || 0;

  // Sort achievements by unlock date (most recent first)
  const recentAchievements = achievements?.slice(0, 4).sort(
    (a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.section 
          className="bg-gradient-to-br from-primary/10 to-background rounded-2xl p-6 md:p-10 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <h1 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl mb-4 text-text">
                Test Your Knowledge with <span className="text-primary">QuizMaster</span>
              </h1>
              <p className="text-lg mb-6 text-text/80">
                Challenge yourself with quizzes across Science, History, Pop Culture, Geography, and Technology.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/20"
                  onClick={() => {
                    playSoundEffect("buttonClick");
                    window.location.href = "/categories";
                  }}
                >
                  Start a Quiz
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    playSoundEffect("buttonClick");
                    window.location.href = "/categories";
                  }}
                >
                  View Categories
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <svg className="w-full max-w-md" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
                <rect x="150" y="50" width="300" height="300" rx="20" fill="#F8F9FB" stroke="#6C63FF" strokeWidth="3"/>
                <circle cx="300" cy="150" r="70" fill="#6C63FF" opacity="0.1"/>
                <path d="M280 150 L320 150 L300 180 Z" fill="#6C63FF"/>
                <circle cx="230" cy="250" r="40" fill="#FF6B6B" opacity="0.2"/>
                <circle cx="370" cy="250" r="40" fill="#4ECB71" opacity="0.2"/>
                <path d="M220 250 L240 250 L230 270 Z" fill="#FF6B6B"/>
                <path d="M360 250 L380 250 L370 270 Z" fill="#4ECB71"/>
                <rect x="270" y="240" width="60" height="20" rx="5" fill="#6C63FF" opacity="0.5"/>
              </svg>
            </div>
          </div>
        </motion.section>

        {/* Quick Stats */}
        <motion.section 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-white p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text/60 font-medium">Your Rank</p>
                <h3 className="font-poppins font-bold text-2xl mt-1 text-text">#{userRank}</h3>
              </div>
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                <Medal className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-text/60">
                {userRank <= 10 ? "Top player" : userRank <= 50 ? "Top 5% of all players" : "Keep going!"}
              </p>
            </div>
          </Card>
          
          <Card className="bg-white p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text/60 font-medium">Completed Quizzes</p>
                <h3 className="font-poppins font-bold text-2xl mt-1 text-text">{completedCount?.count || 0}</h3>
              </div>
              <div className="bg-secondary/10 w-12 h-12 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-secondary" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-secondary h-2 rounded-full" 
                  style={{ width: `${Math.min((completedCount?.count || 0) / 50 * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-text/60 mt-1">
                {Math.round((completedCount?.count || 0) / 50 * 100)}% completion rate
              </p>
            </div>
          </Card>
          
          <Card className="bg-white p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text/60 font-medium">Achievements</p>
                <h3 className="font-poppins font-bold text-2xl mt-1 text-text">
                  {achievements?.length || 0}/10
                </h3>
              </div>
              <div className="bg-accent/10 w-12 h-12 rounded-full flex items-center justify-center">
                <Award className="h-5 w-5 text-accent" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-text/60">
                Latest: <span className="font-medium">
                  {achievements && achievements.length > 0 
                   ? achievements[0].name 
                   : "None yet"}
                </span>
              </p>
            </div>
          </Card>
        </motion.section>

        {/* Categories */}
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-poppins font-bold text-2xl text-text">Quiz Categories</h2>
            <Link href="/categories">
              <a 
                className="text-primary font-medium hover:underline flex items-center"
                onClick={() => playSoundEffect("buttonClick")}
              >
                View all 
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories?.map(category => (
              <CategoryCard 
                key={category.id}
                category={category}
                completedQuizzes={getCategoryCompletedQuizzes(category.id)}
                totalQuizzes={10}
              />
            ))}
          </div>
        </motion.section>

        {/* Leaderboard Preview */}
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-poppins font-bold text-2xl text-text">Leaderboard</h2>
            <Link href="/leaderboard">
              <a 
                className="text-primary font-medium hover:underline flex items-center"
                onClick={() => playSoundEffect("buttonClick")}
              >
                Full leaderboard 
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
            </Link>
          </div>
          
          <Card className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-poppins font-semibold text-lg">Top Players This Week</h3>
                <div className="flex gap-2">
                  <Button variant="default" size="sm">Weekly</Button>
                  <Button variant="ghost" size="sm">Monthly</Button>
                  <Button variant="ghost" size="sm">All-time</Button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-6 text-left text-xs font-medium text-text/60 uppercase tracking-wider">Rank</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-text/60 uppercase tracking-wider">Player</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-text/60 uppercase tracking-wider">Score</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-text/60 uppercase tracking-wider">Quizzes</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-text/60 uppercase tracking-wider">Achievements</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers?.slice(0, 3).map((topUser, index) => (
                    <tr key={topUser.id} className="border-b border-gray-100">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full ${
                            index === 0 ? "bg-primary" : 
                            index === 1 ? "bg-secondary" : "bg-accent"
                          } text-white flex items-center justify-center font-medium`}>
                            {index + 1}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                            <span className="font-bold">{topUser.displayName?.[0] || topUser.username[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="font-medium">{topUser.displayName || topUser.username}</div>
                            <div className="text-xs text-text/60">{topUser.profileTitle || "Quiz Enthusiast"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold">{topUser.score.toLocaleString()}</div>
                      </td>
                      <td className="py-4 px-6">
                        {/* This would need a separate endpoint or calculation */}
                        {Math.floor(Math.random() * 20) + 10}
                      </td>
                      <td className="py-4 px-6">
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
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                            +5
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Current user row */}
                  {user && (
                    <tr className="bg-primary/5 border-b border-gray-100">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                            {userRank}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center text-primary mr-3 font-bold">
                            {user.displayName?.[0] || user.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold">{user.displayName || user.username}</div>
                            <div className="text-xs text-text/60">{user.profileTitle || "Quiz Enthusiast"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold">{user.score.toLocaleString()}</div>
                      </td>
                      <td className="py-4 px-6">{completedCount?.count || 0}</td>
                      <td className="py-4 px-6">
                        <div className="flex -space-x-1">
                          {achievements && achievements.length > 0 ? (
                            <>
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                </svg>
                              </div>
                              {achievements.length > 1 && (
                                <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                  </svg>
                                </div>
                              )}
                              {achievements.length > 2 && (
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                  +{achievements.length - 2}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                              0
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.section>

        {/* Achievements Preview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-poppins font-bold text-2xl text-text">Recent Achievements</h2>
            <Link href="/achievements">
              <a 
                className="text-primary font-medium hover:underline flex items-center"
                onClick={() => playSoundEffect("buttonClick")}
              >
                All achievements 
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentAchievements?.map(achievement => (
              <AchievementCard 
                key={achievement.id}
                achievement={{
                  ...achievement,
                  unlocked: true,
                }}
              />
            ))}

            {/* Show achievement to unlock if user has less than 4 achievements */}
            {achievements && achievements.length < 4 && (
              <AchievementCard 
                achievement={{
                  id: 0,
                  name: "Perfect Score",
                  description: "Get 100% on any quiz",
                  icon: "trophy",
                  requirement: "perfect_score",
                  unlocked: false,
                  progress: 0,
                  total: 1
                }}
              />
            )}
          </div>
        </motion.section>
      </main>
      
      <Footer />
    </div>
  );
}
