import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CategoryCard from "@/components/quiz/category-card";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { playSoundEffect } from "@/lib/sounds";
import { Category, QuizAttempt } from "@shared/schema";

export default function CategoriesPage() {
  const { user } = useAuth();

  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: !!user,
  });

  const { data: quizAttempts } = useQuery<QuizAttempt[]>({
    queryKey: ["/api/users/me/quiz-attempts"],
    enabled: !!user,
  });

  // Calculate category completion stats
  const getCategoryCompletedQuizzes = (categoryId: number) => {
    if (!quizAttempts) return 0;
    return quizAttempts.filter(attempt => attempt.categoryId === categoryId).length;
  };

  // Get category by ID
  const getCategoryById = (categoryId: number) => {
    return categories?.find(category => category.id === categoryId);
  };

  // Get recent attempts
  const recentAttempts = quizAttempts?.slice(0, 5).sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  if (loadingCategories) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading categories...</span>
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
          <h1 className="font-poppins font-bold text-3xl mb-2 text-text">Quiz Categories</h1>
          <p className="text-text/70">
            Choose from a variety of categories to test your knowledge and earn achievements
          </p>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Categories</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories?.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <CategoryCard
                    category={category}
                    completedQuizzes={getCategoryCompletedQuizzes(category.id)}
                    totalQuizzes={10}
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="popular" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories?.slice(0, 3).map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <CategoryCard
                    category={category}
                    completedQuizzes={getCategoryCompletedQuizzes(category.id)}
                    totalQuizzes={10}
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="recent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recently Played Categories</CardTitle>
                <CardDescription>Your most recent quiz attempts</CardDescription>
              </CardHeader>
              <CardContent>
                {recentAttempts && recentAttempts.length > 0 ? (
                  <div className="space-y-4">
                    {recentAttempts.map((attempt) => {
                      const category = getCategoryById(attempt.categoryId);
                      if (!category) return null;
                      
                      return (
                        <motion.div 
                          key={attempt.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition"
                        >
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}10` }}
                          >
                            <IconComponent name={category.icon} size={24} color={category.color} />
                          </div>
                          
                          <div className="flex-grow">
                            <h3 className="font-medium text-text">{category.name} Quiz</h3>
                            <p className="text-text/60 text-sm">
                              {new Date(attempt.completedAt).toLocaleDateString()} • 
                              Score: {attempt.score} pts • 
                              {attempt.correctAnswers}/{attempt.totalQuestions} correct
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              attempt.correctAnswers / attempt.totalQuestions >= 0.8 
                                ? "bg-accent/10 text-accent" 
                                : attempt.correctAnswers / attempt.totalQuestions >= 0.5
                                ? "bg-primary/10 text-primary"
                                : "bg-secondary/10 text-secondary"
                            }`}>
                              {Math.round(attempt.correctAnswers / attempt.totalQuestions * 100)}%
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-text/60 text-center py-4">
                    You haven't played any quizzes yet. Start a quiz to see your recent activity!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories?.filter(category => getCategoryCompletedQuizzes(category.id) > 0).map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <CategoryCard
                    category={category}
                    completedQuizzes={getCategoryCompletedQuizzes(category.id)}
                    totalQuizzes={10}
                  />
                </motion.div>
              ))}
              
              {categories?.filter(category => getCategoryCompletedQuizzes(category.id) > 0).length === 0 && (
                <div className="col-span-full text-center py-8">
                  <h3 className="font-poppins font-semibold text-lg mb-2">No Completed Categories Yet</h3>
                  <p className="text-text/60">
                    Start a quiz to see your completed categories here!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}

// Helper component to render icons
function IconComponent({ name, size = 24, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  // Map category icon names to Remix icons
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
    default:
      return <span className="ri-question-mark-line" style={{ fontSize: size, color }}></span>;
  }
}
