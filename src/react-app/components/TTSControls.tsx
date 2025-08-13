import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Settings, Play, Pause } from 'lucide-react';
import { useAuth } from '@getmocha/users-service/react';
import type { ExtendedMochaUser } from '@/shared/types';

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

export default function TTSControls() {
  const { user } = useAuth();
  const extendedUser = user as ExtendedMochaUser;
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<TTSSettings>({
    enabled: false,
    donationTTS: true,
    chatTTS: false,
    minDonationAmount: 5,
    voice: 'default',
    rate: 1,
    pitch: 1,
    volume: 0.8,
  });
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testText, setTestText] = useState('Hello! This is a test of the text-to-speech system.');

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Load settings from localStorage
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
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: TTSSettings) => {
    setSettings(newSettings);
    localStorage.setItem('tts-settings', JSON.stringify(newSettings));
  };

  // Test TTS with current settings
  const testTTS = () => {
    if ('speechSynthesis' in window) {
      // Cancel any existing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(testText);
      
      // Find the selected voice
      const selectedVoice = voices.find(v => v.name === settings.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      utterance.volume = settings.volume;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in your browser');
    }
  };

  // Stop current speech
  const stopTTS = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  // Global TTS function for other components to use
  useEffect(() => {
    const handleTTSRequest = (event: CustomEvent) => {
      if (!settings.enabled) return;
      
      const { text, type, amount } = event.detail;
      
      // Check if this type of TTS is enabled
      if (type === 'donation' && !settings.donationTTS) return;
      if (type === 'chat' && !settings.chatTTS) return;
      if (type === 'donation' && amount && amount < settings.minDonationAmount) return;
      
      // Speak the text
      if ('speechSynthesis' in window) {
        // Cancel any existing speech first
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        const selectedVoice = voices.find(v => v.name === settings.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        utterance.rate = settings.rate;
        utterance.pitch = settings.pitch;
        utterance.volume = settings.volume;
        
        speechSynthesis.speak(utterance);
      }
    };

    // Also listen for donation messages from the chat system
    const handleDonationMessage = (event: CustomEvent) => {
      if (!settings.enabled || !settings.donationTTS) return;
      
      const { donorName, amount, message } = event.detail;
      
      if (amount < settings.minDonationAmount) return;
      
      let ttsText = `${donorName} donated ${amount} dollars`;
      if (message && message.trim()) {
        ttsText += `. Their message: ${message}`;
      }
      
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(ttsText);
        
        const selectedVoice = voices.find(v => v.name === settings.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        utterance.rate = settings.rate;
        utterance.pitch = settings.pitch;
        utterance.volume = settings.volume;
        
        speechSynthesis.speak(utterance);
      }
    };

    window.addEventListener('tts-request', handleTTSRequest as EventListener);
    window.addEventListener('donation-tts', handleDonationMessage as EventListener);
    return () => {
      window.removeEventListener('tts-request', handleTTSRequest as EventListener);
      window.removeEventListener('donation-tts', handleDonationMessage as EventListener);
    };
  }, [settings, voices]);

  // Only show to admins and moderators
  if (!extendedUser?.localUser?.is_admin && !extendedUser?.localUser?.is_moderator) {
    return null;
  }

  return (
    <>
      {/* TTS Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-200"
        title="TTS Controls"
      >
        {settings.enabled ? (
          <Volume2 className="w-5 h-5" />
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </button>

      {/* TTS Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>TTS Settings</span>
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Master Enable/Disable */}
              <div className="flex items-center justify-between">
                <label className="text-white font-medium">Enable TTS</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => saveSettings({ ...settings, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {settings.enabled && (
                <>
                  {/* TTS Types */}
                  <div className="space-y-3">
                    <h3 className="text-white font-semibold">What to Read</h3>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-gray-300">Donation Messages</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.donationTTS}
                          onChange={(e) => saveSettings({ ...settings, donationTTS: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-600 peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-gray-300">Chat Messages</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.chatTTS}
                          onChange={(e) => saveSettings({ ...settings, chatTTS: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-600 peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Minimum Donation Amount */}
                  {settings.donationTTS && (
                    <div>
                      <label className="block text-gray-300 mb-1">Minimum Donation Amount ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={settings.minDonationAmount}
                        onChange={(e) => saveSettings({ ...settings, minDonationAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}

                  {/* Voice Selection */}
                  <div>
                    <label className="block text-gray-300 mb-1">Voice</label>
                    <select
                      value={settings.voice}
                      onChange={(e) => saveSettings({ ...settings, voice: e.target.value })}
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="default">Default</option>
                      {voices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Voice Settings */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-300 mb-1">Speed: {settings.rate.toFixed(1)}</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={settings.rate}
                        onChange={(e) => saveSettings({ ...settings, rate: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-1">Pitch: {settings.pitch.toFixed(1)}</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={settings.pitch}
                        onChange={(e) => saveSettings({ ...settings, pitch: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-1">Volume: {Math.round(settings.volume * 100)}%</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.volume}
                        onChange={(e) => saveSettings({ ...settings, volume: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>

                  {/* Test TTS */}
                  <div>
                    <label className="block text-gray-300 mb-1">Test Message</label>
                    <textarea
                      value={testText}
                      onChange={(e) => setTestText(e.target.value)}
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 h-20 resize-none"
                      placeholder="Enter text to test TTS..."
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={testTTS}
                        disabled={isPlaying}
                        className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        <span>Test</span>
                      </button>
                      {isPlaying && (
                        <button
                          onClick={stopTTS}
                          className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          <Pause className="w-4 h-4" />
                          <span>Stop</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-gray-700">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-medium transition-colors"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
