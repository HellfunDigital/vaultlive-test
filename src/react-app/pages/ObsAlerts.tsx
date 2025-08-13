import { useState, useEffect } from 'react';
import { DollarSign, Crown, Users, Star, Heart, Gift } from 'lucide-react';
import { useNotifications } from '@/react-app/hooks/useNotifications';

interface Alert {
  id: number;
  type: 'donation' | 'subscription' | 'follower' | 'level_up' | 'tts_effect' | 'points_purchase' | 'admin_points_award';
  username: string;
  amount?: number;
  message?: string;
  level?: number;
  created_at: string;
}

interface TestAlert {
  id: number;
  type: string;
  username: string;
  amount?: number;
  message?: string;
  created_at: string;
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

export default function ObsAlerts() {
  const { showNotification, playSound } = useNotifications();
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);
  const [alertQueue, setAlertQueue] = useState<Alert[]>([]);
  const [processedAlerts, setProcessedAlerts] = useState<Set<number>>(new Set());
  const [testProcessedAlerts, setTestProcessedAlerts] = useState<Set<number>>(new Set());
  const [processedChatMessages, setProcessedChatMessages] = useState<Set<number>>(new Set());
  const [isShowingAlert, setIsShowingAlert] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
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

  // Enhanced notification system with better error handling
  const showEnhancedNotification = (alert: Alert) => {
    if (!alertsEnabled) return;

    try {
      // Show unified notification
      showNotification({
        type: alert.type as any,
        title: getAlertTitle(alert),
        message: alert.message || `${alert.username} triggered an alert!`,
        data: {
          username: alert.username,
          amount: alert.amount,
          level: alert.level,
          message: alert.message
        },
        sound: alert.type,
        persistent: false
      });

      // Play enhanced sound
      playSound(alert.type, 0.8);

      // Show browser notification with better formatting
      showBrowserNotification(alert);

    } catch (error) {
      console.error('Enhanced notification failed:', error);
      // Fallback to basic sound
      try {
        playNotificationSound(alert.type);
      } catch (soundError) {
        console.error('Fallback sound failed:', soundError);
      }
    }
  };

  // Legacy sound system as fallback
  const playNotificationSound = (alertType: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      switch (alertType) {
        case 'donation':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
          break;
        case 'subscription':
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.15);
          break;
        case 'points_purchase':
          oscillator.frequency.setValueAtTime(700, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(900, audioContext.currentTime + 0.1);
          break;
        case 'admin_points_award':
          oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(700, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(900, audioContext.currentTime + 0.2);
          break;
        default:
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      }
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Legacy audio notification failed:', error);
    }
  };

  // Show browser notification
  const showBrowserNotification = (alert: Alert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = getAlertTitle(alert);
      const body = alert.message || `${alert.username} triggered an alert!`;
      
      new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        tag: `alert-${alert.id}`,
        requireInteraction: false
      });
    }
  };

  // Load available voices and TTS settings
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }

    // Load TTS settings from localStorage
    const saved = localStorage.getItem('obs-alerts-tts-settings');
    if (saved) {
      try {
        const savedSettings = JSON.parse(saved);
        setTtsSettings(savedSettings);
      } catch (error) {
        console.error('Failed to parse TTS settings:', error);
      }
    }
  }, []);

  // TTS function for alerts
  const speakAlert = (alert: Alert) => {
    if (!ttsSettings.enabled || !('speechSynthesis' in window)) return;

    console.log('OBS Alerts TTS - Speaking alert:', alert);

    let ttsText = '';
    
    switch (alert.type) {
      case 'donation':
        if (!ttsSettings.donationTTS) return;
        if (alert.amount && alert.amount < ttsSettings.minDonationAmount) return;
        
        ttsText = `${alert.username} donated ${alert.amount ? `$${alert.amount.toFixed(2)}` : 'money'}!`;
        if (alert.message && alert.message.trim()) {
          ttsText += ` Their message: ${alert.message}`;
        }
        break;
      
      case 'subscription':
        if (!ttsSettings.donationTTS) return;
        ttsText = `${alert.username} just subscribed! Welcome to the premium community!`;
        break;
      
      case 'follower':
        if (!ttsSettings.donationTTS) return;
        ttsText = `${alert.username} started following! Welcome!`;
        break;
      
      case 'level_up':
        if (!ttsSettings.donationTTS) return;
        ttsText = `${alert.username} reached Level ${alert.level}! Congratulations!`;
        break;
      
      case 'points_purchase':
        if (!ttsSettings.donationTTS) return;
        ttsText = `${alert.username} purchased ${alert.amount?.toLocaleString()} points! Thank you for supporting the community!`;
        break;
      
      case 'admin_points_award':
        if (!ttsSettings.donationTTS) return;
        ttsText = `${alert.username} received ${alert.amount?.toLocaleString()} points! Congratulations!`;
        break;
      
      case 'tts_effect':
        ttsText = `${alert.username} used a TTS effect!`;
        if (alert.message && alert.message.trim()) {
          ttsText += ` ${alert.message}`;
        }
        break;
      
      default:
        if (!ttsSettings.donationTTS) return;
        ttsText = `Thank you ${alert.username}!`;
    }

    if (ttsText) {
      speakText(ttsText);
    }
  };

  // TTS function for chat messages
  const speakChatMessage = (text: string) => {
    if (!ttsSettings.enabled || !ttsSettings.chatTTS || !('speechSynthesis' in window)) return;
    
    console.log('OBS Alerts TTS - Speaking chat:', text);
    speakText(text);
  };

  // Core TTS function
  const speakText = (text: string) => {
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
    
    utterance.onstart = () => console.log('OBS Alerts TTS - Speech started');
    utterance.onend = () => console.log('OBS Alerts TTS - Speech ended');
    utterance.onerror = (event) => console.error('OBS Alerts TTS - Speech error:', event);
    
    try {
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('OBS Alerts TTS - Speak failed:', error);
    }
  };

  // Poll for new alerts and chat messages
  useEffect(() => {
    const checkForAlerts = async () => {
      try {
        // Check for real donations first
        const donationsResponse = await fetch('/api/donations/public');
        if (donationsResponse.ok) {
          const donations = await donationsResponse.json();
          
          const newDonationAlerts: Alert[] = donations
            .filter((d: any) => d.status === 'completed' && !processedAlerts.has(d.id))
            .map((d: any) => ({
              id: d.id,
              type: 'donation' as const,
              username: d.is_anonymous ? 'Anonymous' : d.donor_name,
              amount: Number(d.amount),
              message: d.message,
              created_at: d.created_at
            }));

          if (newDonationAlerts.length > 0) {
            setAlertQueue(prev => [...prev, ...newDonationAlerts]);
            setProcessedAlerts(prev => {
              const newSet = new Set(prev);
              newDonationAlerts.forEach(alert => newSet.add(alert.id));
              return newSet;
            });
          }
        }

        // Check for test alerts
        const testAlertsResponse = await fetch('/api/test-alerts');
        if (testAlertsResponse.ok) {
          const testAlerts: TestAlert[] = await testAlertsResponse.json();
          
          const newTestAlerts: Alert[] = testAlerts
            .filter(alert => !testProcessedAlerts.has(alert.id))
            .map(alert => ({
              id: alert.id + 10000,
              type: alert.type as 'donation' | 'subscription' | 'tts_effect' | 'points_purchase' | 'admin_points_award',
              username: alert.username,
              amount: alert.amount,
              message: alert.message,
              created_at: alert.created_at
            }));

          if (newTestAlerts.length > 0) {
            setAlertQueue(prev => [...prev, ...newTestAlerts]);
            setTestProcessedAlerts(prev => {
              const newSet = new Set(prev);
              testAlerts.forEach(alert => newSet.add(alert.id));
              return newSet;
            });
          }
        }

        // Check for new chat messages for TTS
        if (ttsSettings.enabled && ttsSettings.chatTTS) {
          try {
            const chatResponse = await fetch('/api/chat/messages');
            if (chatResponse.ok) {
              const messages = await chatResponse.json();
              
              // Process recent messages for TTS (last 10 messages to avoid spam)
              const recentMessages = messages.slice(-10);
              
              recentMessages.forEach((message: any) => {
                if (processedChatMessages.has(message.id)) return;
                
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
                          
                          setTimeout(() => speakChatMessage(ttsText), 500);
                        }
                      }
                    } else if (message.message.includes('just subscribed')) {
                      const subMatch = message.message.match(/🎉\s(.+?)\sjust subscribed/);
                      if (subMatch) {
                        const subscriberName = subMatch[1];
                        setTimeout(() => speakChatMessage(`${subscriberName} just subscribed!`), 500);
                      }
                    } else if (message.message.includes('just reached Level')) {
                      const levelMatch = message.message.match(/🎉\s(.+?)\sjust reached Level\s(\d+)/);
                      if (levelMatch) {
                        const userName = levelMatch[1];
                        const level = levelMatch[2];
                        setTimeout(() => speakChatMessage(`${userName} reached Level ${level}!`), 500);
                      }
                    }
                  }
                }
                // Process regular chat messages when chatTTS is enabled
                else if (message.platform === 'vaultkeeper' && 
                         message.username !== 'ShoutoutBot' && 
                         message.username !== 'PointsShop' && 
                         message.username !== 'TTSShop' &&
                         !message.message.startsWith('!') &&
                         !message.message.startsWith('/')) {
                  
                  // TTS for all VaultKeeper chat messages when enabled
                  const ttsText = `${message.username} says: ${message.message}`;
                  setTimeout(() => speakChatMessage(ttsText), 200);
                }
                
                setProcessedChatMessages(prev => new Set([...prev, message.id]));
              });
            }
          } catch (chatError) {
            // Continue silently if chat fails
            console.log('Chat TTS failed:', chatError);
          }
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      }
    };

    checkForAlerts();
    const interval = setInterval(checkForAlerts, 3000);
    return () => clearInterval(interval);
  }, [processedAlerts, testProcessedAlerts, processedChatMessages, ttsSettings]);

  // Process alert queue
  useEffect(() => {
    if (alertQueue.length > 0 && !isShowingAlert && !currentAlert) {
      const nextAlert = alertQueue[0];
      setCurrentAlert(nextAlert);
      setAlertQueue(prev => prev.slice(1));
      setIsShowingAlert(true);

      // Show enhanced notification (includes sound, browser notification, and more)
      try {
        showEnhancedNotification(nextAlert);
        
        // Still trigger TTS for backward compatibility
        speakAlert(nextAlert);
      } catch (error) {
        console.error('Enhanced alert processing error:', error);
        // Fallback to legacy systems
        playNotificationSound(nextAlert.type);
        showBrowserNotification(nextAlert);
      }

      // Auto-hide alert after duration
      const duration = getAlertDuration(nextAlert.type);
      setTimeout(() => {
        setCurrentAlert(null);
        setIsShowingAlert(false);
      }, duration);
    }
  }, [alertQueue, isShowingAlert, currentAlert, ttsSettings, voices]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return <DollarSign className="w-8 h-8 text-green-400" />;
      case 'subscription':
        return <Crown className="w-8 h-8 text-purple-400" />;
      case 'follower':
        return <Users className="w-8 h-8 text-blue-400" />;
      case 'level_up':
        return <Star className="w-8 h-8 text-yellow-400" />;
      case 'points_purchase':
        return <DollarSign className="w-8 h-8 text-yellow-400" />;
      case 'admin_points_award':
        return <Gift className="w-8 h-8 text-orange-400" />;
      case 'tts_effect':
        return (
          <svg className="w-8 h-8 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        );
      default:
        return <Heart className="w-8 h-8 text-pink-400" />;
    }
  };

  const getAlertDuration = (type: string) => {
    switch (type) {
      case 'donation':
        return 8000;
      case 'points_purchase':
        return 7000;
      case 'admin_points_award':
        return 6000;
      default:
        return 6000;
    }
  };

  const getAlertColors = (type: string) => {
    switch (type) {
      case 'donation':
        return {
          bg: 'from-green-600 to-emerald-600',
          border: 'border-green-400',
          glow: 'shadow-green-500/50'
        };
      case 'subscription':
        return {
          bg: 'from-purple-600 to-violet-600',
          border: 'border-purple-400',
          glow: 'shadow-purple-500/50'
        };
      case 'follower':
        return {
          bg: 'from-blue-600 to-cyan-600',
          border: 'border-blue-400',
          glow: 'shadow-blue-500/50'
        };
      case 'level_up':
        return {
          bg: 'from-yellow-600 to-orange-600',
          border: 'border-yellow-400',
          glow: 'shadow-yellow-500/50'
        };
      case 'points_purchase':
        return {
          bg: 'from-yellow-600 to-amber-600',
          border: 'border-yellow-400',
          glow: 'shadow-yellow-500/50'
        };
      case 'admin_points_award':
        return {
          bg: 'from-orange-600 to-red-600',
          border: 'border-orange-400',
          glow: 'shadow-orange-500/50'
        };
      case 'tts_effect':
        return {
          bg: 'from-cyan-600 to-teal-600',
          border: 'border-cyan-400',
          glow: 'shadow-cyan-500/50'
        };
      default:
        return {
          bg: 'from-pink-600 to-rose-600',
          border: 'border-pink-400',
          glow: 'shadow-pink-500/50'
        };
    }
  };

  const getAlertTitle = (alert: Alert) => {
    switch (alert.type) {
      case 'donation':
        return `${alert.username} Donated $${alert.amount?.toFixed(2)}!`;
      case 'subscription':
        return `${alert.username} Just Subscribed!`;
      case 'follower':
        return `${alert.username} Started Following!`;
      case 'level_up':
        return `${alert.username} Reached Level ${alert.level}!`;
      case 'points_purchase':
        return `${alert.username} Purchased ${alert.amount?.toLocaleString()} Points!`;
      case 'admin_points_award':
        return `${alert.username} Received ${alert.amount?.toLocaleString()} Points!`;
      case 'tts_effect':
        return `${alert.username} Used TTS Effect!`;
      default:
        return `Thank you ${alert.username}!`;
    }
  };

  if (!currentAlert) {
    return (
      <div className="fixed inset-0 bg-transparent flex items-center justify-center">
        {/* Status indicator for OBS */}
        <div className="absolute top-4 right-4 z-50">
          <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm rounded-lg p-2">
            <div className={`w-2 h-2 rounded-full ${alertsEnabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-white text-xs font-medium">
              Alerts {alertsEnabled ? 'ON' : 'OFF'}
            </span>
            <button
              onClick={() => setAlertsEnabled(!alertsEnabled)}
              className="text-white hover:text-gray-300 text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              Toggle
            </button>
          </div>
        </div>
        
        {/* Queue indicator */}
        {alertQueue.length > 0 && (
          <div className="absolute bottom-4 right-4 z-50">
            <div className="bg-blue-600/80 backdrop-blur-sm rounded-lg p-3 border border-blue-400/50">
              <div className="text-white text-sm font-medium">
                {alertQueue.length} alert{alertQueue.length > 1 ? 's' : ''} queued
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const colors = getAlertColors(currentAlert.type);

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center p-8">
      <div 
        className={`
          relative max-w-2xl w-full
          bg-gradient-to-r ${colors.bg}
          border-4 ${colors.border}
          rounded-2xl shadow-2xl ${colors.glow}
          transform transition-all duration-500 ease-out
          ${isShowingAlert ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
          animate-pulse
        `}
        style={{
          animation: isShowingAlert ? 'alertShow 0.5s ease-out' : 'none'
        }}
      >
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-2xl border-4 border-white/30 animate-ping"></div>
        
        <div className="relative z-10 p-8 text-center text-white">
          {/* Alert Icon */}
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm border-2 border-white/30">
              {getAlertIcon(currentAlert.type)}
            </div>
          </div>

          {/* Alert Title */}
          <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
            {getAlertTitle(currentAlert)}
          </h1>

          {/* Alert Message */}
          {currentAlert.message && (
            <div className="mb-6">
              <div className="bg-black/30 rounded-lg p-4 backdrop-blur-sm border border-white/20">
                <p className="text-xl italic">"{currentAlert.message}"</p>
              </div>
            </div>
          )}

          {/* Thank You Message */}
          <div className="text-2xl font-semibold opacity-90">
            {currentAlert.type === 'donation' ? 'Thank you for your support!' :
             currentAlert.type === 'subscription' ? 'Welcome to the premium community!' :
             currentAlert.type === 'follower' ? 'Welcome to the community!' :
             currentAlert.type === 'points_purchase' ? 'Thank you for your support!' :
             currentAlert.type === 'admin_points_award' ? 'Congratulations!' :
             currentAlert.type === 'tts_effect' ? 'TTS effect activated!' :
             'Congratulations!'}
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 left-4">
            <Gift className="w-6 h-6 text-white/50" />
          </div>
          <div className="absolute top-4 right-4">
            <Heart className="w-6 h-6 text-white/50" />
          </div>
          <div className="absolute bottom-4 left-4">
            <Star className="w-6 h-6 text-white/50" />
          </div>
          <div className="absolute bottom-4 right-4">
            <Crown className="w-6 h-6 text-white/50" />
          </div>
        </div>

        {/* Particle effects overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-70"
              style={{
                left: `${10 + (i * 7)}%`,
                top: `${20 + Math.sin(i) * 30}%`,
                animation: `float ${2 + (i * 0.1)}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes alertShow {
          0% {
            transform: scale(0.5) rotate(-10deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.05) rotate(2deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-20px);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
