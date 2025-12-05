import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, Plus, MessageSquare, Trash2, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  lastUpdated: Date;
}

const MAX_CHAT_SESSIONS = 20; // Maximum number of chats to keep

export function SerieLatAI() {
  const { isAuthenticated, user } = useAuth();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get user-specific storage key for chat sessions
  const getStorageKey = () => {
    if (isAuthenticated && user) {
      return `serielat_ai_chats_${user.id}`;
    }
    return null;
  };

  // Generate chat title from first user message
  const generateChatTitle = (messages: Message[]): string => {
    const firstUserMessage = messages.find(m => m.sender === 'user');
    if (firstUserMessage) {
      const text = firstUserMessage.text;
      return text.length > 30 ? text.substring(0, 30) + '...' : text;
    }
    return 'New Chat';
  };

  // Load chat sessions from localStorage
  useEffect(() => {
    if (isAuthenticated && user) {
      const storageKey = getStorageKey();
      if (!storageKey) return;
      
      const savedSessions = localStorage.getItem(storageKey);
      if (savedSessions) {
        try {
          const parsed = JSON.parse(savedSessions);
          const sessionsWithDates = parsed.map((session: any) => ({
            ...session,
            createdAt: new Date(session.createdAt),
            lastUpdated: new Date(session.lastUpdated),
            messages: session.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          setChatSessions(sessionsWithDates);
          
          // Load the most recent chat
          if (sessionsWithDates.length > 0) {
            const latestChat = sessionsWithDates[0];
            setCurrentChatId(latestChat.id);
            setMessages(latestChat.messages);
          } else {
            startNewChat();
          }
          return;
        } catch (error) {
          console.error('Error loading chat sessions:', error);
        }
      }
    }
    
    // Start new chat for guest users or first-time users
    startNewChat();
  }, [isAuthenticated, user]);

  // Save current chat to sessions whenever messages change
  useEffect(() => {
    if (isAuthenticated && user && currentChatId && messages.length > 0) {
      const storageKey = getStorageKey();
      if (!storageKey) return;

      let updatedSessions = chatSessions.map(session => {
        if (session.id === currentChatId) {
          return {
            ...session,
            messages,
            title: generateChatTitle(messages),
            lastUpdated: new Date()
          };
        }
        return session;
      });

      // If current chat doesn't exist in sessions, add it
      if (!chatSessions.find(s => s.id === currentChatId)) {
        const newSession: ChatSession = {
          id: currentChatId,
          title: generateChatTitle(messages),
          messages,
          createdAt: new Date(),
          lastUpdated: new Date()
        };
        updatedSessions.unshift(newSession);
      }

      // Enforce maximum chat limit - keep only the most recent chats
      if (updatedSessions.length > MAX_CHAT_SESSIONS) {
        updatedSessions = updatedSessions.slice(0, MAX_CHAT_SESSIONS);
      }

      setChatSessions(updatedSessions);
      localStorage.setItem(storageKey, JSON.stringify(updatedSessions));
    }
  }, [messages, currentChatId, isAuthenticated, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userMessageText = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5678/webhook/0be72cd0-b951-4cb4-b147-a5a6c9484aa9",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatInput: userMessageText }),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.text || 'Sorry, I received an empty response.',
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Error communicating with the AI service.",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as any);
    }
  };

  const startNewChat = () => {
    const newChatId = `chat_${Date.now()}`;
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: "Hello! I'm SerieLat AI, your movie and TV series assistant. Ask me anything about movies, actors, recommendations, or anything else!",
      sender: 'ai',
      timestamp: new Date()
    };
    
    setCurrentChatId(newChatId);
    setMessages([welcomeMessage]);
  };

  const switchChat = (chatId: string) => {
    const chat = chatSessions.find(s => s.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
    }
  };

  const deleteChat = (chatId: string) => {
    const updatedSessions = chatSessions.filter(s => s.id !== chatId);
    setChatSessions(updatedSessions);
    
    if (isAuthenticated && user) {
      const storageKey = getStorageKey();
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(updatedSessions));
      }
    }

    // If deleted chat was current, switch to another or create new
    if (chatId === currentChatId) {
      if (updatedSessions.length > 0) {
        switchChat(updatedSessions[0].id);
      } else {
        startNewChat();
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-64 sm:w-72 lg:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col fixed lg:relative h-[calc(100vh-200px)] z-50 shadow-2xl lg:shadow-none"
          >
            {/* Sidebar Header */}
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3 lg:hidden">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Chat History</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <button
                onClick={() => {
                  startNewChat();
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-95 text-white font-semibold shadow-lg transition-all duration-300 group touch-manipulation"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span className="text-sm sm:text-base">New Chat</span>
              </button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-3">
              {chatSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  No chat history yet
                </div>
              ) : (
                <div className="space-y-1.5">
                  {chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group relative flex items-center gap-2 sm:gap-3 px-3 py-3 sm:py-3.5 rounded-lg cursor-pointer transition-all duration-200 touch-manipulation active:scale-98 ${
                        currentChatId === session.id
                          ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 shadow-sm'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                      onClick={() => {
                        switchChat(session.id);
                        setSidebarOpen(false);
                      }}
                    >
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                          {session.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {session.lastUpdated.toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(session.id);
                        }}
                        className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1.5 sm:p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all touch-manipulation active:scale-95"
                        title="Delete chat"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        {/* Header */}
        <motion.div 
          className="py-4 sm:py-5 lg:py-6 px-3 sm:px-4 lg:px-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 sm:p-2.5 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 active:scale-95 transition-all touch-manipulation"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
            </button>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-blue-600/30 blur-xl transition-all duration-500 rounded-full scale-150"></div>
                <div className="relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/30">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                SerieLat AI
              </h1>
            </div>
            
            <div className="w-8 sm:w-10"></div>
          </div>
        </motion.div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] lg:max-w-[75%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/30' 
                    : 'bg-gradient-to-br from-purple-600 to-purple-700 shadow-lg shadow-purple-500/30'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-md ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                }`}>
                  <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
                    {message.text}
                  </p>
                  <p className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 ${
                    message.sender === 'user' 
                      ? 'text-blue-200' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] lg:max-w-[75%]">
                <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-700 shadow-lg shadow-purple-500/30">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-spin" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={sendMessage} className="flex gap-2 sm:gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about movies, series..."
              disabled={isLoading}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 lg:py-3.5 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-95 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 sm:gap-2 group touch-manipulation"
            >
              <span className="hidden sm:inline text-sm sm:text-base">Send</span>
              <Send className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2 sm:mt-3 text-center px-2">
            <span className="hidden sm:inline">Press Enter to send • </span>Chat history saved locally
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
