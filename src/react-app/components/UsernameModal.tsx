import { useState } from 'react';
import { X, User, Check, Palette, Award, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@getmocha/users-service/react';
import type { ExtendedMochaUser } from '@/shared/types';

interface UsernameModalProps {
  onClose: () => void;
  onUpdate: () => void;
}

export default function UsernameModal({ onClose, onUpdate }: UsernameModalProps) {
  const { user } = useAuth();
  const extendedUser = user as ExtendedMochaUser;
  const [username, setUsername] = useState(extendedUser?.localUser?.name || extendedUser?.google_user_data?.name || '');
  const [nameColor, setNameColor] = useState(extendedUser?.localUser?.name_color || '#ffffff');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isColorSubmitting, setIsColorSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'username' | 'color' | 'badges'>('username');

  // Check if user can change name color (subscribers only)
  const canChangeColor = extendedUser?.localUser?.is_subscriber || extendedUser?.localUser?.is_admin;
  
  // Get user's badges with error handling
  const userBadges = (() => {
    try {
      return extendedUser?.localUser?.badges ? JSON.parse(extendedUser.localUser.badges) : [];
    } catch (error) {
      console.error('Error parsing user badges:', error);
      return [];
    }
  })();
  
  const displayedBadges = (() => {
    try {
      return extendedUser?.localUser?.displayed_badges ? JSON.parse(extendedUser.localUser.displayed_badges) : userBadges;
    } catch (error) {
      console.error('Error parsing displayed badges:', error);
      return userBadges;
    }
  })();
  
  const [selectedBadges, setSelectedBadges] = useState<string[]>(displayedBadges.slice(0, 3)); // Limit to 3 badges

  const colorPresets = [
    '#ffffff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7',
    '#a0e7e5', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
    '#c7ecee', '#dda0dd', '#98fb98', '#ffa07a', '#20b2aa', '#87ceeb'
  ];

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

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!username.trim()) {
      alert('Username cannot be empty');
      return;
    }

    if (username.trim().length < 2) {
      alert('Username must be at least 2 characters');
      return;
    }

    if (username.trim().length > 30) {
      alert('Username is too long (max 30 characters)');
      return;
    }

    if (!/^[a-zA-Z0-9\s_-]+$/.test(username.trim())) {
      alert('Username can only contain letters, numbers, spaces, underscores, and hyphens');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users/me/username', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          username: username.trim()
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          onUpdate();
          onClose();
        }, 1500);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update username');
      }
    } catch (error) {
      console.error('Failed to update username:', error);
      alert('Failed to update username');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleColorSubmit = async () => {
    if (isColorSubmitting || !canChangeColor) return;

    setIsColorSubmitting(true);
    try {
      const response = await fetch('/api/users/me/name-color', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          name_color: nameColor
        }),
      });

      if (response.ok) {
        onUpdate();
        alert('Name color updated successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update name color');
      }
    } catch (error) {
      console.error('Failed to update name color:', error);
      alert('Failed to update name color');
    } finally {
      setIsColorSubmitting(false);
    }
  };

  const handleBadgeSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users/me/displayed-badges', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          displayed_badges: selectedBadges
        }),
      });

      if (response.ok) {
        onUpdate();
        alert('Badge display preferences updated!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update badge preferences');
      }
    } catch (error) {
      console.error('Failed to update badge preferences:', error);
      alert('Failed to update badge preferences');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleBadge = (badgeName: string) => {
    // Verified badge always shows, can't be toggled
    if (badgeName === 'Verified') return;
    
    if (selectedBadges.includes(badgeName)) {
      setSelectedBadges(selectedBadges.filter(b => b !== badgeName));
    } else {
      // Limit to maximum of 3 badges total
      const maxBadges = 3;
      const currentCount = selectedBadges.length;
      
      if (currentCount >= maxBadges) {
        alert(`You can only display a maximum of ${maxBadges} badges at once. Please deselect another badge first.`);
        return;
      }
      
      setSelectedBadges([...selectedBadges, badgeName]);
    }
  };

  const getBadgeDisplay = (badgeName: string) => {
    const predefined = predefinedBadges.find(b => b.name === badgeName);
    return {
      icon: predefined?.icon || '🏷️',
      color: predefined?.color || 'bg-gray-600'
    };
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999999] p-4" style={{ zIndex: 999999 }}>
        <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Username Updated!</h2>
          <p className="text-gray-300">
            Your username has been successfully updated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999999] p-4" style={{ zIndex: 999999 }}>
      <div className="bg-gray-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-purple-100 mt-2">
            Customize your username, name color, and badge display
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('username')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'username'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Username
            </button>
            <button
              onClick={() => setActiveTab('color')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'color'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4 inline mr-2" />
              Color
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'badges'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4 inline mr-2" />
              Badges
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Username Tab */}
          {activeTab === 'username' && (
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Username *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your username (2-30 characters)"
                  maxLength={30}
                  minLength={2}
                />
                <div className="text-xs text-gray-400 mt-1">
                  {username.length}/30 characters • Must be unique • 30-day cooldown between changes
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Letters, numbers, spaces, underscores, and hyphens only
                </div>
              </div>

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
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all duration-200"
                >
                  {isSubmitting ? 'Updating...' : 'Update Username'}
                </button>
              </div>
            </form>
          )}

          {/* Color Tab */}
          {activeTab === 'color' && (
            <div className="space-y-4">
              {canChangeColor ? (
                <>
                  <div className="flex items-center space-x-3 mb-3">
                    <input
                      type="color"
                      value={nameColor}
                      onChange={(e) => setNameColor(e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-gray-600 bg-gray-700 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div 
                        className="text-xl font-medium px-3 py-2 rounded"
                        style={{ color: nameColor }}
                      >
                        {username || 'Preview Name'}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-2 mb-4">
                    {colorPresets.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNameColor(color)}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          nameColor === color ? 'border-purple-500 scale-110' : 'border-gray-600 hover:border-gray-500'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 mb-4">
                    💡 Name color changes are instant and unlimited for subscribers!
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleColorSubmit}
                      disabled={isColorSubmitting}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all duration-200"
                    >
                      {isColorSubmitting ? 'Updating...' : 'Update Color'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-gray-700 rounded-lg border border-yellow-500/20">
                  <p className="text-yellow-400 flex items-center mb-2">
                    <Palette className="w-5 h-5 mr-2" />
                    Name colors are available to subscribers only.
                  </p>
                  <p className="text-gray-400 text-sm">
                    Subscribe to unlock custom name colors and change them anytime!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <div className="space-y-4">
              <div className="text-center text-gray-400 text-sm mb-4">
                Choose which badges to display in chat (max 3). Verified badge always shows.
              </div>
              
              {userBadges.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>You don't have any badges yet.</p>
                  <p className="text-sm">Badges are awarded by moderators and admins.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {userBadges.map((badgeName: string) => {
                      const badge = getBadgeDisplay(badgeName);
                      const isSelected = selectedBadges.includes(badgeName);
                      const isVerified = badgeName === 'Verified';
                      
                      return (
                        <button
                          key={badgeName}
                          onClick={() => toggleBadge(badgeName)}
                          disabled={isVerified}
                          className={`flex items-center space-x-2 p-3 rounded-lg font-medium transition-all ${
                            isSelected
                              ? `${badge.color} text-white`
                              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          } ${isVerified ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          <span className="text-lg">{badge.icon}</span>
                          <span className="flex-1 text-left">{badgeName}</span>
                          {isSelected ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                          {isVerified && (
                            <span className="text-xs bg-cyan-700 px-1 rounded">Always</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBadgeSubmit}
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all duration-200"
                    >
                      {isSubmitting ? 'Updating...' : 'Update Badges'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
