
import React, { useState } from 'react';
import { Quiz, AppView } from './types';
import { generateQuiz } from './services/geminiService';
import { QuizPlayer } from './components/QuizPlayer';
import { ImageEditor } from './components/ImageEditor';
import { ChatBot } from './components/ChatBot';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quizTopic, setQuizTopic] = useState('');

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTopic.trim()) return;
    
    setIsLoading(true);
    try {
      const newQuiz = await generateQuiz(quizTopic);
      setQuizzes(prev => [newQuiz, ...prev]);
      setActiveQuiz(newQuiz);
      setView('play-quiz');
      setQuizTopic('');
    } catch (err) {
      alert("Failed to generate quiz. Gemini might be busy or the topic was too obscure.");
    } finally {
      setIsLoading(false);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setView('play-quiz');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">Q</div>
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">Gemini<span className="text-indigo-600">Studio</span></span>
          </div>
          <nav className="hidden md:flex space-x-1">
            <button 
              onClick={() => setView('home')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${view === 'home' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Quizzes
            </button>
            <button 
              onClick={() => setView('image-studio')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${view === 'image-studio' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Image Studio
            </button>
          </nav>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase">API Connected</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          
          {view === 'home' && (
            <div className="space-y-12">
              <section className="text-center max-w-2xl mx-auto py-12">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                  What do you want to <span className="text-indigo-600">learn</span> today?
                </h1>
                <p className="mt-4 text-lg text-gray-600">Generate high-quality quizzes with real-time accuracy using Gemini Search Grounding.</p>
                
                <form onSubmit={handleCreateQuiz} className="mt-10 relative max-w-lg mx-auto">
                  <input 
                    type="text"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    placeholder="E.g. Latest advancements in space exploration 2024"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-0 shadow-lg pr-32 transition"
                    required
                  />
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:bg-indigo-300"
                  >
                    {isLoading ? 'Wait...' : 'Generate'}
                  </button>
                </form>
              </section>

              <section className="space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <h2 className="text-2xl font-bold">Recent Quizzes</h2>
                  <span className="text-sm text-gray-500">{quizzes.length} generated</span>
                </div>
                {quizzes.length === 0 ? (
                  <div className="bg-gray-50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                    <p className="text-gray-500">Your generated quizzes will appear here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map(q => (
                      <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-100 transition group">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 font-bold">
                          {q.questions.length}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{q.title}</h3>
                        <p className="text-sm text-gray-500 mt-2 mb-6 italic">{q.topic}</p>
                        <button 
                          onClick={() => startQuiz(q)}
                          className="w-full py-3 bg-gray-50 text-indigo-600 font-bold rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition"
                        >
                          Take Quiz
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {view === 'play-quiz' && activeQuiz && (
            <div className="animate-in fade-in duration-500">
              <QuizPlayer quiz={activeQuiz} onClose={() => setView('home')} />
            </div>
          )}

          {view === 'image-studio' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ImageEditor />
            </div>
          )}

        </div>
      </main>

      {/* Floating Chat */}
      <ChatBot />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">Built with Gemini 3 Pro & Flash Image. Multimodal AI for creative learning.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
