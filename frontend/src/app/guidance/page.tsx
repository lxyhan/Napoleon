'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Check, AlertCircle, ChevronRight } from 'lucide-react';

type Message = {
  id: number;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  isQuestion?: boolean;
}

type Conversation = {
  id: number;
  title: string;
  messages: Message[];
  isResolved: boolean;
  lastUpdated: Date;
}

const TherapyApp: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:3400/api/guidance/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3400/api/guidance/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationId: currentConversation?.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || 
          `Request failed with status ${response.status}: ${response.statusText}`
        );
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      // You might want to show this error to the user
      // setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
};

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    // Create the user message
    const newMessage: Message = {
      id: Date.now(),
      content: currentInput,
      type: 'user',
      timestamp: new Date()
    };

    // Create temp conversation if none exists
    let tempConversation: Conversation;
    if (!currentConversation) {
      tempConversation = {
        id: Date.now(),
        title: currentInput.slice(0, 50) + '...',
        messages: [newMessage],
        isResolved: false,
        lastUpdated: new Date()
      };
      setCurrentConversation(tempConversation);
      setConversations(prev => [tempConversation, ...prev]);
    } else {
      tempConversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, newMessage],
        lastUpdated: new Date()
      };
      setCurrentConversation(tempConversation);
      setConversations(prev => prev.map(conv => 
        conv.id === tempConversation.id ? tempConversation : conv
      ));
    }

    setCurrentInput('');
    
    // Send message and get response
    const response = await sendMessage(currentInput);
    if (!response) return;

    const responseMessage: Message = {
      id: Date.now() + 1,
      content: response.content,
      type: 'ai',
      isQuestion: response.isQuestion,
      timestamp: new Date()
    };

    // Update with AI response
    const updatedConversation = {
      ...tempConversation,
      messages: [...tempConversation.messages, responseMessage],
      isResolved: !response.isQuestion,
      lastUpdated: new Date()
    };

    setCurrentConversation(updatedConversation);
    setConversations(prev => prev.map(conv => 
      conv.id === updatedConversation.id ? updatedConversation : conv
    ));
};

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Conversations</h2>
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-2 rounded cursor-pointer ${
                  currentConversation?.id === conv.id 
                    ? 'bg-blue-100' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setCurrentConversation(conv)}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{conv.title}</span>
                  {conv.isResolved ? 
                    <Check className="w-4 h-4 text-green-500" /> : 
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  }
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(conv.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          {currentConversation ? (
            <div className="space-y-4">
              {currentConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg shadow ${
                    message.type === 'user' 
                      ? 'ml-12 bg-blue-50' 
                      : 'mr-12 bg-white'
                  }`}
                >
                  <div className="font-semibold mb-1">
                    {message.type === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  <div>{message.content}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Start a new conversation
            </div>
          )}
        </div>

        {/* Input Area */}
        {(!currentConversation?.isResolved) && (
          <div className="p-4 border-t bg-white">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Describe your situation or concern..."
                className="flex-1 p-2 border rounded"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                disabled={isLoading || !currentInput.trim()}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapyApp;