import { useState } from 'react';
import { X, Award, Plus, Save } from 'lucide-react';

interface BadgeModalProps {
  userId: number;
  username: string;
  currentBadges: string[];
  onClose: () => void;
  onUpdate: () => void;
}

export default function BadgeModal({ userId, username, currentBadges, onClose, onUpdate }: BadgeModalProps) {
  const [badges, setBadges] = useState<string[]>(currentBadges || []);
  const [newBadge, setNewBadge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const predefinedBadges = [
    { name: 'VIP', color: 'bg-yellow-600', icon: '⭐' },
    { name: 'Moderator', color: 'bg-green-600', icon: '🛡️' },
    { name: 'Supporter', color: 'bg-blue-600', icon: '💎' },
    { name: 'OG', color: 'bg-purple-600', icon: '👑' },
    { name: 'Verified', color: 'bg-cyan-600', icon: '✓' },
    { name: 'Artist', color: 'bg-pink-600', icon: '🎨' },
    { name: 'DJ', color: 'bg-orange-600', icon: '🎵' },
    { name: 'Gamer', color: 'bg-red-600', icon: '🎮' },
  ];

  const addBadge = (badgeName: string) => {
    if (!badges.includes(badgeName)) {
      setBadges([...badges, badgeName]);
    }
  };

  const removeBadge = (badgeName: string) => {
    setBadges(badges.filter(b => b !== badgeName));
  };

  const addCustomBadge = () => {
    if (newBadge.trim() && !badges.includes(newBadge.trim())) {
      setBadges([...badges, newBadge.trim()]);
      setNewBadge('');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/badges`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ badges }),
      });

      if (response.ok) {
        onUpdate();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update badges');
      }
    } catch (error) {
      console.error('Failed to update badges:', error);
      alert('Failed to update badges');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999999] p-4" style={{ zIndex: 999999 }}>
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Award className="w-6 h-6 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Manage Badges</h2>
                <p className="text-yellow-100">For user: {username}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Current Badges */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Current Badges</h3>
            <div className="flex flex-wrap gap-2">
              {badges.length === 0 ? (
                <p className="text-gray-400">No badges assigned</p>
              ) : (
                badges.map((badge) => {
                  const predefined = predefinedBadges.find(b => b.name === badge);
                  const badgeIcon = predefined?.icon || '🏷️';
                  const badgeColor = predefined?.color || 'bg-gray-600';
                  
                  return (
                    <div
                      key={badge}
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-white ${badgeColor}`}
                    >
                      <span className="text-sm">{badgeIcon}</span>
                      <span className="text-sm font-medium">{badge}</span>
                      <button
                        onClick={() => removeBadge(badge)}
                        className="hover:bg-black/20 rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Predefined Badges */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Available Badges</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {predefinedBadges.map((badge) => (
                <button
                  key={badge.name}
                  onClick={() => addBadge(badge.name)}
                  disabled={badges.includes(badge.name)}
                  className={`flex items-center space-x-2 p-3 rounded-lg font-medium transition-colors ${
                    badges.includes(badge.name)
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : `${badge.color} hover:opacity-80 text-white`
                  }`}
                >
                  <span>{badge.icon}</span>
                  <span className="text-sm">{badge.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Badge */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Add Custom Badge</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                placeholder="Enter custom badge name"
                className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                maxLength={20}
                onKeyPress={(e) => e.key === 'Enter' && addCustomBadge()}
              />
              <button
                onClick={addCustomBadge}
                disabled={!newBadge.trim()}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
