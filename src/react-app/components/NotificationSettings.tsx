import { Settings, Volume2, VolumeX, Bell } from 'lucide-react';
import { useAuth } from '@getmocha/users-service/react';
import { useNotifications } from '@/react-app/hooks/useNotifications';
import { createPortal } from 'react-dom';
import type { ExtendedMochaUser } from '@/shared/types';

interface NotificationSettingsProps {
  onClose: () => void;
}

export default function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const { user } = useAuth();
  const extendedUser = user as ExtendedMochaUser;
  const { settings, updateSettings, playSound } = useNotifications();
  
  
  // Check if user has elevated permissions (admin or moderator)
  const canAccessTestNotifications = extendedUser?.localUser?.is_admin || extendedUser?.localUser?.is_moderator;

  const handleVolumeChange = (type: 'donationVolume' | 'chatVolume' | 'systemVolume', value: number) => {
    updateSettings({ [type]: value });
  };

  const handleToggleMute = (soundType: string) => {
    const isMuted = settings.mutedSounds.includes(soundType);
    const newMutedSounds = isMuted
      ? settings.mutedSounds.filter(s => s !== soundType)
      : [...settings.mutedSounds, soundType];
    
    updateSettings({ mutedSounds: newMutedSounds });
  };

  const handleTestSound = async (soundType: string) => {
    try {
      console.log(`🧪 Testing sound: ${soundType}`);
      
      // Ensure audio is initialized before playing
      if (!settings.audioEnabled) {
        alert('Audio is disabled. Please enable audio notifications first.');
        return;
      }

      if (settings.mutedSounds.includes(soundType)) {
        alert(`${soundType} sound is muted. Please unmute it to test.`);
        return;
      }

      // Get the button that was clicked for visual feedback
      const button = document.activeElement as HTMLButtonElement;
      const originalText = button?.textContent || 'Test';
      
      if (button) {
        button.textContent = '♪ Playing...';
        button.disabled = true;
      }

      // Play the sound with appropriate volume
      let volume = settings.systemVolume;
      if (soundType === 'donation' || soundType === 'subscription' || soundType === 'points_purchase' || soundType === 'level_up') {
        volume = settings.donationVolume;
      } else if (soundType === 'chat_mention' || soundType === 'system') {
        volume = settings.chatVolume;
      }

      console.log(`🔊 Playing ${soundType} sound at volume ${volume}`);
      await playSound(soundType, volume);
      
      // Restore button after sound plays
      setTimeout(() => {
        if (button) {
          button.textContent = originalText;
          button.disabled = false;
        }
      }, 1500);
      
      console.log(`✅ Successfully played ${soundType} sound`);
      
    } catch (error) {
      console.error(`❌ Failed to test ${soundType} sound:`, error);
      
      // Restore button on error
      const button = document.activeElement as HTMLButtonElement;
      if (button) {
        button.textContent = 'Test';
        button.disabled = false;
      }
      
      alert(`Failed to play ${soundType} sound. Please check your audio settings and try again.`);
    }
  };

  

  const soundTypes = [
    { id: 'donation', label: 'Donations', description: 'When someone donates money' },
    { id: 'subscription', label: 'Subscriptions', description: 'When someone subscribes' },
    { id: 'points_purchase', label: 'Points Purchase', description: 'When someone buys points' },
    { id: 'level_up', label: 'Level Up', description: 'When you or others level up' },
    { id: 'chat_mention', label: 'Chat Mentions', description: 'When someone mentions you' },
    { id: 'admin_alert', label: 'Admin Alerts', description: 'Important administrative messages' },
    { id: 'system', label: 'Chat Messages', description: 'When others send chat messages' },
  ];

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[999999]">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Notification Settings</h2>
                <p className="text-blue-100">Customize your notification experience</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Global Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-400" />
              <span>Global Settings</span>
            </h3>

            <div className="space-y-3">
              {/* Audio Enabled */}
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  {settings.audioEnabled ? (
                    <Volume2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-red-400" />
                  )}
                  <div>
                    <div className="font-medium text-white">Audio Notifications</div>
                    <div className="text-sm text-gray-400">Play sounds for notifications</div>
                  </div>
                </div>
                <button
                  onClick={() => updateSettings({ audioEnabled: !settings.audioEnabled })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.audioEnabled ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.audioEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              
            </div>
          </div>

          {/* Volume Controls */}
          {settings.audioEnabled && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-blue-400" />
                <span>Volume Controls</span>
              </h3>

              <div className="space-y-3">
                <div className="p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-medium text-white">Donation Volume</label>
                    <span className="text-sm text-gray-400">{Math.round(settings.donationVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.donationVolume}
                    onChange={(e) => handleVolumeChange('donationVolume', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none slider"
                  />
                </div>

                <div className="p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-medium text-white">Chat Volume</label>
                    <span className="text-sm text-gray-400">{Math.round(settings.chatVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.chatVolume}
                    onChange={(e) => handleVolumeChange('chatVolume', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none slider"
                  />
                </div>

                <div className="p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-medium text-white">System Volume</label>
                    <span className="text-sm text-gray-400">{Math.round(settings.systemVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.systemVolume}
                    onChange={(e) => handleVolumeChange('systemVolume', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none slider"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Individual Sound Settings */}
          {settings.audioEnabled && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Individual Sounds</h3>

              <div className="space-y-2">
                {soundTypes.map((sound) => {
                  const isMuted = settings.mutedSounds.includes(sound.id);
                  
                  return (
                    <div key={sound.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-white">{sound.label}</div>
                        <div className="text-sm text-gray-400">{sound.description}</div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTestSound(sound.id)}
                          disabled={!settings.audioEnabled}
                          className={`text-sm px-3 py-1 rounded transition-colors ${
                            settings.audioEnabled 
                              ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          }`}
                          title={settings.audioEnabled ? 'Test this sound' : 'Enable audio to test sounds'}
                        >
                          Test
                        </button>
                        
                        <button
                          onClick={() => handleToggleMute(sound.id)}
                          className={`p-2 rounded transition-colors ${
                            isMuted 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                          title={isMuted ? 'Unmute this sound' : 'Mute this sound'}
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Test Notifications - Only for Admins/Moderators */}
          {canAccessTestNotifications && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Test Notifications</h3>
              <div className="text-sm text-gray-400 mb-4">
                Admin/Moderator only: Test notification sounds and effects
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleTestSound('donation')}
                  className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Test Donation
                </button>
                <button
                  onClick={() => handleTestSound('subscription')}
                  className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Test Subscription
                </button>
                <button
                  onClick={() => handleTestSound('points_purchase')}
                  className="p-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  Test Points
                </button>
                <button
                  onClick={() => handleTestSound('level_up')}
                  className="p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  Test Level Up
                </button>
                <button
                  onClick={() => handleTestSound('chat_mention')}
                  className="p-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                >
                  Test Mention
                </button>
                <button
                  onClick={() => handleTestSound('admin_alert')}
                  className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Test Admin Alert
                </button>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="pt-4 border-t border-gray-600">
            <button
              onClick={onClose}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white py-3 px-4 rounded-lg transition-colors"
            >
              Close Settings
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>,
    document.body
  );
}
