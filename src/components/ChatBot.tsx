
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, Send, X, MessageCircle, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        content: 'Hello! I\'m your RTIRS assistant. I can help you with incident reporting, checking status, and providing support. How can I assist you today?',
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: text.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let botResponse = '';
      
      if (apiKey) {
        // Use OpenAI API if key is provided
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an RTIRS (Real-Time Incident Report System) assistant for Telangana State Government. Help citizens with reporting incidents, checking status, and providing guidance. Keep responses concise and helpful.'
              },
              {
                role: 'user',
                content: text
              }
            ],
            max_tokens: 200,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          botResponse = data.choices?.[0]?.message?.content || 'I apologize, but I cannot provide a response at the moment.';
        } else {
          throw new Error('API request failed');
        }
      } else {
        // Fallback responses without API
        botResponse = getDefaultResponse(text);
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I\'m having trouble responding right now. Please try again or contact our helpline: 1800-425-0425',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const getDefaultResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('report') || message.includes('incident')) {
      return 'To report an incident, click on "New Report" from your dashboard. Fill in the required details and submit. For emergencies, call 100 (Police), 101 (Fire), or 108 (Ambulance).';
    } else if (message.includes('status') || message.includes('check')) {
      return 'You can check your report status by going to "My Reports" section in your dashboard. Each report shows its current status and any updates.';
    } else if (message.includes('emergency') || message.includes('help')) {
      return 'For immediate emergencies, call:\n• Police: 100\n• Fire: 101\n• Ambulance: 108\n\nFor RTIRS support: 1800-425-0425 (24/7)';
    } else if (message.includes('contact') || message.includes('support')) {
      return 'RTIRS Helpline: 1800-425-0425 (Available 24/7)\n\nYou can also visit your nearest government office for assistance.';
    } else {
      return 'I\'m here to help with incident reporting and system guidance. You can ask me about:\n• How to report incidents\n• Checking report status\n• Emergency contacts\n• System features';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const quickQuestions = [
    'How do I report an incident?',
    'Check my report status',
    'Emergency contact information',
    'Technical support'
  ];

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className={`fixed ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'} z-50`}>
          <Button
            onClick={() => setIsOpen(true)}
            className={`${isMobile ? 'h-12 w-12' : 'h-14 w-14'} rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg animate-pulse`}
            size="sm"
          >
            <MessageCircle className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-white`} />
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed ${isMobile ? 'inset-4' : 'bottom-6 right-6 w-80 h-96'} z-50`}>
          <Card className="h-full flex flex-col shadow-2xl border-2 border-blue-200">
            <CardHeader className="bg-blue-600 text-white rounded-t-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5" />
                  <CardTitle className="text-sm font-medium">
                    RTIRS Assistant
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-blue-700 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* API Key Input (if not set) */}
              {!apiKey && (
                <div className="p-3 bg-yellow-50 border-b">
                  <p className="text-xs text-yellow-700 mb-2">
                    Optional: Enter OpenAI API key for enhanced responses
                  </p>
                  <div className="flex space-x-2">
                    <Input
                      type="password"
                      placeholder="API Key (optional)"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-xs`}>
                      {!message.isUser && (
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="h-3 w-3 text-blue-600" />
                        </div>
                      )}
                      <div
                        className={`px-3 py-2 rounded-lg ${isMobile ? 'text-xs' : 'text-sm'} ${
                          message.isUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {message.content}
                      </div>
                      {message.isUser && (
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="h-3 w-3 text-gray-600" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Quick Questions (only show initially) */}
                {messages.length === 1 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 text-center">
                      Quick questions:
                    </p>
                    {quickQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-auto py-2 px-2 text-left justify-start whitespace-normal"
                        onClick={() => sendMessage(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                )}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-3 w-3 text-blue-600" />
                      </div>
                      <div className="bg-gray-100 px-3 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-3">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 text-sm"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default ChatBot;
