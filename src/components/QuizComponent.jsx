import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, ArrowRight, RefreshCw, Trophy } from 'lucide-react';
import { toast } from 'react-hot-toast';

const QuizComponent = ({ quizData, onComplete, xpReward = 20 }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const currentQuestion = quizData[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quizData.length - 1;

    const handleAnswerSelect = (index) => {
        if (isAnswered) return;
        setSelectedAnswer(index);
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null) return;

        setIsAnswered(true);
        if (selectedAnswer === currentQuestion.correctAnswer) {
            setScore(score + 1);
            toast.success('Correct!', { icon: '🎉' });
        } else {
            toast.error('Incorrect', { icon: '❌' });
        }
    };

    const handleNextQuestion = () => {
        if (isLastQuestion) {
            setShowResult(true);
            if (onComplete) {
                const passThreshold = Math.ceil(quizData.length * 0.7);
                const passed = score >= passThreshold;
                onComplete({ score, total: quizData.length, passed, xpEarned: passed ? xpReward : 0 });
            }
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        }
    };

    const handleRetry = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setScore(0);
        setShowResult(false);
    };

    if (showResult) {
        const percentage = Math.round((score / quizData.length) * 100);
        const passed = percentage >= 70;

        return (
            <div className="glass-panel-floating p-8 text-center animate-fade-in">
                <div className="mb-6 flex justify-center">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${passed ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-red-500/20 border-red-500 text-red-500'}`}>
                        {passed ? <Trophy size={48} /> : <AlertCircle size={48} />}
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {passed ? 'Quiz Completed!' : 'Keep Practicing'}
                </h2>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    You scored <span className={`font-bold ${passed ? 'text-green-500' : 'text-red-500'}`}>{percentage}%</span> ({score}/{quizData.length})
                </p>

                {passed && (
                    <div className="mb-8 p-4 bg-[#B4833D]/10 border border-[#B4833D]/20 rounded-xl inline-block">
                        <p className="text-[#B4833D] font-bold flex items-center gap-2">
                            <span className="text-xl">+ {xpReward} XP</span>
                            <span className="text-sm font-normal text-gray-600 dark:text-gray-300">Earned</span>
                        </p>
                    </div>
                )}

                <div className="flex justify-center gap-4">
                    {!passed && (
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl transition-colors font-medium"
                        >
                            <RefreshCw size={20} />
                            Try Again
                        </button>
                    )}
                    {/* Passed action is usually handled by parent (e.g. show next lesson button) */}
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel-floating p-0 overflow-hidden">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5">
                <div
                    className="bg-[#B4833D] h-1.5 transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / quizData.length) * 100}%` }}
                ></div>
            </div>

            <div className="p-6 lg:p-8">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-bold text-[#B4833D] uppercase tracking-wider">
                        Question {currentQuestionIndex + 1} of {quizData.length}
                    </span>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Score: {score}
                    </span>
                </div>

                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-8 leading-relaxed">
                    {currentQuestion.question}
                </h3>

                <div className="space-y-3 mb-8">
                    {currentQuestion.options.map((option, index) => {
                        let optionClass = "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ";

                        if (isAnswered) {
                            if (index === currentQuestion.correctAnswer) {
                                optionClass += "bg-green-500/10 border-green-500 text-green-700 dark:text-green-400";
                            } else if (index === selectedAnswer) {
                                optionClass += "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400";
                            } else {
                                optionClass += "bg-transparent border-gray-200 dark:border-gray-700 text-gray-500 opacity-60";
                            }
                        } else {
                            if (index === selectedAnswer) {
                                optionClass += "bg-[#B4833D]/10 border-[#B4833D] text-[#B4833D]";
                            } else {
                                optionClass += "bg-transparent border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#B4833D]/50 hover:bg-[#B4833D]/5";
                            }
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(index)}
                                disabled={isAnswered}
                                className={optionClass}
                            >
                                <span className="font-medium">{option}</span>
                                {isAnswered && index === currentQuestion.correctAnswer && (
                                    <CheckCircle size={20} className="text-green-500" />
                                )}
                                {isAnswered && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                                    <XCircle size={20} className="text-red-500" />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-end">
                    {!isAnswered ? (
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={selectedAnswer === null}
                            className="px-8 py-3 bg-[#B4833D] text-white rounded-xl font-bold shadow-lg hover:bg-[#B4833D]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                        >
                            Check Answer
                        </button>
                    ) : (
                        <button
                            onClick={handleNextQuestion}
                            className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all transform active:scale-95 flex items-center gap-2"
                        >
                            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                            <ArrowRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizComponent;
