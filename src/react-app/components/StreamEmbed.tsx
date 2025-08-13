import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { Tv, ExternalLink, Play, AlertCircle, Ban } from 'lucide-react';
import type { ExtendedMochaUser } from '@/shared/types';

interface StreamSettings {
  stream_source: 'kick' | 'twitch' | 'youtube';
  custom_stream_url?: string;
}

export default function StreamEmbed() {
  const { user } = useAuth();
  const extendedUser = user as ExtendedMochaUser;
  const [streamStatus, setStreamStatus] = useState<'live' | 'offline' | 'loading' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [streamSettings, setStreamSettings] = useState<StreamSettings>({ stream_source: 'kick' });
  const maxRetries = 3;

  // Check if user is banned
  const isBanned = extendedUser?.localUser?.is_banned;

  useEffect(() => {
    const fetchStreamSettings = async () => {
      try {
        const response = await fetch('/api/stream-settings');
        if (response.ok) {
          const settings = await response.json();
          setStreamSettings(settings);
        }
      } catch (error) {
        console.error('Error fetching stream settings:', error);
      }
    };

    fetchStreamSettings();
    // Poll for stream settings changes every 60 seconds
    const interval = setInterval(fetchStreamSettings, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkStreamStatus = async () => {
      try {
        // For production, show the stream embed by default
        // Let the respective platforms handle live/offline status within the iframe
        setStreamStatus('live');
      } catch (error) {
        console.error('Error checking stream status:', error);
        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000);
        } else {
          setStreamStatus('error');
        }
      }
    };

    checkStreamStatus();
  }, [retryCount, streamSettings]);

  // Show ban screen if user is banned
  if (isBanned) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-red-900 to-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-16 h-16 bg-red-500 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-12 h-12 bg-red-400 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-red-600 rounded-full animate-pulse delay-500"></div>
        </div>

        <div className="text-center z-10 max-w-md px-6">
          <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Ban className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-red-400 mb-4">You Have Been Banned</h2>
          <p className="text-red-200 text-lg mb-6 font-medium">
            🌱 Go touch some grass 🌱
          </p>
          <p className="text-gray-300 text-sm mb-8">
            Your access to the stream has been restricted. If you believe this is a mistake, please contact the moderation team.
          </p>

          <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4">
            <p className="text-red-200 text-xs">
              📧 Appeal your ban by contacting support
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (streamStatus === 'loading') {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
          <p className="text-white">Loading stream...</p>
          {retryCount > 0 && (
            <p className="text-gray-400 text-sm mt-2">
              Retry attempt {retryCount}/{maxRetries}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (streamStatus === 'error') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-red-900/50 to-gray-900 flex items-center justify-center relative overflow-hidden">
        <div className="text-center z-10 max-w-md px-6">
          <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">Stream Unavailable</h2>
          <p className="text-gray-300 mb-6">
            There was an issue loading the stream. Please try refreshing or check out other platforms!
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                setStreamStatus('loading');
                setRetryCount(0);
              }}
              className="w-full flex items-center justify-center space-x-3 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              <span>Retry Stream</span>
            </button>

            <a
              href="https://kick.com/vaultkeeper"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-3 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              <Play className="w-5 h-5" />
              <span>Watch on Kick</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (streamStatus === 'offline') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"></div>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-purple-500/30 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-pink-500/30 rounded-full"></div>
        </div>

        <div className="text-center z-10 max-w-md px-6">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Tv className="w-10 h-10 text-gray-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">Stream Currently Offline</h2>
          <p className="text-gray-300 mb-6">
            Vaultkeeper isn't streaming right now, but you can catch the action on other platforms!
          </p>

          <div className="space-y-3">
            <a
              href="https://kick.com/vaultkeeper"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-3 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              <Play className="w-5 h-5" />
              <span>Watch on Kick</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href="https://twitch.tv/vaultkeeperirl"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-3 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              <Play className="w-5 h-5" />
              <span>Watch on Twitch</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <p className="text-sm text-gray-400 mt-4">
            🔔 Follow on social media for stream notifications!
          </p>
        </div>
      </div>
    );
  }

  // Helper function to get stream embed URL
  const getStreamEmbedUrl = () => {
    switch (streamSettings.stream_source) {
      case 'kick':
        return 'https://player.kick.com/vaultkeeper';
      case 'twitch':
        return 'https://player.twitch.tv/?channel=vaultkeeperirl&parent=vaultkeeper.live&parent=localhost';
      case 'youtube':
        if (streamSettings.custom_stream_url) {
          // Convert YouTube URL to embed format
          const url = streamSettings.custom_stream_url;
          
          // Handle different YouTube URL formats
          if (url.includes('youtube.com/watch?v=')) {
            const videoId = url.split('v=')[1]?.split('&')[0];
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
          } else if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1]?.split('?')[0];
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
          } else if (url.includes('youtube.com/embed/')) {
            return url.includes('?') ? `${url}&autoplay=1&mute=1` : `${url}?autoplay=1&mute=1`;
          }
        }
        return 'https://player.kick.com/vaultkeeper'; // Fallback
      default:
        return 'https://player.kick.com/vaultkeeper';
    }
  };

  // Helper function to get platform display name
  const getPlatformName = () => {
    switch (streamSettings.stream_source) {
      case 'kick': return 'Kick';
      case 'twitch': return 'Twitch';
      case 'youtube': return 'YouTube';
      default: return 'Kick';
    }
  };

  // If stream is live, show embedded player
  return (
    <div className="w-full h-full bg-black relative">
      {/* Embedded stream (when live) */}
      <iframe
        src={getStreamEmbedUrl()}
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        allowFullScreen
        className="w-full h-full"
        title={`Vaultkeeper Live Stream - ${getPlatformName()}`}
        loading="lazy"
        onError={() => setStreamStatus('error')}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />

      {/* Platform indicator */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            streamSettings.stream_source === 'kick' ? 'bg-green-500' :
            streamSettings.stream_source === 'twitch' ? 'bg-purple-500' :
            'bg-red-500'
          }`}></div>
          <span className="text-white text-sm font-medium">{getPlatformName()}</span>
        </div>
      </div>
    </div>
  );
}
