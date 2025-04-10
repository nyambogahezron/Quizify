import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { playSoundEffect } from "@/lib/sounds";
import type { Category } from "@shared/schema";

type CategoryCardProps = {
  category: Category;
  completedQuizzes: number;
  totalQuizzes: number;
};

export default function CategoryCard({ category, completedQuizzes, totalQuizzes }: CategoryCardProps) {
  const remainingQuizzes = totalQuizzes - completedQuizzes;
  
  return (
    <motion.div 
      className="category-card bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition duration-300 cursor-pointer"
      whileHover={{ y: -5 }}
    >
      <div 
        className="h-32 flex items-center justify-center"
        style={{ backgroundColor: `${category.color}10` }} // Using color with 10% opacity
      >
        <IconComponent name={category.icon} size={48} color={category.color} />
      </div>
      <div className="p-4">
        <h3 className="font-poppins font-semibold text-lg mb-1">{category.name}</h3>
        <p className="text-text/60 text-sm">{totalQuizzes} quizzes</p>
        <div className="mt-3 flex justify-between items-center">
          <div className="flex">
            {completedQuizzes > 0 && (
              <>
                {[...Array(Math.min(completedQuizzes, 2))].map((_, i) => (
                  <div 
                    key={i}
                    className={`w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent ${i > 0 ? '-ml-1' : ''}`}
                  >
                    <CheckCircle className="h-3 w-3" />
                  </div>
                ))}
                {remainingQuizzes > 0 && (
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 -ml-1">
                    <span className="text-xs">+{remainingQuizzes}</span>
                  </div>
                )}
              </>
            )}
            {completedQuizzes === 0 && (
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <span className="text-xs">+{totalQuizzes}</span>
              </div>
            )}
          </div>
          <Link href={`/quiz/${category.id}`}>
            <Button 
              variant="link" 
              className="text-primary hover:underline text-sm font-medium p-0"
              onClick={() => playSoundEffect("buttonClick")}
            >
              Play
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// Helper component to render icons
function IconComponent({ name, size = 24, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  // Map category icon names to Lucide React icon components
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
