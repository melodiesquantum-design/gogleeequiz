
import React, { useState } from 'react';
import { Quiz, Question } from '../types';

interface QuizPlayerProps {
  quiz: Quiz;
  onClose: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const question = quiz.questions[currentIdx];

  const handleOptionClick = (idx: number) => {
    if (selectedIdx !== null) return;
    
    setSelectedIdx(idx);
    const correct = idx === question.correctIndex;
    if (correct) setScore(s => s + 1);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setSelectedIdx(null);
    setShowExplanation(false);
    if (currentIdx + 1 < quiz.questions.length) {
      setCurrentIdx(i => i + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl text-center">
        <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
        <p className="text-xl mb-6">Your score: <span className="font-bold text-indigo-600">{score} / {quiz.questions.length}</span></p>
        <button 
          onClick={onClose}
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 bg-white rounded-2xl shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-semibold text-indigo-500 uppercase tracking-wider">
          Question {currentIdx + 1} of {quiz.questions.length}
        </span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mb-8">{question.text}</h3>

      <div className="space-y-4 mb-8">
        {question.options.map((option, idx) => {
          let styles = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ";
          if (selectedIdx === null) {
            styles += "border-gray-100 hover:border-indigo-300 hover:bg-indigo-50";
          } else {
            if (idx === question.correctIndex) {
              styles += "border-green-500 bg-green-50 text-green-800";
            } else if (idx === selectedIdx) {
              styles += "border-red-500 bg-red-50 text-red-800";
            } else {
              styles += "border-gray-100 opacity-50";
            }
          }

          return (
            <button
              key={idx}
              disabled={selectedIdx !== null}
              onClick={() => handleOptionClick(idx)}
              className={styles}
            >
              <div className="flex items-center">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 mr-3 font-bold text-sm">
                  {String.fromCharCode(65 + idx)}
                </span>
                {option}
              </div>
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className={`p-6 rounded-xl mb-8 animate-in fade-in slide-in-from-top-4 duration-300 ${selectedIdx === question.correctIndex ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
          <div className="flex items-start">
            <div className={`mt-1 flex-shrink-0 ${selectedIdx === question.correctIndex ? 'text-green-500' : 'text-orange-500'}`}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
            </div>
            <div className="ml-3">
              <h4 className="font-bold text-gray-900 mb-1">
                {selectedIdx === question.correctIndex ? 'Correct!' : 'Actually...'}
              </h4>
              <p className="text-gray-700">{question.explanation}</p>
            </div>
          </div>
          <button 
            onClick={handleNext}
            className="mt-6 w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-black transition shadow-lg"
          >
            {currentIdx + 1 === quiz.questions.length ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
};
