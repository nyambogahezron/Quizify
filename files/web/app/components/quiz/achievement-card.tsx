import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import type { Achievement } from "@shared/schema";

type AchievementCardProps = {
  achievement: Achievement & { 
    unlocked?: boolean;
    progress?: number;
    total?: number;
    unlockedAt?: Date;
  };
};

export default function AchievementCard({ achievement }: AchievementCardProps) {
  const {
    name,
    description,
    icon,
    unlocked = false,
    progress = 0,
    total = 1,
    unlockedAt
  } = achievement;
  
  // Calculate progress percentage
  const progressPercentage = Math.min(Math.round((progress / total) * 100), 100);
  
  // Format relative time for achievement unlock
  const formatRelativeTime = (date?: Date) => {
    if (!date) return "";
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    return `${days} days ago`;
  };
  
  return (
    <motion.div 
      className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition cursor-pointer"
      whileHover={{ y: -3 }}
    >
      <div className="flex items-center gap-4">
        <div 
          className={`w-16 h-16 rounded-full ${unlocked ? 'bg-primary/10' : 'bg-gray-100'} flex items-center justify-center`}
        >
          <IconComponent 
            name={icon} 
            size={36} 
            color={unlocked ? '#6C63FF' : '#94A3B8'} 
          />
        </div>
        <div>
          <h3 className="font-poppins font-semibold text-lg">{name}</h3>
          <p className="text-text/60 text-sm">{description}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        {unlocked ? (
          <div className="flex justify-between items-center">
            <span className="text-accent text-sm font-medium">Completed</span>
            <span className="text-text/60 text-sm">
              {formatRelativeTime(unlockedAt)}
            </span>
          </div>
        ) : (
          <div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-text/60 text-xs mt-1">
              {progress}/{total} {getProgressText(achievement.requirement)}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Helper function to get user-friendly progress text based on requirement
function getProgressText(requirement: string): string {
  switch (requirement) {
    case 'complete_5_science_quizzes':
      return 'Science quizzes completed';
    case 'complete_5_history_quizzes':
      return 'History quizzes completed';
    case 'complete_5_pop_culture_quizzes':
      return 'Pop Culture quizzes completed';
    case 'complete_5_geography_quizzes':
      return 'Geography quizzes completed';
    case 'complete_5_technology_quizzes':
      return 'Technology quizzes completed';
    case 'perfect_score':
      return 'quizzes with 75%+ score';
    case 'complete_10_quizzes':
    case 'complete_25_quizzes':
      return 'quizzes completed';
    case 'score_1000_points':
    case 'score_5000_points':
      return 'points earned';
    default:
      return 'progress';
  }
}

// Helper component to render icons
function IconComponent({ name, size = 24, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  // Map achievement icon names to Remix icons
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
