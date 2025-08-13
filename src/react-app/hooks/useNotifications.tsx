import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface NotificationSettings {
  audioEnabled: boolean;
  browserNotificationsEnabled: boolean;
  toastNotificationsEnabled: boolean;
  donationVolume: number;
  chatVolume: number;
  systemVolume: number;
  mutedSounds: string[];
}

export interface NotificationEvent {
  id: string;
  type: 'donation' | 'subscription' | 'follow' | 'chat_mention' | 'admin_alert' | 'points_purchase' | 'level_up' | 'system' | 'error' | 'success';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  persistent?: boolean;
  sound?: string;
  icon?: string;
}

interface NotificationContextType {
  settings: NotificationSettings;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  notifications: NotificationEvent[];
  showNotification: (notification: Omit<NotificationEvent, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  playSound: (soundType: string, volume?: number) => void;
  requestPermissions: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const DEFAULT_SETTINGS: NotificationSettings = {
  audioEnabled: true,
  browserNotificationsEnabled: false,
  toastNotificationsEnabled: false,
  donationVolume: 0.8,
  chatVolume: 0.7, // Increased from 0.5 to make chat sounds more audible
  systemVolume: 0.7, // Increased from 0.6 to make system sounds more audible
  mutedSounds: [],
};

// Audio manager for different notification sounds
class AudioManager {
  private audioContext: AudioContext | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  async initialize() {
    if (this.initialized && this.audioContext?.state === 'running') return;
    
    // Prevent multiple initialization attempts
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  private async _doInitialize() {
    try {
      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Resume context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.initialized = true;
      console.log('✅ Audio manager initialized successfully, state:', this.audioContext.state);
    } catch (error) {
      console.warn('AudioContext initialization failed:', error);
      throw error;
    } finally {
      this.initPromise = null;
    }
  }

  async playNotificationSound(type: string, volume: number = 0.8) {
    await this.initialize();

    if (!this.audioContext || this.audioContext.state !== 'running') {
      console.warn('Audio context not ready, state:', this.audioContext?.state);
      return;
    }

    try {
      // Different sounds for different notification types
      const soundConfigs: Record<string, { frequencies: number[], durations: number[] }> = {
        donation: { 
          frequencies: [800, 1000, 1200], 
          durations: [0.15, 0.15, 0.25] 
        },
        subscription: { 
          frequencies: [600, 800, 600, 800], 
          durations: [0.15, 0.15, 0.15, 0.15] 
        },
        points_purchase: { 
          frequencies: [700, 900, 1100], 
          durations: [0.12, 0.12, 0.16] 
        },
        chat_mention: { 
          frequencies: [1000, 1200], 
          durations: [0.12, 0.18] 
        },
        level_up: { 
          frequencies: [500, 700, 900, 1100], 
          durations: [0.1, 0.1, 0.1, 0.2] 
        },
        admin_alert: { 
          frequencies: [400, 600, 800], 
          durations: [0.2, 0.2, 0.2] 
        },
        system: { 
          frequencies: [600, 800], 
          durations: [0.1, 0.1] 
        },
        error: { 
          frequencies: [300, 250, 200], 
          durations: [0.2, 0.2, 0.2] 
        },
        success: { 
          frequencies: [800, 1000], 
          durations: [0.15, 0.25] 
        },
      };

      const config = soundConfigs[type] || soundConfigs.system;
      
      // Create a new oscillator for each sound to avoid conflicts
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // Set up audio nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      let currentTime = this.audioContext.currentTime;
      
      // Set up the sound pattern with better timing
      config.frequencies.forEach((freq, index) => {
        const duration = config.durations[index] || 0.2;
        
        oscillator.frequency.setValueAtTime(freq, currentTime);
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.4, currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + duration);
        
        currentTime += duration + 0.05; // Small gap between notes
      });
      
      // Start and stop the oscillator
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(currentTime);
      
      // Clean up after sound finishes
      oscillator.onended = () => {
        try {
          oscillator.disconnect();
          gainNode.disconnect();
        } catch (disconnectError) {
          // Ignore disconnect errors
        }
      };
      
      // Log successful playback for debugging
      console.log(`🎵 Played ${type} notification sound at volume ${volume}, context state: ${this.audioContext.state}`);
      
    } catch (error) {
      console.error('Failed to play notification sound:', error);
      throw error;
    }
  }
}

const audioManager = new AudioManager();

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('vaultkeeper-notification-settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('vaultkeeper-notification-settings', JSON.stringify(settings));
  }, [settings]);

  // Initialize audio on first user interaction
  useEffect(() => {
    let audioInitialized = false;
    let cleanup = false;
    
    const initAudio = async () => {
      if (audioInitialized || cleanup) return;
      audioInitialized = true;
      
      console.log('🎵 Initializing audio on user interaction...');
      try {
        await audioManager.initialize();
        console.log('✅ Audio manager initialized successfully');
        
        // Test audio is working with a very quiet test sound
        setTimeout(async () => {
          try {
            await audioManager.playNotificationSound('system', 0.1);
            console.log('✅ Audio test successful - sounds should work');
          } catch (testError) {
            console.warn('⚠️ Audio test failed, but audio manager initialized:', testError);
          }
        }, 100);
      } catch (error) {
        console.error('❌ Failed to initialize audio manager:', error);
        audioInitialized = false; // Allow retry
      }
    };

    // Multiple event listeners to catch user interaction
    const events = ['click', 'keydown', 'touchstart', 'mousedown', 'focus', 'pointerdown'];
    
    const handleUserInteraction = (event: Event) => {
      console.log(`🖱️ User interaction detected: ${event.type}`);
      initAudio();
    };

    // Add listeners for all interaction types with passive option
    events.forEach(eventName => {
      document.addEventListener(eventName, handleUserInteraction, { 
        once: true, 
        passive: true,
        capture: true 
      });
    });

    // Also try to initialize on page visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden && !audioInitialized) {
        initAudio();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cleanup = true;
      // Cleanup all listeners
      events.forEach(eventName => {
        document.removeEventListener(eventName, handleUserInteraction, { capture: true });
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const requestPermissions = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Browser notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  const playSound = async (soundType: string, customVolume?: number) => {
    console.log(`🔊 playSound called - Type: ${soundType}, AudioEnabled: ${settings.audioEnabled}, Muted: ${settings.mutedSounds.includes(soundType)}`);
    
    if (!settings.audioEnabled) {
      console.log('🔇 Audio disabled, skipping sound');
      return;
    }
    
    if (settings.mutedSounds.includes(soundType)) {
      console.log(`🔇 ${soundType} is muted, skipping sound`);
      return;
    }

    let volume = customVolume;
    if (volume === undefined) {
      switch (soundType) {
        case 'donation':
        case 'subscription':
        case 'points_purchase':
        case 'level_up':
          volume = settings.donationVolume;
          break;
        case 'chat_mention':
        case 'system':
          volume = settings.chatVolume;
          break;
        default:
          volume = settings.systemVolume;
          break;
      }
    }

    console.log(`🔊 Playing ${soundType} at volume ${volume}`);

    try {
      // Ensure audio manager is initialized with retry logic
      let initAttempts = 0;
      while (initAttempts < 3) {
        try {
          await audioManager.initialize();
          break;
        } catch (initError) {
          initAttempts++;
          console.warn(`Audio init attempt ${initAttempts} failed:`, initError);
          if (initAttempts >= 3) throw initError;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      await audioManager.playNotificationSound(soundType, volume);
      console.log(`✅ Successfully played ${soundType} sound`);
    } catch (error) {
      console.error(`❌ Failed to play ${soundType} sound:`, error);
      // Don't throw to prevent breaking the notification flow
    }
  };

  

  const showNotification = (notificationData: Omit<NotificationEvent, 'id' | 'timestamp'>) => {
    const notification: NotificationEvent = {
      ...notificationData,
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      timestamp: new Date(),
    };

    console.log(`📬 Creating notification:`, notification);

    // Only add to display queue if toast notifications are enabled
    if (settings.toastNotificationsEnabled) {
      setNotifications(prev => {
        // Limit to 5 notifications max
        const updated = [...prev, notification].slice(-5);
        console.log(`📬 Updated notifications queue, count: ${updated.length}`);
        return updated;
      });
    }

    // Always play sound regardless of toast setting
    if (notification.sound || notification.type) {
      const soundType = notification.sound || notification.type;
      console.log(`🔊 Playing sound for: ${soundType}`);
      
      // Use setTimeout to ensure sound plays after state update
      setTimeout(() => {
        playSound(soundType).catch(error => {
          console.error(`Failed to play ${soundType} sound:`, error);
          // Fallback: try to play a basic system sound
          try {
            audioManager.playNotificationSound('system', 0.5);
          } catch (fallbackError) {
            console.error('Fallback sound also failed:', fallbackError);
          }
        });
      }, 50);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const contextValue: NotificationContextType = {
    settings,
    updateSettings,
    notifications,
    showNotification,
    dismissNotification,
    clearAllNotifications,
    playSound,
    requestPermissions,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
