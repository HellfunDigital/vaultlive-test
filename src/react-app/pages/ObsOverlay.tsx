import { useState, useEffect, useRef } from 'react';
import { Crown } from 'lucide-react';
import type { ChatMessage } from '@/shared/types';

interface TTSSettings {
  enabled: boolean;
  donationTTS: boolean;
  chatTTS: boolean;
  minDonationAmount: number;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}

export default function ObsOverlay() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ttsSettings, setTtsSettings] = useState<TTSSettings>({
    enabled: false, // Default to OFF
    donationTTS: true,
    chatTTS: true,
    minDonationAmount: 1,
    voice: 'default',
    rate: 1,
    pitch: 1,
    volume: 0.8,
  });
  const [processedMessageIds, setProcessedMessageIds] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load TTS settings and voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    // Load TTS settings from localStorage
    const saved = localStorage.getItem('obs-overlay-tts-settings');
    if (saved) {
      try {
        const savedSettings = JSON.parse(saved);
        setTtsSettings(savedSettings);
      } catch (error) {
        console.error('Failed to parse TTS settings:', error);
      }
    }
  }, []);

  // TTS function for chat messages
  const speakText = (text: string) => {
    if (!ttsSettings.enabled || !('speechSynthesis' in window)) return;

    console.log('OBS Overlay TTS - Speaking:', text);
    
    // Cancel any existing speech first
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply TTS settings
    if (voices.length > 0) {
      const selectedVoice = voices.find(v => v.name === ttsSettings.voice) || voices[0];
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    utterance.rate = Math.max(0.1, Math.min(10, ttsSettings.rate || 1));
    utterance.pitch = Math.max(0, Math.min(2, ttsSettings.pitch || 1));
    utterance.volume = Math.max(0, Math.min(1, ttsSettings.volume || 0.8));
    
    // Add event listeners for debugging
    utterance.onstart = () => console.log('OBS Overlay TTS - Speech started');
    utterance.onend = () => console.log('OBS Overlay TTS - Speech ended');
    utterance.onerror = (event) => console.error('OBS Overlay TTS - Speech error:', event);
    
    try {
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('OBS Overlay TTS - Speak failed:', error);
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/chat/messages');
      if (response.ok) {
        const data = await response.json();
        const recentMessages = data.slice(-50); // Keep last 50 for performance
        
        // Check for new messages and process them for TTS
        if (messages.length > 0) {
          const newMessages = recentMessages.slice(messages.length);
          
          newMessages.forEach((message: ChatMessage) => {
            if (processedMessageIds.has(message.id)) return;
            
            // Process system messages (donations, subs, level ups)
            if (message.username === 'System') {
              if (ttsSettings.donationTTS) {
                if (message.message.includes('donated $')) {
                  const donationMatch = message.message.match(/💰\s(.+?)\sdonated\s\$(\d+\.?\d*)/);
                  if (donationMatch) {
                    const donorName = donationMatch[1];
                    const amount = parseFloat(donationMatch[2]);
                    
                    if (amount >= ttsSettings.minDonationAmount) {
                      const messageMatch = message.message.match(/:\s"(.+)"/);
                      const donationMessage = messageMatch ? messageMatch[1] : '';
                      
                      let ttsText = `${donorName} donated $${amount.toFixed(2)}!`;
                      if (donationMessage) {
                        ttsText += ` Their message: ${donationMessage}`;
                      }
                      
                      setTimeout(() => speakText(ttsText), 500);
                    }
                  }
                } else if (message.message.includes('just subscribed')) {
                  const subMatch = message.message.match(/🎉\s(.+?)\sjust subscribed/);
                  if (subMatch) {
                    const subscriberName = subMatch[1];
                    setTimeout(() => speakText(`${subscriberName} just subscribed! Welcome!`), 500);
                  }
                } else if (message.message.includes('just reached Level')) {
                  const levelMatch = message.message.match(/🎉\s(.+?)\sjust reached Level\s(\d+)/);
                  if (levelMatch) {
                    const userName = levelMatch[1];
                    const level = levelMatch[2];
                    setTimeout(() => speakText(`${userName} reached Level ${level}!`), 500);
                  }
                }
              }
            }
            // Process regular chat messages when chatTTS is enabled
            else if (ttsSettings.chatTTS && 
                     message.platform === 'vaultkeeper' &&
                     message.username !== 'ShoutoutBot' && 
                     message.username !== 'PointsShop' && 
                     message.username !== 'TTSShop' &&
                     !message.message.startsWith('!') &&
                     !message.message.startsWith('/')) {
              
              // TTS for all VaultKeeper chat messages when enabled
              const ttsText = `${message.username} says: ${message.message}`;
              setTimeout(() => speakText(ttsText), 200);
            }
            
            setProcessedMessageIds(prev => new Set([...prev, message.id]));
          });
        }
        
        setMessages(recentMessages);
        setIsLoading(false);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMessages();
    
    // Set up polling interval
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);
    
    // Set loading to false after first fetch
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [messages.length, ttsSettings]);

  const renderMessageText = (text: string, messageIsSubscriber: boolean) => {
    // Convert emojis
    const freeEmojis: { [key: string]: string } = {
      ':smile:': '😊',
      ':laugh:': '😂',
      ':heart:': '❤️',
      ':thumbsup:': '👍',
      ':fire:': '🔥',
      ':party:': '🎉',
      ':gaming:': '🎮',
      ':stream:': '📺',
      ':chat:': '💬',
      ':pog:': '😮',
    };

    const premiumEmojis: { [key: string]: string } = {
      ':eyes:': '👀',
      ':skull:': '💀',
      ':thumbsdown:': '👎',
      ':clap:': '👏',
      ':rocket:': '🚀',
      ':100:': '💯',
      ':rainbow:': '🌈',
      ':star:': '⭐',
      ':diamond:': '💎',
      ':pogchamp:': '😱',
      ':kekw:': '😂',
      ':pepehands:': '😢',
      ':monkas:': '😰',
      ':5head:': '🧠',
      ':ez:': '😎',
      ':kappa:': '🐸',
      ':omegalul:': '😂',
      ':sadge:': '😢',
      ':copium:': '😤',
      ':based:': '😎',
      ':cringe:': '😬',
      ':gigachad:': '💪',
      ':pepega:': '🤪'
    };

    let processedText = text;
    
    // Always convert free emojis
    for (const [code, emoji] of Object.entries(freeEmojis)) {
      processedText = processedText.replace(new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), emoji);
    }
    
    // Only convert premium emojis for subscribers
    if (messageIsSubscriber) {
      for (const [code, emoji] of Object.entries(premiumEmojis)) {
        processedText = processedText.replace(new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), emoji);
      }
    }
    
    return processedText;
  };

  return (
    <div 
      className="w-full h-full bg-transparent text-white font-sans overflow-hidden"
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        pointerEvents: 'none'
      }}
    >
      {/* Enhanced Chat Overlay for IRL Pro */}
      <div 
        className="absolute top-2 left-2"
        style={{
          width: '400px',
          maxHeight: '600px',
          pointerEvents: 'none'
        }}
      >
        {/* Loading indicator */}
        {isLoading && messages.length === 0 && (
          <div className="bg-black/90 border border-purple-500/30 rounded-lg px-3 py-2 mb-2">
            <div className="flex items-center space-x-2 text-purple-300">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Loading Chat...</span>
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div className="space-y-1 max-h-[580px] overflow-y-auto">
          {messages.length === 0 && !isLoading ? (
            <div className="bg-black/90 border border-gray-600/30 rounded-lg px-3 py-2">
              <div className="text-center text-gray-400 text-sm">
                <p>💬 Chat overlay ready</p>
                <p className="text-xs mt-1 opacity-70">Messages will appear here</p>
              </div>
            </div>
          ) : (
            messages.slice(-15).map((message) => {
              const displayedBadges = (() => {
                try {
                  return message.displayed_badges ? JSON.parse(message.displayed_badges) : [];
                } catch {
                  return [];
                }
              })();

              // Enhanced styling for better visibility in IRL Pro
              const messageStyle = {
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 30, 0.95))',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(139, 92, 246, 0.15)'
              };

              return (
                <div 
                  key={message.id} 
                  className="rounded-lg px-3 py-2 text-sm transition-all duration-300"
                  style={messageStyle}
                >
                  <div className="flex items-start space-x-2">
                    {/* Badges and Crown */}
                    <div className="flex items-center space-x-1 flex-shrink-0 mt-0.5">
                      {displayedBadges.slice(0, 2).map((badge: string) => {
                        const getBadgeIcon = (badgeName: string) => {
                          const iconMap: { [key: string]: string } = {
                            'VIP': '⭐',
                            'Moderator': '🛡️',
                            'Supporter': '💎',
                            'OG': '👑',
                            'Verified': '✓',
                            'Artist': '🎨',
                            'DJ': '🎵',
                            'Gamer': '🎮',
                          };
                          return iconMap[badgeName] || '🏷️';
                        };

                        return (
                          <span 
                            key={badge} 
                            className="text-xs drop-shadow-lg" 
                            title={badge}
                          >
                            {getBadgeIcon(badge)}
                          </span>
                        );
                      })}
                      
                      {message.is_subscriber && (
                        <Crown className="w-3 h-3 text-purple-400 drop-shadow-lg" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      {/* Username */}
                      <span 
                        className="font-bold text-sm drop-shadow-lg"
                        style={{ 
                          color: message.name_color || (
                            message.is_subscriber ? '#c084fc' : 
                            message.platform === 'twitch' ? '#d8b4fe' :
                            message.platform === 'kick' ? '#86efac' :
                            '#d1d5db'
                          ),
                          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
                        }}
                      >
                        {message.username?.toString().replace(/\s+\d+$/, '').trim() || 'Unknown'}:
                      </span>
                      
                      {/* Message Text */}
                      <span 
                        className="text-white text-sm ml-1 drop-shadow-lg break-words"
                        style={{
                          textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)',
                          lineHeight: '1.4'
                        }}
                      >
                        {renderMessageText(message.message, !!message.is_subscriber)}
                      </span>
                    </div>

                    {/* Platform indicator */}
                    <div className="flex-shrink-0 mt-0.5">
                      {message.platform === 'twitch' && (
                        <span className="text-purple-400 text-xs">🎮</span>
                      )}
                      {message.platform === 'kick' && (
                        <span className="text-green-400 text-xs">🦵</span>
                      )}
                      {message.platform === 'vaultkeeper' && (
                        <span className="text-blue-400 text-xs">💎</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Status indicator for IRL Pro */}
        <div 
          className="mt-2 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '6px',
            padding: '4px 8px'
          }}
        >
          <span className="text-xs text-purple-300 drop-shadow-lg font-medium">
            VaultKeeper Chat Overlay • {messages.length} messages
          </span>
        </div>
      </div>
    </div>
  );
}
