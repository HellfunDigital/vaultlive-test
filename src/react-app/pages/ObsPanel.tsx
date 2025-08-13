import { useState, useEffect, useRef } from 'react';
import { Users, DollarSign, Crown, MessageCircle, Star, Trash2, Award, Bell, BellOff } from 'lucide-react';
import { useAuth } from '@getmocha/users-service/react';
import { useNotifications } from '@/react-app/hooks/useNotifications';
import type { ChatMessage, ExtendedMochaUser } from '@/shared/types';

interface CommunityStats {
  totalUsers: number;
  totalSubscribers: number;
  totalMessages: number;
  totalDonations: number;
  totalXp: number;
  totalPoints: number;
  onlineUsers: number;
  topCombinedUsers: Array<{
    name: string;
    xp_total: number;
    user_level: number;
    points_earned_total: number;
    combined_score: number;
  }>;
}

interface RecentActivity {
  id: number;
  type: 'donation' | 'follower' | 'message' | 'subscriber' | 'song' | 'shoutout';
  username: string;
  amount?: number;
  message?: string;
  timestamp: string;
  status?: string;
}

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

export default function ObsPanel() {
  const { user } = useAuth();
  const extendedUser = user as ExtendedMochaUser;
  const { showNotification, settings } = useNotifications();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stats, setStats] = useState<CommunityStats>({
    totalUsers: 0,
    totalSubscribers: 0,
    totalMessages: 0,
    totalDonations: 0,
    totalXp: 0,
    totalPoints: 0,
    onlineUsers: 0,
    topCombinedUsers: []
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [processedMessageIds, setProcessedMessageIds] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load TTS settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('obs-panel-tts-settings');
    if (saved) {
      try {
        setTtsSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse TTS settings:', error);
      }
    }

    // Load available voices
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // TTS function
  const speakText = (text: string) => {
    if (!ttsSettings.enabled || !('speechSynthesis' in window)) return;

    console.log('OBS Panel TTS - Speaking:', text);
    
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
    
    utterance.onstart = () => console.log('OBS Panel TTS - Speech started');
    utterance.onend = () => console.log('OBS Panel TTS - Speech ended');
    utterance.onerror = (event) => console.error('OBS Panel TTS - Speech error:', event);
    
    try {
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('OBS Panel TTS - Speak failed:', error);
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/chat/messages');
      if (response.ok) {
        const data = await response.json();
        
        // Check for new messages and process them for notifications and TTS
        if (messages.length > 0) {
          const newMessages = data.slice(messages.length);
          
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
                      
                      // Show notification
                      showNotification({
                        type: 'donation',
                        title: `${donorName} Donated!`,
                        message: donationMessage || `$${amount.toFixed(2)} donation received`,
                        data: { amount, donorName, message: donationMessage },
                        sound: 'donation'
                      });
                      
                      let ttsText = `${donorName} donated $${amount.toFixed(2)}!`;
                      if (donationMessage) {
                        ttsText += ` Message: ${donationMessage}`;
                      }
                      
                      setTimeout(() => speakText(ttsText), 500);
                    }
                  }
                } else if (message.message.includes('just subscribed')) {
                  const subMatch = message.message.match(/🎉\s(.+?)\sjust subscribed/);
                  if (subMatch) {
                    const subscriberName = subMatch[1];
                    
                    showNotification({
                      type: 'subscription',
                      title: `${subscriberName} Subscribed!`,
                      message: 'New premium subscriber joined!',
                      data: { subscriberName },
                      sound: 'subscription'
                    });
                    
                    setTimeout(() => speakText(`${subscriberName} just subscribed!`), 500);
                  }
                } else if (message.message.includes('just reached Level')) {
                  const levelMatch = message.message.match(/🎉\s(.+?)\sjust reached Level\s(\d+)/);
                  if (levelMatch) {
                    const userName = levelMatch[1];
                    const level = parseInt(levelMatch[2]);
                    
                    showNotification({
                      type: 'level_up',
                      title: `${userName} Leveled Up!`,
                      message: `Reached Level ${level}!`,
                      data: { userName, level },
                      sound: 'level_up'
                    });
                    
                    setTimeout(() => speakText(`${userName} reached Level ${level}!`), 500);
                  }
                }
              }
            }
            // Process Points Shop messages
            else if (message.username === 'PointsShop') {
              const pointsMatch = message.message.match(/(\d+)\s+points/);
              const usernameMatch = message.message.match(/^[⚡✨🌈📌👑📢🎵]\s+(.+?)\s+purchased/);
              
              if (usernameMatch) {
                const purchaserName = usernameMatch[1];
                const points = pointsMatch ? parseInt(pointsMatch[1]) : 0;
                
                showNotification({
                  type: 'points_purchase',
                  title: `${purchaserName} Used Points!`,
                  message: message.message,
                  data: { purchaserName, points },
                  sound: 'points_purchase'
                });
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
        
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  // Fetch stats and activity
  const fetchStats = async () => {
    try {
      // Fetch community stats
      const statsResponse = await fetch('/api/community/stats-enhanced');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(prev => ({
          ...prev,
          ...statsData
        }));
      }

      // Fetch online users
      const onlineResponse = await fetch('/api/stats/online-users');
      if (onlineResponse.ok) {
        const onlineData = await onlineResponse.json();
        setStats(prev => ({ ...prev, onlineUsers: onlineData.onlineUsers }));
      }

      // Fetch recent activity
      const activityResponse = await fetch('/api/community/recent-activity');
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activities?.slice(0, 10) || []);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Delete message (admin/mod only)
  const deleteMessage = async (messageId: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchMessages();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message');
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchStats();
    
    const interval = setInterval(() => {
      fetchMessages();
      fetchStats();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [messages.length, ttsSettings]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  };

  const renderMessageText = (text: string) => {
    // Convert emojis and URLs
    let processedText = text
      .replace(/:smile:/g, '😊')
      .replace(/:laugh:/g, '😂')
      .replace(/:heart:/g, '❤️')
      .replace(/:thumbsup:/g, '👍')
      .replace(/:fire:/g, '🔥')
      .replace(/:party:/g, '🎉');
    
    // Convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    processedText = processedText.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>');
    
    return processedText;
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Top Panel - Live Chat */}
      <div className="flex-1 flex flex-col border-b border-gray-700">
        {/* Chat Header - No Controls */}
        <div className="bg-gray-800 p-3 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-purple-400" />
              <h2 className="font-bold">Live Chat</h2>
              <div className="text-xs bg-green-600 px-2 py-0.5 rounded-full">
                {stats.onlineUsers} online
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-xs text-gray-400">
                TTS: {ttsSettings.enabled ? 'ON' : 'OFF'}
              </div>
              <div className="flex items-center space-x-1">
                {settings.audioEnabled ? (
                  <Bell className="w-3 h-3 text-green-400" />
                ) : (
                  <BellOff className="w-3 h-3 text-red-400" />
                )}
                <span className="text-xs text-gray-400">
                  Alerts: {settings.audioEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-3 space-y-2"
        >
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet</p>
            </div>
          ) : (
            messages.map((message) => {
              const displayedBadges = (() => {
                try {
                  return message.displayed_badges ? JSON.parse(message.displayed_badges) : [];
                } catch {
                  return [];
                }
              })();

              return (
                <div key={message.id} className="group hover:bg-gray-800/50 rounded p-2 transition-colors">
                  <div className="flex items-start space-x-2">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      {/* Badges */}
                      <div className="flex items-center space-x-1">
                        {displayedBadges.map((badge: string) => (
                          <div
                            key={badge}
                            className="bg-purple-600 text-white px-1.5 py-0.5 rounded-full text-xs"
                            title={badge}
                          >
                            {badge === 'VIP' ? '⭐' : badge === 'Moderator' ? '🛡️' : '🏷️'}
                          </div>
                        ))}
                        
                        {message.is_subscriber && (
                          <div title="Subscriber">
                            <Crown className="w-4 h-4 text-purple-400" />
                          </div>
                        )}
                      </div>

                      {/* Username and message */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline space-x-2">
                          <span 
                            className="font-semibold text-sm"
                            style={{ 
                              color: message.name_color || (
                                message.is_subscriber ? '#c084fc' : '#d1d5db'
                              )
                            }}
                          >
                            {message.username}:
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(message.created_at + 'Z').toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div 
                          className="text-sm break-words"
                          dangerouslySetInnerHTML={{
                            __html: renderMessageText(message.message)
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Delete button for admins/mods */}
                    {(extendedUser?.localUser?.is_admin || extendedUser?.localUser?.is_moderator) && (
                      <button
                        onClick={() => deleteMessage(message.id)}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-gray-500 transition-all"
                        title="Delete message"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Panel - Stats & Activity */}
      <div className="h-64 flex bg-gray-800">
        {/* Stats Section */}
        <div className="w-1/3 p-3 border-r border-gray-700">
          <h3 className="font-bold flex items-center space-x-2 mb-3">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>Community Stats</span>
          </h3>

          <div className="grid grid-cols-1 gap-2">
            <div className="bg-blue-600/20 rounded p-2 border border-blue-500/30 text-center">
              <Users className="w-3 h-3 text-blue-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-blue-400">{formatNumber(stats.totalUsers)}</div>
              <div className="text-xs text-gray-400">Members</div>
            </div>
            
            <div className="bg-purple-600/20 rounded p-2 border border-purple-500/30 text-center">
              <Crown className="w-3 h-3 text-purple-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-purple-400">{stats.totalSubscribers}</div>
              <div className="text-xs text-gray-400">Premium</div>
            </div>
            
            <div className="bg-green-600/20 rounded p-2 border border-green-500/30 text-center">
              <DollarSign className="w-3 h-3 text-green-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-green-400">${formatNumber(stats.totalDonations)}</div>
              <div className="text-xs text-gray-400">Donated</div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="w-1/3 p-3 border-r border-gray-700">
          <h3 className="font-bold mb-3 flex items-center space-x-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Recent Activity</span>
          </h3>
          
          <div className="space-y-1 overflow-y-auto max-h-44">
            {recentActivity.length === 0 ? (
              <div className="text-center text-gray-400 py-2">
                <div className="text-xs">No recent activity</div>
              </div>
            ) : (
              recentActivity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="bg-gray-700/50 rounded p-2"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                      <span className="font-medium text-white text-xs">
                        {activity.username}
                      </span>
                      {activity.amount && (
                        <span className="bg-green-500 text-white px-1 py-0.5 rounded text-xs">
                          ${activity.amount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-300">
                    {activity.type === 'donation' && 'made a donation'}
                    {activity.type === 'follower' && 'started following'}
                    {activity.type === 'subscriber' && 'became premium'}
                    {activity.type === 'message' && 'sent a message'}
                    {activity.type === 'song' && (
                      <span className={`${activity.status === 'pending' ? 'text-yellow-400' : activity.status === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                        🎵 Song Request ({activity.status || 'pending'})
                      </span>
                    )}
                    {activity.type === 'shoutout' && (
                      <span className={`${activity.status === 'pending' ? 'text-yellow-400' : activity.status === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                        📢 Shoutout Request ({activity.status || 'pending'})
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Community Leaders Section */}
        <div className="w-1/3 p-3">
          <h3 className="font-bold mb-3">Community Leaders</h3>
          <div className="space-y-1 overflow-y-auto max-h-44">
            {stats.topCombinedUsers.length === 0 ? (
              <div className="text-center text-gray-400 py-2">
                <div className="text-xs">No leaders yet</div>
              </div>
            ) : (
              stats.topCombinedUsers.slice(0, 5).map((user, index) => (
                <div key={user.name} className="flex items-center justify-between bg-gray-700/30 rounded p-1.5">
                  <div className="flex items-center space-x-1">
                    <div className="text-sm">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : 
                       <div className="w-4 h-4 rounded-full bg-gray-600 text-white flex items-center justify-center">
                         <span className="text-xs font-bold">{index + 1}</span>
                       </div>
                      }
                    </div>
                    <span className="text-white text-xs">{user.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-purple-400">{formatNumber(user.combined_score)}</div>
                    <div className="text-xs text-gray-400">Lv.{user.user_level} | {formatNumber(user.xp_total)} XP | {formatNumber(user.points_earned_total)} pts</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
