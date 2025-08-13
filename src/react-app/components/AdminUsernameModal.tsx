import { useState } from 'react';
import { X, User, Check, Palette } from 'lucide-react';

interface AdminUsernameModalProps {
  user: {
    id: number;
    name: string;
    email: string;
    is_subscriber: boolean;
    name_color?: string;
  };
  onClose: () => void;
  onUpdate: () => void;
}

export default function AdminUsernameModal({ user, onClose, onUpdate }: AdminUsernameModalProps) {
  const [username, setUsername] = useState(user.name || '');
  const [nameColor, setNameColor] = useState(user.name_color || '#ffffff');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const colorPresets = [
    '#ffffff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7',
    '#a0e7e5', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
    '#c7ecee', '#dda0dd', '#98fb98', '#ffa07a', '#20b2aa', '#87ceeb'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
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
      const response = await fetch(`/api/admin/users/${user.id}/username`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          username: username.trim(),
          name_color: nameColor
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

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999999] p-4" style={{ zIndex: 999999 }}>
        <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Username Updated!</h2>
          <p className="text-gray-300">
            The user's username has been successfully updated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999999] p-4" style={{ zIndex: 999999 }}>
      <div className="bg-gray-800 rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Edit Username (Admin)</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-orange-100 mt-2">
            Editing username for: {user.email}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username *
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter username (2-30 characters)"
              maxLength={30}
              minLength={2}
            />
            <div className="text-xs text-gray-400 mt-1">
              {username.length}/30 characters • Admin can override uniqueness and cooldown
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Letters, numbers, spaces, underscores, and hyphens only
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Palette className="w-4 h-4 mr-1" />
              Name Color
              {!user.is_subscriber && (
                <span className="ml-2 text-xs text-yellow-400">User is not subscriber</span>
              )}
            </label>
            <div className="flex items-center space-x-3 mb-3">
              <input
                type="color"
                value={nameColor}
                onChange={(e) => setNameColor(e.target.value)}
                className="w-10 h-10 rounded-lg border-2 border-gray-600 bg-gray-700 cursor-pointer"
              />
              <div className="flex-1">
                <div 
                  className="text-lg font-medium px-3 py-1 rounded"
                  style={{ color: nameColor }}
                >
                  {username || 'Preview Name'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNameColor(color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    nameColor === color ? 'border-red-500 scale-110' : 'border-gray-600 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-lg mt-3">
              <p className="text-sm text-red-400">
                ⚠️ Admin Override: You can set any color regardless of subscription status.
              </p>
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
              className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all duration-200"
            >
              {isSubmitting ? 'Updating...' : 'Update Username'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
