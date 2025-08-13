import { useState, useEffect } from 'react';
import { X, Tv, ExternalLink, Save } from 'lucide-react';

interface StreamSourceModalProps {
  onClose: () => void;
  onUpdate: () => void;
}

interface StreamSettings {
  stream_source: 'kick' | 'twitch' | 'youtube';
  custom_stream_url?: string;
}

export default function StreamSourceModal({ onClose, onUpdate }: StreamSourceModalProps) {
  const [streamSource, setStreamSource] = useState<'kick' | 'twitch' | 'youtube'>('kick');
  const [customUrl, setCustomUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCurrentSettings();
  }, []);

  const fetchCurrentSettings = async () => {
    try {
      const response = await fetch('/api/admin/stream-settings', {
        credentials: 'include'
      });

      if (response.ok) {
        const settings: StreamSettings = await response.json();
        setStreamSource(settings.stream_source || 'kick');
        setCustomUrl(settings.custom_stream_url || '');
      }
    } catch (error) {
      console.error('Failed to fetch stream settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (streamSource === 'youtube' && !customUrl.trim()) {
      alert('Please provide a YouTube stream URL');
      return;
    }

    if (customUrl && streamSource === 'youtube') {
      // Basic YouTube URL validation
      const youtubeRegex = /^https:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)/;
      if (!youtubeRegex.test(customUrl.trim())) {
        alert('Please provide a valid YouTube URL');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/stream-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          stream_source: streamSource,
          custom_stream_url: streamSource === 'youtube' ? customUrl.trim() : null
        }),
      });

      if (response.ok) {
        alert('Stream source updated successfully! All viewers will now see the new stream.');
        onUpdate();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update stream source');
      }
    } catch (error) {
      console.error('Failed to update stream source:', error);
      alert('Failed to update stream source');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999999]" style={{ zIndex: 999999 }}>
        <div className="bg-gray-800 rounded-lg p-8">
          <div className="animate-spin mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
          <p className="text-white text-center">Loading stream settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999999] p-4" style={{ zIndex: 999999 }}>
      <div className="bg-gray-800 rounded-lg max-w-lg w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Tv className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Stream Source Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-blue-100 mt-2">
            Choose the stream source that all viewers will see
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Stream Source Options */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Select Stream Source
            </label>
            
            <div className="space-y-3">
              {/* Kick Option */}
              <label className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                <input
                  type="radio"
                  name="streamSource"
                  value="kick"
                  checked={streamSource === 'kick'}
                  onChange={(e) => setStreamSource(e.target.value as 'kick')}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">Kick</span>
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Default</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    Stream from kick.com/vaultkeeper
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </label>

              {/* Twitch Option */}
              <label className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                <input
                  type="radio"
                  name="streamSource"
                  value="twitch"
                  checked={streamSource === 'twitch'}
                  onChange={(e) => setStreamSource(e.target.value as 'twitch')}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">Twitch</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    Stream from twitch.tv/vaultkeeperirl
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </label>

              {/* YouTube Option */}
              <label className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                <input
                  type="radio"
                  name="streamSource"
                  value="youtube"
                  checked={streamSource === 'youtube'}
                  onChange={(e) => setStreamSource(e.target.value as 'youtube')}
                  className="w-4 h-4 text-red-600 focus:ring-red-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">YouTube (Custom)</span>
                    <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">Unlisted</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    Custom YouTube stream URL (unlisted streams supported)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Custom URL Input */}
          {streamSource === 'youtube' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                YouTube Stream URL *
              </label>
              <input
                type="url"
                required
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
              />
              <div className="text-xs text-gray-400 mt-1">
                Supports youtube.com/watch, youtube.com/embed, and youtu.be URLs
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">Important Notes</h4>
            <ul className="text-xs text-blue-100 space-y-1">
              <li>• Changes apply immediately to all viewers</li>
              <li>• YouTube streams can be public, unlisted, or private</li>
              <li>• Kick and Twitch use official embed players</li>
              <li>• Only admins can change stream sources</li>
            </ul>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Updating...' : 'Update Stream Source'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
