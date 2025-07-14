import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { playSoundEffect } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import type { Option } from "@shared/schema";

type QuizOptionProps = {
  option: Option;
  index: number;
  selected: boolean;
  disabled: boolean;
  showCorrect: boolean;
  onSelect: () => void;
};

export default function QuizOption({ option, index, selected, disabled, showCorrect, onSelect }: QuizOptionProps) {
  const [status, setStatus] = useState<'default' | 'correct' | 'incorrect'>('default');
  
  useEffect(() => {
    if (showCorrect) {
      if (option.isCorrect) {
        setStatus('correct');
      } else if (selected && !option.isCorrect) {
        setStatus('incorrect');
      }
    } else {
      setStatus('default');
    }
  }, [showCorrect, selected, option.isCorrect]);
  
  const getOptionLetter = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };
  
  const handleClick = () => {
    if (disabled) return;
    
    playSoundEffect("buttonClick");
    onSelect();
    
    if (showCorrect) {
      playSoundEffect(option.isCorrect ? "correct" : "incorrect");
    }
  };
  
  return (
    <motion.button
      className={cn(
        "quiz-option text-left transition focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-xl p-4",
        selected 
          ? "border-2 border-primary bg-primary/5" 
          : "bg-gray-50 hover:bg-gray-100 border-2 border-gray-100",
        status === 'correct' && "border-accent bg-accent/5 correct-answer",
        status === 'incorrect' && "border-secondary bg-secondary/5 incorrect-answer",
        disabled && "opacity-60 cursor-not-allowed"
      )}
      onClick={handleClick}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-text font-medium",
          selected ? "bg-primary/20 text-primary" : "bg-gray-200",
          status === 'correct' && "bg-accent/20 text-accent",
          status === 'incorrect' && "bg-secondary/20 text-secondary"
        )}>
          {getOptionLetter(index)}
        </div>
        <span>{option.text}</span>
      </div>
    </motion.button>
  );
}
