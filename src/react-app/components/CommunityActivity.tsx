import { useState, useEffect } from 'react';
import { Heart, Users, DollarSign, MessageCircle, TrendingUp, Sparkles } from 'lucide-react';

interface RecentActivity {
  id: number;
  type: 'donation' | 'follower' | 'message' | 'subscriber';
  username: string;
  amount?: number;
  message?: string;
  timestamp: string;
}

export default function CommunityActivity() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    recentFollowers: 0,
    messagesCount: 0,
    subscribers: 0,
  });

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/community/recent-activity');
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Failed to fetch community activity:', error);
      // Set some mock data for demonstration
      setActivities([
        {
          id: 1,
          type: 'donation',
          username: 'GamerGirl123',
          amount: 25,
          message: 'Love the stream! Keep it up! 🔥',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          type: 'follower',
          username: 'StreamFan42',
          timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          type: 'subscriber',
          username: 'VaultSupporter',
          timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        },
        {
          id: 4,
          type: 'donation',
          username: 'Anonymous',
          amount: 10,
          message: 'Thanks for the entertainment!',
          timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        },
        {
          id: 5,
          type: 'message',
          username: 'ChatMaster',
          message: 'First time watching, this is awesome!',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
      ]);
      setStats({
        totalDonations: 147,
        recentFollowers: 23,
        messagesCount: 1842,
        subscribers: 8,
      });
    }
  };

  useEffect(() => {
    fetchRecentActivity();
    const interval = setInterval(fetchRecentActivity, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return <DollarSign className="w-4 h-4 text-green-400" />;
      case 'follower':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'subscriber':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'message':
        return <MessageCircle className="w-4 h-4 text-cyan-400" />;
      default:
        return <Heart className="w-4 h-4 text-pink-400" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'donation':
        return 'border-green-500/30 bg-green-500/10';
      case 'follower':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'subscriber':
        return 'border-purple-500/30 bg-purple-500/10';
      case 'message':
        return 'border-cyan-500/30 bg-cyan-500/10';
      default:
        return 'border-pink-500/30 bg-pink-500/10';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
            <span>Community Activity</span>
          </h2>
          <div className="text-purple-100 text-sm">
            Live Updates
          </div>
        </div>
        <p className="text-purple-100 text-sm mt-1">
          See what's happening in the Vaultkeeper community right now!
        </p>
      </div>

      <div className="p-4 md:p-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg border border-gray-600 p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-xs text-gray-400">Donations</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-green-400">${stats.totalDonations}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg border border-gray-600 p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-blue-400 mr-1" />
              <span className="text-xs text-gray-400">Followers</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-blue-400">+{stats.recentFollowers}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg border border-gray-600 p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <MessageCircle className="w-4 h-4 text-cyan-400 mr-1" />
              <span className="text-xs text-gray-400">Messages</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-cyan-400">{stats.messagesCount}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg border border-gray-600 p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Sparkles className="w-4 h-4 text-purple-400 mr-1" />
              <span className="text-xs text-gray-400">Subscribers</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-purple-400">{stats.subscribers}</div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Heart className="w-5 h-5 text-pink-400" />
            <span>Recent Activity</span>
          </h3>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400">No recent activity</p>
                <p className="text-sm text-gray-500">Activity will appear here as it happens!</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${getActivityColor(activity.type)} transition-all duration-200 hover:scale-105`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white text-sm">
                          {activity.username}
                        </span>
                        {activity.type === 'donation' && activity.amount && (
                          <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                            ${activity.amount}
                          </span>
                        )}
                        {activity.type === 'subscriber' && (
                          <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                            Premium
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-300 mt-1">
                      {activity.type === 'donation' && 'made a donation'}
                      {activity.type === 'follower' && 'started following'}
                      {activity.type === 'subscriber' && 'became a premium subscriber'}
                      {activity.type === 'message' && 'sent a message'}
                    </div>
                    
                    {activity.message && (
                      <div className="text-sm text-gray-200 mt-2 bg-gray-700/50 rounded px-2 py-1">
                        "{activity.message}"
                      </div>
                    )}
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
