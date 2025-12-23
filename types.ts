
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  questions: Question[];
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  isThinking?: boolean;
}

export type AppView = 'home' | 'create-quiz' | 'play-quiz' | 'image-studio' | 'chat';
