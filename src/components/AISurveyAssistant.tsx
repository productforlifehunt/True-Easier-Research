import React, { useState, useRef, useEffect } from 'react';
import { X, Copy, Send, Sparkles, CheckCircle, Mic } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../hooks/useLanguage';
import toast from 'react-hot-toast';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

interface AISurveyAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  question?: string;
  currentAnswer?: string;
  onCopyAnswer: (answer: string) => void;
  onAiResponse?: (response: string) => void;
}

export const AISurveyAssistant: React.FC<AISurveyAssistantProps> = ({
  isOpen,
  onClose,
  question,
  currentAnswer,
  onCopyAnswer,
  onAiResponse
}) => {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [waveAnimation, setWaveAnimation] = useState(0);
  const [lastAiResponse, setLastAiResponse] = useState<string>('');
  const [isCopyButtonCopied, setIsCopyButtonCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const waveAnimationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const introMessage: Message = {
        role: 'assistant',
        content: `Hello! I'm your Survey AI Assistant, and I'm here to help you! 👋

I can help you with:

• **Explaining the question** - Help you understand what the question is asking
• **Improving your answer** - Make it clearer and more detailed
• **Correcting typos** - Fix spelling and grammar mistakes
• **Elaborating** - Add more depth and context to your answer
• **Shortening** - Make your answer more concise
• **General help** - Anything you need while answering this question

Your current answer: "${currentAnswer || 'No answer yet'}"

**Tip:** Use the quick action buttons below or just chat with me about anything! After I help you, use the **Copy Answer** button at the bottom to save my response.

How can I help you today?`
      };
      setMessages([introMessage]);
    }
  }, [isOpen, currentAnswer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = language === 'zh' ? 'zh-CN' : 'en-US';
      setRecognition(recognitionInstance);
    }
  }, [language]);

  // Continuous wave animation while recording
  useEffect(() => {
    let animationId: number | null = null;
    
    if (isRecording) {
      const animate = () => {
        setWaveAnimation(prev => prev + 1);
        animationId = requestAnimationFrame(animate);
      };
      animationId = requestAnimationFrame(animate);
      waveAnimationRef.current = animationId;
    } else {
      setWaveAnimation(0);
      setAudioLevel(0);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (waveAnimationRef.current) {
        cancelAnimationFrame(waveAnimationRef.current);
        waveAnimationRef.current = null;
      }
    };
  }, [isRecording]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-survey-support', {
        body: {
          messages: [...messages, userMessage],
          question,
          currentAnswer
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Track last AI response for copy button
      setLastAiResponse(data.response);
      
      // Notify parent component of AI response
      if (onAiResponse) {
        onAiResponse(data.response);
      }
    } catch (error: any) {
      console.error('AI request failed:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleCopyToAnswer = (text: string) => {
    onCopyAnswer(text);
    handleCopy(text);
  };

  const handleCopyLastResponse = async () => {
    if (lastAiResponse) {
      try {
        await navigator.clipboard.writeText(lastAiResponse);
        setIsCopyButtonCopied(true);
        setTimeout(() => setIsCopyButtonCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  };

  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const detectVolume = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const normalizedLevel = Math.min(average / 128, 1);
        setAudioLevel(normalizedLevel);
        
        animationFrameRef.current = requestAnimationFrame(detectVolume);
      };
      
      detectVolume();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const handleVoiceInput = () => {
    if (!recognition) {
      toast.error('Speech recognition is not supported in your browser. Please use Chrome or Safari.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      stopAudioAnalysis();
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    startAudioAnalysis();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
      stopAudioAnalysis();
      setIsRecording(false);
    };

    recognition.onerror = () => {
      stopAudioAnalysis();
      setIsRecording(false);
    };

    recognition.onend = () => {
      stopAudioAnalysis();
      setIsRecording(false);
    };

    recognition.start();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ 
          width: '100%',
          maxWidth: '600px',
          height: '80vh',
          maxHeight: '700px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--border-light)' }}
        >
          <div className="flex items-center gap-2">
            <Sparkles style={{ color: 'var(--color-green)', width: '24px', height: '24px' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              AI Survey Assistant
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Question Context */}
        {question && (
          <div 
            className="p-3 border-b"
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-light)'
            }}
          >
            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              Question:
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {question}
            </div>
          </div>
        )}

        {/* Messages */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          {messages.map((message, index) => (
            <React.Fragment key={index}>
              <div
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
              <div
                className="max-w-[80%] rounded-2xl px-4 py-3 relative group"
                style={{
                  backgroundColor: message.role === 'user' ? 'var(--color-green)' : 'var(--bg-secondary)',
                  color: message.role === 'user' ? 'white' : 'var(--text-primary)'
                }}
              >
                <div className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </div>
                {message.role === 'assistant' && message.content.length > 50 && (
                  <button
                    onClick={() => handleCopyToAnswer(message.content)}
                    className="absolute -top-2 -right-2 p-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: 'var(--color-green)', color: 'white' }}
                    title="Copy to answer field"
                  >
                    {copiedText === message.content ? (
                      <CheckCircle style={{ width: '14px', height: '14px' }} />
                    ) : (
                      <Copy style={{ width: '14px', height: '14px' }} />
                    )}
                  </button>
                )}
              </div>
              </div>
              
              {/* Conversation Starters - Only show after intro message */}
              {index === 0 && message.role === 'assistant' && messages.length === 1 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => {
                      setInput('Can you explain what this question is asking?');
                      setTimeout(() => sendMessage(), 100);
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    ❓ Explain Question
                  </button>
                  <button
                    onClick={() => {
                      setInput('Help me improve this answer');
                      setTimeout(() => sendMessage(), 100);
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    ✨ Improve
                  </button>
                  <button
                    onClick={() => {
                      setInput('Fix any typos or grammar mistakes');
                      setTimeout(() => sendMessage(), 100);
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    ✓ Correct
                  </button>
                  <button
                    onClick={() => {
                      setInput('Make this more detailed and elaborate');
                      setTimeout(() => sendMessage(), 100);
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    📝 Elaborate
                  </button>
                  <button
                    onClick={() => {
                      setInput('Make this shorter and more concise');
                      setTimeout(() => sendMessage(), 100);
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    ✂️ Shorten
                  </button>
                  <button
                    onClick={() => {
                      setInput('I need help with this question');
                      setTimeout(() => sendMessage(), 100);
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    💬 Help
                  </button>
                </div>
              )}
            </React.Fragment>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div
                className="max-w-[80%] rounded-2xl px-4 py-3"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)'
                }}
              >
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-green)', animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-green)', animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-green)', animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div 
          className="p-4 border-t"
          style={{ borderColor: 'var(--border-light)' }}
        >
          <div className="flex gap-2">
            <button
              onClick={handleVoiceInput}
              disabled={isLoading}
              className="px-3 py-3 rounded-xl transition-all disabled:opacity-50"
              style={{
                backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)',
                color: isRecording ? 'white' : 'var(--text-secondary)'
              }}
              title="Voice input"
            >
              <Mic style={{ width: '20px', height: '20px' }} />
            </button>
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your message... (Press Enter to send)"
                className="w-full resize-none rounded-xl px-4 py-3 border focus:outline-none focus:ring-2"
                style={{
                  borderColor: 'var(--border-light)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  minHeight: '56px',
                  maxHeight: '120px'
                }}
                rows={1}
              />
              {isRecording && (
                <div 
                  className="absolute inset-0 pointer-events-none rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center" style={{ gap: '4px', height: '40px' }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                        const animationTime = waveAnimation * 0.02;
                        const phase = animationTime + (i * 0.7);
                        const waveHeight = (Math.sin(phase) + 1) / 2; // 0 to 1
                        const barHeight = 10 + (waveHeight * 25) + (audioLevel * 10);
                        
                        return (
                          <div
                            key={i}
                            style={{
                              width: '4px',
                              height: `${Math.min(40, barHeight)}px`,
                              backgroundColor: '#dc2626',
                              borderRadius: '2px',
                              transition: 'none'
                            }}
                          />
                        );
                      })}
                    </div>
                    <span style={{ marginLeft: '12px', color: '#dc2626', fontSize: '14px', fontWeight: '500' }}>
                      Recording...
                    </span>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleCopyLastResponse}
              disabled={!lastAiResponse}
              className="px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
              style={{
                backgroundColor: lastAiResponse ? 'var(--color-green)' : 'var(--bg-secondary)',
                color: lastAiResponse ? 'white' : 'var(--text-secondary)'
              }}
              title="Copy last AI response"
            >
              {isCopyButtonCopied ? (
                <CheckCircle style={{ width: '20px', height: '20px' }} />
              ) : (
                <Copy style={{ width: '20px', height: '20px' }} />
              )}
            </button>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
              style={{
                backgroundColor: 'var(--color-green)',
                color: 'white'
              }}
            >
              <Send style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
