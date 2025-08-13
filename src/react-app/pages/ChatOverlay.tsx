import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Crown, Volume2, VolumeX, Settings } from 'lucide-react';
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

export default function ChatOverlay() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [processedMessageIds, setProcessedMessageIds] = useState<Set<number>>(new Set());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [ttsSettings, setTtsSettings] = useState<TTSSettings>({
    enabled: false, // Start disabled, user can enable
    donationTTS: true,
    chatTTS: false,
    minDonationAmount: 1,
    voice: 'default',
    rate: 1,
    pitch: 1,
    volume: 0.8,
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load available voices and TTS settings
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      console.log('TTS Debug - Available voices:', availableVoices.length);
      setVoices(availableVoices);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    // Load TTS settings from localStorage
    const saved = localStorage.getItem('tts-settings');
    if (saved) {
      try {
        const savedSettings = JSON.parse(saved);
        setTtsSettings(savedSettings);
      } catch (error) {
        console.error('TTS Debug - Failed to parse TTS settings:', error);
      }
    }

    // Test speech synthesis availability
    if ('speechSynthesis' in window) {
      console.log('TTS Debug - Speech synthesis is available');
    } else {
      console.error('TTS Debug - Speech synthesis is NOT available');
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: TTSSettings) => {
    setTtsSettings(newSettings);
    localStorage.setItem('tts-settings', JSON.stringify(newSettings));
  };

  // TTS function for chat messages
  const speakChatMessage = (text: string) => {
    if (!('speechSynthesis' in window) || !ttsSettings.enabled) return;

    console.log('Chat Overlay TTS - Speaking:', text);
    
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
    utterance.onstart = () => console.log('Chat Overlay TTS - Speech started');
    utterance.onend = () => console.log('Chat Overlay TTS - Speech ended');
    utterance.onerror = (event) => console.error('Chat Overlay TTS - Speech error:', event);
    
    try {
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Chat Overlay TTS - Speak failed:', error);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/chat/messages');
      if (response.ok) {
        const data = await response.json();
        
        // Check for new messages and process them for TTS
        if (data.length > messages.length && ttsSettings.enabled) {
          const newMessages = data.slice(messages.length);
          
          newMessages.forEach((message: ChatMessage) => {
            if (processedMessageIds.has(message.id)) return;
            
            // Process donations and system messages
            if (message.username === 'System' && message.message.includes('donated $')) {
              if (ttsSettings.donationTTS) {
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
                    
                    setTimeout(() => speakChatMessage(ttsText), 500);
                  }
                }
              }
            }
            // Process subscription messages
            else if (message.username === 'System' && message.message.includes('just subscribed')) {
              if (ttsSettings.donationTTS) {
                const subMatch = message.message.match(/🎉\s(.+?)\sjust subscribed/);
                if (subMatch) {
                  const subscriberName = subMatch[1];
                  setTimeout(() => speakChatMessage(`${subscriberName} just subscribed! Welcome to the premium community!`), 500);
                }
              }
            }
            // Process level up messages
            else if (message.username === 'System' && message.message.includes('just reached Level')) {
              if (ttsSettings.donationTTS) {
                const levelMatch = message.message.match(/🎉\s(.+?)\sjust reached Level\s(\d+)/);
                if (levelMatch) {
                  const userName = levelMatch[1];
                  const level = levelMatch[2];
                  setTimeout(() => speakChatMessage(`${userName} just reached Level ${level}! Congratulations!`), 500);
                }
              }
            }
            // Process regular chat messages for eligible users
            else if (ttsSettings.chatTTS && 
                     message.username !== 'System' && 
                     message.username !== 'ShoutoutBot' && 
                     message.username !== 'PointsShop' && 
                     message.username !== 'TTSShop' &&
                     message.platform === 'vaultkeeper' &&
                     !message.message.startsWith('!') &&
                     !message.message.startsWith('/') &&
                     message.is_subscriber) {
              // Only speak messages from subscribers when chatTTS is enabled
              const ttsText = `${message.username} says: ${message.message}`;
              setTimeout(() => speakChatMessage(ttsText), 200);
            }
            
            setProcessedMessageIds(prev => new Set([...prev, message.id]));
          });
        }
        
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const response = await fetch('/api/stats/online-users');
      if (response.ok) {
        const data = await response.json();
        setOnlineUsers(data.onlineUsers || 0);
      }
    } catch (error) {
      console.error('Failed to fetch online users:', error);
    }
  };

  const renderMessageText = (text: string, messageIsSubscriber: boolean) => {
    // Free emojis available to all users
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

    // Premium emojis only for subscribers
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
    
    // Convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    processedText = processedText.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>');
    
    return processedText;
  };

  useEffect(() => {
    fetchMessages();
    fetchOnlineUsers();
    const interval = setInterval(() => {
      fetchMessages();
      fetchOnlineUsers();
    }, 3000); // Update every 3 seconds for overlay
    return () => clearInterval(interval);
  }, [messages.length, ttsSettings]); // Include dependencies

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Optimized for horizontal phone display */}
      <div className="flex flex-col h-screen max-w-full">
        
        {/* Ultra compact header for horizontal phone */}
        <div className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-sm px-2 py-1 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-3 h-3" />
            <span className="font-bold">VaultKeeper</span>
            <span className="text-purple-200">({onlineUsers})</span>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* TTS Status Indicator */}
            <div className="flex items-center space-x-1">
              {ttsSettings.enabled ? (
                <Volume2 className="w-3 h-3 text-green-400" />
              ) : (
                <VolumeX className="w-3 h-3 text-red-400" />
              )}
              <span className="text-xs">
                {ttsSettings.enabled ? 'TTS' : 'Mute'}
              </span>
            </div>
            
            {/* Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 hover:bg-white/10 rounded"
            >
              <Settings className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* TTS Settings Panel */}
        {showSettings && (
          <div className="bg-black/90 backdrop-blur-md border-b border-gray-600 p-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={ttsSettings.enabled}
                  onChange={(e) => saveSettings({ ...ttsSettings, enabled: e.target.checked })}
                  className="w-3 h-3"
                />
                <span>Enable TTS</span>
              </label>
              
              <label className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={ttsSettings.chatTTS}
                  onChange={(e) => saveSettings({ ...ttsSettings, chatTTS: e.target.checked })}
                  className="w-3 h-3"
                  disabled={!ttsSettings.enabled}
                />
                <span>Chat TTS</span>
              </label>
              
              <div className="flex items-center space-x-1">
                <span>Voice:</span>
                <select
                  value={ttsSettings.voice}
                  onChange={(e) => saveSettings({ ...ttsSettings, voice: e.target.value })}
                  className="bg-gray-700 text-white rounded px-1 py-0.5 text-xs flex-1"
                  disabled={!ttsSettings.enabled}
                >
                  <option value="default">Default</option>
                  {voices.slice(0, 8).map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name.split(' ')[0]}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-1">
                <span>Speed:</span>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={ttsSettings.rate}
                  onChange={(e) => saveSettings({ ...ttsSettings, rate: parseFloat(e.target.value) })}
                  className="flex-1 h-2"
                  disabled={!ttsSettings.enabled}
                />
                <span className="w-8 text-right">{ttsSettings.rate.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="text-center mt-2 text-gray-400">
              Perfect for IRL streaming with phone overlay!
            </div>
          </div>
        )}

        {/* Messages Container - Optimized for horizontal phone layout */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-1 py-1 space-y-0.5"
          style={{ scrollBehavior: 'smooth' }}
        >
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-4">
              <MessageCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Chat will appear here</p>
              <div className="mt-2 text-xs">
                <p>Also streaming on Kick & Twitch</p>
              </div>
            </div>
          ) : (
            messages.slice(-100).map((message) => { // Show last 100 messages for good performance
              // Get displayed badges with error handling
              const displayedBadges = (() => {
                try {
                  const badges = message.displayed_badges ? JSON.parse(message.displayed_badges) : 
                    (message.user_badges ? JSON.parse(message.user_badges) : []);
                  return badges.slice(0, 2); // Limit to 2 badges for compact display
                } catch (error) {
                  return [];
                }
              })();
              
              return (
                <div key={message.id} className="bg-gray-900/70 backdrop-blur-sm rounded px-2 py-1 text-xs leading-tight">
                  <div className="flex items-center space-x-1">
                    {/* Badges - ultra compact */}
                    <div className="flex items-center space-x-0.5 flex-shrink-0">
                      {displayedBadges.map((badge: string) => {
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
                          <span key={badge} className="text-xs" title={badge}>
                            {getBadgeIcon(badge)}
                          </span>
                        );
                      })}
                      
                      {message.is_subscriber && (
                        <Crown className="w-2.5 h-2.5 text-purple-400" />
                      )}
                    </div>

                    {/* Username - compact */}
                    <span 
                      className="font-semibold flex-shrink-0 max-w-20 truncate"
                      style={{ 
                        fontSize: '11px',
                        color: message.name_color || (
                          message.is_subscriber ? '#c084fc' : 
                          message.platform === 'twitch' ? '#d8b4fe' :
                          message.platform === 'kick' ? '#86efac' :
                          '#d1d5db'
                        )
                      }}
                    >
                      {message.username?.toString().replace(/\s+\d+$/, '').trim() || 'Unknown'}:
                    </span>
                    
                    {/* Message text - main content */}
                    <span 
                      className="text-white flex-1 break-words"
                      style={{ fontSize: '11px', lineHeight: '1.2' }}
                      dangerouslySetInnerHTML={{
                        __html: renderMessageText(message.message, !!message.is_subscriber)
                      }}
                    />
                    
                    {/* Timestamp - ultra compact */}
                    <span className="text-gray-500 flex-shrink-0 text-xs">
                      {new Date(message.created_at + 'Z').toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false
                      })}
                    </span>
                  </div>
                  
                  {/* Reply indicator - compact */}
                  {message.replied_to_message_id && message.replied_to_username && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500 mt-0.5 ml-4">
                      <span>↳</span>
                      <span className="text-purple-400">@{message.replied_to_username}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Minimal footer for horizontal phone */}
        <div className="bg-black/50 backdrop-blur-sm px-2 py-0.5 text-center">
          <div className="text-xs text-gray-400 flex items-center justify-center space-x-2">
            <span>vaultkeeper.live</span>
            {ttsSettings.enabled && (
              <span className="text-green-400">🔊 TTS Active</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
