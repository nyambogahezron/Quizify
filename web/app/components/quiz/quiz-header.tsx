import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@shared/schema";

type QuizHeaderProps = {
  category: Category;
  quizTitle: string;
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: string;
  difficulty?: string;
};

export default function QuizHeader({ 
  category,
  quizTitle,
  currentQuestion,
  totalQuestions,
  timeRemaining,
  difficulty = "normal"
}: QuizHeaderProps) {
  const progress = (currentQuestion / totalQuestions) * 100;
  
  // Get icon for category
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'flask':
        return <span className="ri-flask-line"></span>;
      case 'book-open':
        return <span className="ri-book-open-line"></span>;
      case 'movie':
        return <span className="ri-movie-line"></span>;
      case 'earth':
        return <span className="ri-earth-line"></span>;
      case 'computer':
        return <span className="ri-computer-line"></span>;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="mb-6 bg-white rounded-xl p-6 shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-text/60 text-sm mb-2">
            {getCategoryIcon(category.icon)}
            <span>{category.name}</span>
            <span className="mx-2">•</span>
            <span className={cn(
              difficulty === "easy" && "text-accent",
              difficulty === "medium" && "text-primary",
              difficulty === "hard" && "text-secondary"
            )}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
          </div>
          <h1 className="font-poppins font-bold text-2xl text-text">{quizTitle}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">{timeRemaining}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-accent/10 text-accent px-3 py-1 rounded-md text-sm font-medium">
              Question <span>{currentQuestion}</span>/<span>{totalQuestions}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <Progress value={progress} className="h-2.5" />
      </div>
    </div>
  );
}
