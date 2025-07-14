import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import QuizHeader from "@/components/quiz/quiz-header";
import QuizOption from "@/components/quiz/quiz-option";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, X } from "lucide-react";
import { playSoundEffect } from "@/lib/sounds";
import { queryClient } from "@/lib/queryClient";

type QuizParams = {
  categoryId: string;
};

export default function QuizPage() {
  const { user } = useAuth();
  const { categoryId } = useParams<QuizParams>();
  const [, navigate] = useLocation();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: number; selectedOptionId: number; correct: boolean }[]>([]);
  const [quizStartTime, setQuizStartTime] = useState<Date>(new Date());
  const [timeRemaining, setTimeRemaining] = useState("10:00");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [quizEnded, setQuizEnded] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  
  // Fetch the quiz for the specified category
  const { data: quiz, isLoading } = useQuery({
    queryKey: [`/api/quizzes/${categoryId}`, { count: 10 }],
    enabled: !!user && !!categoryId,
  });

  // Start the timer when the quiz loads
  useEffect(() => {
    if (quiz) {
      setQuizStartTime(new Date());
      
      // Set up the timer
      const timerInterval = setInterval(() => {
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - quizStartTime.getTime()) / 1000);
        setTimeElapsed(elapsedSeconds);
        
        // Format the time remaining (10 minutes max)
        const remainingSeconds = Math.max(0, 600 - elapsedSeconds);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        
        // End quiz if time runs out
        if (remainingSeconds <= 0) {
          clearInterval(timerInterval);
          handleQuizEnd();
        }
      }, 1000);
      
      return () => clearInterval(timerInterval);
    }
  }, [quiz, quizStartTime]);

  // Submit quiz attempt when finished
  const submitQuizMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit quiz results');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/quiz-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/completed-quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/achievements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      // Navigate to results page
      navigate(`/results/${data.quizAttempt.id}`);
    }
  });

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  
  const handleOptionSelect = (optionId: number) => {
    if (showFeedback || quizEnded) return;
    
    setSelectedOptionId(optionId);
    
    // For immediate feedback
    const selectedOption = currentQuestion?.options.find(option => option.id === optionId);
    const isCorrect = selectedOption?.isCorrect || false;
    
    // Play sound based on correctness
    playSoundEffect(isCorrect ? "correct" : "incorrect");
    
    setShowFeedback(true);
    setFeedbackVisible(true);
  };

  const handleNextQuestion = useCallback(() => {
    if (!currentQuestion || !selectedOptionId) return;
    
    // Record the answer
    const selectedOption = currentQuestion.options.find(option => option.id === selectedOptionId);
    const isCorrect = selectedOption?.isCorrect || false;
    
    setAnswers(prev => [
      ...prev, 
      { 
        questionId: currentQuestion.id, 
        selectedOptionId, 
        correct: isCorrect 
      }
    ]);
    
    setShowFeedback(false);
    setSelectedOptionId(null);
    setFeedbackVisible(false);
    
    // Check if this was the last question
    if (currentQuestionIndex === (quiz?.questions.length || 0) - 1) {
      handleQuizEnd();
    } else {
      // Move to the next question
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestion, selectedOptionId, currentQuestionIndex, quiz?.questions.length]);

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      
      // Retrieve the previous answer if it exists
      const prevAnswer = answers.find(a => a.questionId === quiz?.questions[currentQuestionIndex - 1].id);
      if (prevAnswer) {
        setSelectedOptionId(prevAnswer.selectedOptionId);
      } else {
        setSelectedOptionId(null);
      }
      
      setShowFeedback(false);
    }
  };

  const handleQuizEnd = () => {
    setQuizEnded(true);
    
    // Calculate results
    const correctAnswers = answers.filter(a => a.correct).length;
    
    // Calculate score (base points + time bonus)
    const basePoints = correctAnswers * 100;
    const timeBonus = Math.max(0, 600 - timeElapsed) * 0.5; // 0.5 points per second left
    const totalScore = Math.round(basePoints + timeBonus);
    
    // Submit the quiz results
    submitQuizMutation.mutate({
      categoryId: parseInt(categoryId),
      score: totalScore,
      correctAnswers,
      totalQuestions: quiz?.questions.length || 0,
      timeTaken: timeElapsed
    });
  };

  // Get the difficulty of the current question
  const getCurrentDifficulty = () => {
    return currentQuestion?.difficulty || "normal";
  };

  if (isLoading || !quiz) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading quiz...</span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Quiz Header */}
        <QuizHeader 
          category={quiz.category}
          quizTitle={`${quiz.category.name} Quiz`}
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={quiz.questions.length}
          timeRemaining={timeRemaining}
          difficulty={getCurrentDifficulty()}
        />
        
        {/* Quiz Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white p-8 shadow-md mb-6">
              <CardContent className="p-0">
                <h2 className="font-poppins font-semibold text-xl mb-6 text-text">
                  {currentQuestion?.text}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion?.options.map((option, index) => (
                    <QuizOption
                      key={option.id}
                      option={option}
                      index={index}
                      selected={selectedOptionId === option.id}
                      disabled={showFeedback && selectedOptionId !== option.id}
                      showCorrect={showFeedback}
                      onSelect={() => handleOptionSelect(option.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
        
        {/* Quiz Controls */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0 || showFeedback}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <Button
            className="flex items-center gap-2 shadow-lg shadow-primary/20"
            onClick={handleNextQuestion}
            disabled={!selectedOptionId || submitQuizMutation.isPending}
          >
            {showFeedback ? (
              <>
                Next Question
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              currentQuestionIndex === quiz.questions.length - 1 ? (
                submitQuizMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Finish Quiz
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )
              ) : (
                <>
                  Check Answer
                  <CheckCircle2 className="h-4 w-4" />
                </>
              )
            )}
          </Button>
        </div>
        
        {/* Answer Feedback Dialog */}
        <Dialog open={feedbackVisible} onOpenChange={setFeedbackVisible}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedOptionId && currentQuestion?.options.find(o => o.id === selectedOptionId)?.isCorrect ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span>Correct!</span>
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5 text-secondary" />
                    <span>Incorrect!</span>
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {currentQuestion?.explanation || (
                  selectedOptionId && currentQuestion?.options.find(o => o.id === selectedOptionId)?.isCorrect 
                    ? "Great job! You selected the correct answer."
                    : `The correct answer was: ${currentQuestion?.options.find(o => o.isCorrect)?.text}`
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex items-center justify-between mb-2">
              <div className="text-left">
                <p className="text-text/60 text-sm">Your Score</p>
                <p className="font-poppins font-bold text-xl text-text">
                  {selectedOptionId && currentQuestion?.options.find(o => o.id === selectedOptionId)?.isCorrect ? "+100" : "+0"} points
                </p>
              </div>
              <div className="text-right">
                <p className="text-text/60 text-sm">Time Bonus</p>
                <p className="font-poppins font-bold text-xl text-accent">
                  {selectedOptionId && currentQuestion?.options.find(o => o.id === selectedOptionId)?.isCorrect 
                    ? `+${Math.round(Math.max(0, 60 - timeElapsed % 60) * 0.5)} points` 
                    : "+0 points"}
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                className="w-full" 
                onClick={handleNextQuestion}
              >
                {currentQuestionIndex === quiz.questions.length - 1 ? "Finish Quiz" : "Next Question"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
}
