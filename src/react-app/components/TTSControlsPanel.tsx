import { useState, useEffect } from 'react';
import { Volume2, VolumeX, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { useAuth } from '@getmocha/users-service/react';
import type { ExtendedMochaUser } from '@/shared/types';

interface TTSSettings {
  enabled: boolean; // This will now only control chat TTS
  donationTTS: boolean;
  chatTTS: boolean; // This will be merged with enabled for simplicity
  minDonationAmount: number;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}

export default function TTSControlsPanel() {
  const { user } = useAuth();
  const extendedUser = user as ExtendedMochaUser;
  const [isExpanded, setIsExpanded] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [settings, setSettings] = useState<TTSSettings>({
    enabled: false, // This now specifically controls chat message TTS
    donationTTS: true,
    chatTTS: false, // Will keep this for backward compatibility
    minDonationAmount: 5,
    voice: 'default',
    rate: 1,
    pitch: 1,
    volume: 0.8,
  });
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Load settings from localStorage and fetch user points
  useEffect(() => {
    const saved = localStorage.getItem('tts-settings');
    if (saved) {
      try {
        const savedSettings = JSON.parse(saved);
        // Always ensure TTS defaults to OFF on main chat
        setSettings({ ...savedSettings, enabled: false });
      } catch (error) {
        console.error('Failed to parse TTS settings:', error);
      }
    }

    // Fetch user points if logged in
    if (extendedUser?.localUser) {
      setUserPoints(extendedUser.localUser.points_balance || 0);
    }
  }, [extendedUser]);

  // Save settings to localStorage
  const saveSettings = (newSettings: TTSSettings) => {
    setSettings(newSettings);
    localStorage.setItem('tts-settings', JSON.stringify(newSettings));
  };

  

  // Global TTS function for other components to use
  useEffect(() => {
    const handleTTSRequest = (event: CustomEvent) => {
      console.log('TTS Debug - handleTTSRequest called (main site - audio disabled):', { enabled: settings.enabled, detail: event.detail });
      
      // TTS is disabled on the main site - only works on OBS overlay
      // This prevents audio from playing on the main website
      console.log('TTS Debug - Audio playback disabled on main site, use OBS overlay for TTS audio');
      return;
    };

    // Handle regular chat messages for TTS - Only for subscribers or admins by default
    const handleChatMessage = (event: CustomEvent) => {
      console.log('TTS Debug - handleChatMessage called (main site - audio disabled):', { 
        enabled: settings.enabled, 
        detail: event.detail 
      });
      
      // TTS is disabled on the main site - only works on OBS overlay
      // This prevents audio from playing on the main website
      console.log('TTS Debug - Chat message audio disabled on main site, use OBS overlay for TTS audio');
      return;
    };

    // Also listen for donation messages from the chat system
    const handleDonationMessage = (event: CustomEvent) => {
      console.log('TTS Debug - handleDonationMessage called (main site - audio disabled):', { 
        donationTTS: settings.donationTTS, 
        detail: event.detail 
      });
      
      // TTS is disabled on the main site - only works on OBS overlay
      // This prevents audio from playing on the main website
      console.log('TTS Debug - Donation message audio disabled on main site, use OBS overlay for TTS audio');
      return;
    };

    window.addEventListener('tts-request', handleTTSRequest as EventListener);
    window.addEventListener('donation-tts', handleDonationMessage as EventListener);
    window.addEventListener('chat-tts', handleChatMessage as EventListener);
    return () => {
      window.removeEventListener('tts-request', handleTTSRequest as EventListener);
      window.removeEventListener('donation-tts', handleDonationMessage as EventListener);
      window.removeEventListener('chat-tts', handleChatMessage as EventListener);
    };
  }, [settings, voices]);

  // Purchase points-based TTS effects
  const purchasePointsForTTS = async (effectType: string, cost: number) => {
    if (userPoints < cost) return;

    try {
      const response = await fetch('/api/points-shop/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          item_id: effectType,
          cost: cost
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserPoints(data.newBalance);
        
        // Create test TTS alert for OBS
        await fetch('/api/admin/test-tts-effect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            effect_type: effectType,
            username: extendedUser?.localUser?.name || 'Unknown',
            cost: cost
          }),
        });

        alert(`Successfully purchased ${effectType}! Your next TTS message will have the effect.`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to purchase TTS effect');
      }
    } catch (error) {
      console.error('Error purchasing TTS effect:', error);
      alert('Failed to purchase TTS effect');
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-2">
          {settings.enabled ? (
            <Volume2 className="w-4 h-4 text-green-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-red-400" />
          )}
          <span className="font-medium text-white">TTS Controls</span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            settings.enabled ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'
          }`}>
            TTS: {settings.enabled ? 'Subs/Supporters' : 'OFF'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Quick Toggle */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => saveSettings({ ...settings, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-gray-600 peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
          
          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title={isExpanded ? "Hide settings" : "Show settings"}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Settings */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-700">
          <div className="space-y-3 mt-3">
            {/* TTS Types */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">What to Read</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.donationTTS}
                    onChange={(e) => saveSettings({ ...settings, donationTTS: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-300">Donations & Alerts</span>
                </label>
                <div className="text-xs text-gray-400 ml-6 mb-2">
                  When enabled, chat messages from subscribers and supporters will be read via TTS on the OBS overlay
                </div>
              </div>
            </div>

            {/* Min Donation Amount */}
            {settings.donationTTS && (
              <div>
                <label className="block text-sm text-gray-300 mb-1">Min Donation ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.minDonationAmount}
                  onChange={(e) => saveSettings({ ...settings, minDonationAmount: parseFloat(e.target.value) || 0 })}
                  className="w-20 bg-gray-700 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            )}

            {/* Voice and Settings Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Voice</label>
                <select
                  value={settings.voice}
                  onChange={(e) => saveSettings({ ...settings, voice: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="default">Default</option>
                  {voices.slice(0, 10).map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name.split(' ')[0]} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">Speed: {settings.rate.toFixed(1)}</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.rate}
                  onChange={(e) => saveSettings({ ...settings, rate: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Points TTS Section */}
            {extendedUser?.localUser && (
              <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium">Points TTS</span>
                    <span className="text-xs text-gray-400">({userPoints} pts available)</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button 
                    onClick={() => purchasePointsForTTS('priority_tts', 50)}
                    disabled={userPoints < 50}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-2 py-1 rounded transition-colors"
                  >
                    Priority TTS (50 pts)
                  </button>
                  <button 
                    onClick={() => purchasePointsForTTS('voice_change', 25)}
                    disabled={userPoints < 25}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-2 py-1 rounded transition-colors"
                  >
                    Voice Change (25 pts)
                  </button>
                </div>
              </div>
            )}

            
          </div>
        </div>
      )}
    </div>
  );
}
