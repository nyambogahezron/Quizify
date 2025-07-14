import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trophy, Award } from "lucide-react";
import { playSoundEffect } from "@/lib/sounds";
import { Category, QuizAttempt, Achievement } from "@shared/schema";

type ResultsParams = {
  quizAttemptId: string;
};

export default function ResultsPage() {
  const { user } = useAuth();
  const { quizAttemptId } = useParams<ResultsParams>();
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  
  const { data: quizAttempts } = useQuery<QuizAttempt[]>({
    queryKey: ["/api/users/me/quiz-attempts"],
    enabled: !!user,
  });
  
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: !!user,
  });
  
  const { data: achievements } = useQuery<(Achievement & { unlockedAt: Date })[]>({
    queryKey: ["/api/users/me/achievements"],
    enabled: !!user,
    onSuccess: (data) => {
      // Check for new achievements that weren't there before
      if (previousAchievements && data.length > previousAchievements.length) {
        const newOnes = data.filter(a => 
          !previousAchievements.some(pa => pa.id === a.id)
        );
        setNewAchievements(newOnes);
        
        // Play achievement sound if new achievements
        if (newOnes.length > 0) {
          playSoundEffect("achievement");
        }
      }
      
      setPreviousAchievements(data);
    }
  });
  
  // Track previous achievements to detect new ones
  const [previousAchievements, setPreviousAchievements] = useState<(Achievement & { unlockedAt: Date })[] | null>(null);
  
  // Play completion sound when component mounts
  useEffect(() => {
    playSoundEffect("levelComplete");
  }, []);
  
  // Get the current quiz attempt
  const currentAttempt = quizAttempts?.find(attempt => attempt.id === parseInt(quizAttemptId));
  
  // Get the category for the current attempt
  const category = categories?.find(cat => cat.id === currentAttempt?.categoryId);
  
  // Format the time taken (seconds to mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  
  // Calculate percentage score
  const scorePercentage = currentAttempt 
    ? Math.round((currentAttempt.correctAnswers / currentAttempt.totalQuestions) * 100) 
    : 0;
  
  if (!user || !currentAttempt || !category) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading results...</span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white p-8 shadow-md mb-6 text-center">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-10 w-10 text-primary" />
              </div>
              
              <h1 className="font-poppins font-bold text-3xl mb-2 text-text">Quiz Completed!</h1>
              <p className="text-text/70 mb-8">You've completed the {category.name} Quiz</p>
              
              <div className="flex flex-col md:flex-row justify-between mb-8 max-w-md mx-auto">
                <div className="mb-4 md:mb-0">
                  <div className="text-5xl font-poppins font-bold text-primary">
                    {currentAttempt.correctAnswers}/{currentAttempt.totalQuestions}
                  </div>
                  <p className="text-text/60">Correct Answers</p>
                </div>
                
                <div className="mb-4 md:mb-0">
                  <div className="text-5xl font-poppins font-bold text-secondary">
                    {currentAttempt.score.toLocaleString()}
                  </div>
                  <p className="text-text/60">Points Earned</p>
                </div>
                
                <div>
                  <div className="text-5xl font-poppins font-bold text-accent">
                    {formatTime(currentAttempt.timeTaken)}
                  </div>
                  <p className="text-text/60">Time Taken</p>
                </div>
              </div>
              
              {/* New Achievements Notification */}
              {newAchievements.length > 0 && (
                <motion.div 
                  className="bg-primary/5 rounded-xl p-6 mb-8"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <h2 className="font-poppins font-semibold text-lg mb-4">
                    New Achievement{newAchievements.length > 1 ? "s" : ""} Unlocked!
                  </h2>
                  
                  {newAchievements.map((achievement, idx) => (
                    <motion.div 
                      key={achievement.id}
                      className="flex items-center gap-4 justify-center"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8 + idx * 0.2, duration: 0.5 }}
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-bounce-slow">
                        <IconComponent name={achievement.icon} size={36} color="#6C63FF" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-poppins font-semibold text-lg">{achievement.name}</h3>
                        <p className="text-text/60 text-sm">{achievement.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/categories">
                  <Button 
                    className="flex-1"
                    onClick={() => playSoundEffect("buttonClick")}
                  >
                    Play Another Quiz
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => playSoundEffect("buttonClick")}
                >
                  Review Answers
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    playSoundEffect("buttonClick");
                    // This would be a share functionality in a real app
                    navigator.clipboard.writeText(`I scored ${currentAttempt.score} points in QuizMaster!`);
                    alert("Results copied to clipboard!");
                  }}
                >
                  Share Results
                </Button>
              </div>
            </Card>
            
            <Card className="bg-white p-6 shadow-md mb-6">
              <h2 className="font-poppins font-semibold text-lg mb-4">How You Compare</h2>
              <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-primary"
                  style={{ width: `${scorePercentage}%` }}
                ></div>
                <div 
                  className="absolute left-0 top-0 h-full border-r-2 border-white"
                  style={{ left: "65%" }}
                ></div>
                <div className="absolute left-0 top-0 h-full flex items-center justify-center w-full">
                  <div className="text-sm font-medium text-white">
                    You scored better than {scorePercentage > 65 ? scorePercentage : 65}% of players
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-text/60">
                <span>Average: 65%</span>
                <span>Your Score: {scorePercentage}%</span>
              </div>
            </Card>
            
            <Card className="bg-white p-6 shadow-md">
              <h2 className="font-poppins font-semibold text-lg mb-4">Suggested Next Quizzes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories
                  ?.filter(c => c.id !== category.id)
                  .slice(0, 2)
                  .map(suggestedCategory => (
                    <Link 
                      key={suggestedCategory.id} 
                      href={`/quiz/${suggestedCategory.id}`}
                    >
                      <div 
                        className="category-card bg-gray-50 rounded-xl overflow-hidden cursor-pointer p-4 flex items-center gap-3"
                        onClick={() => playSoundEffect("buttonClick")}
                      >
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${suggestedCategory.color}10` }}
                        >
                          <IconComponent 
                            name={suggestedCategory.icon} 
                            size={24} 
                            color={suggestedCategory.color}
                          />
                        </div>
                        <div>
                          <h3 className="font-poppins font-semibold text-md">{suggestedCategory.name}</h3>
                          <p className="text-text/60 text-xs">
                            {currentAttempt.difficulty === "easy" ? "Medium" : "Easy"} • 10 questions
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </Card>
          </motion.div>
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
      return <Award style={{ width: size, height: size, color }} />;
  }
}
