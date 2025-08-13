import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate, Link } from 'react-router';
import { Shield, Users, DollarSign, ArrowLeft, Crown, Ban, CheckCircle, Award } from 'lucide-react';
import BadgeModal from '@/react-app/components/BadgeModal';
import type { LocalUser, Donation, ExtendedMochaUser } from '@/shared/types';

export default function Moderator() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const extendedUser = user as ExtendedMochaUser;
  const [users, setUsers] = useState<LocalUser[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'donations'>('users');
  const [isLoading, setIsLoading] = useState(true);
  const [showBadgeModal, setShowBadgeModal] = useState<{ userId: number; username: string; badges: string[] } | null>(null);

  useEffect(() => {
    if (!isPending && (!user || (!extendedUser.localUser?.is_moderator && !extendedUser.localUser?.is_admin))) {
      navigate('/');
      return;
    }

    if (extendedUser?.localUser?.is_moderator || extendedUser?.localUser?.is_admin) {
      fetchData();
    }
  }, [user, isPending, navigate, extendedUser]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersResponse, donationsResponse] = await Promise.all([
        fetch('/api/moderator/users', { credentials: 'include' }),
        fetch('/api/moderator/donations', { credentials: 'include' }),
      ]);

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      if (donationsResponse.ok) {
        const donationsData = await donationsResponse.json();
        setDonations(donationsData);
      }
    } catch (error) {
      console.error('Failed to fetch moderator data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const moderateUser = async (userId: number, updates: { is_banned?: boolean; is_subscriber?: boolean; is_moderator?: boolean }) => {
    try {
      const response = await fetch(`/api/moderator/users/${userId}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Failed to moderate user:', error);
      alert('Failed to update user');
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!extendedUser?.localUser?.is_moderator && !extendedUser?.localUser?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this area.</p>
          <Link to="/" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const totalDonations = donations.reduce((sum, donation) => sum + donation.amount, 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Stream</span>
              </Link>
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-blue-500" />
                <h1 className="text-2xl font-bold">Moderator Dashboard</h1>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Welcome, {user?.google_user_data.name || user?.email}
              {extendedUser?.localUser?.is_admin && (
                <Link
                  to="/admin"
                  className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs"
                >
                  Full Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-gray-400">Total Users</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.is_subscriber).length}</p>
                <p className="text-gray-400">Subscribers</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">${totalDonations.toFixed(2)}</p>
                <p className="text-gray-400">Total Donations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg">
          <div className="border-b border-gray-700">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                Users ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('donations')}
                className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'donations'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-5 h-5 inline mr-2" />
                Donations ({donations.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'users' && (
              <div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Badges</th>
                        <th className="text-left py-3 px-4">Joined</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className={`border-b border-gray-700 hover:bg-gray-700 ${user.is_banned ? 'opacity-75' : ''}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              {user.picture ? (
                                <img src={user.picture} alt="" className={`w-8 h-8 rounded-full ${user.is_banned ? 'grayscale' : ''}`} />
                              ) : (
                                <div className={`w-8 h-8 bg-gray-600 rounded-full ${user.is_banned ? 'opacity-50' : ''}`}></div>
                              )}
                              <span className={user.is_banned ? 'line-through text-gray-500' : ''}>{user.name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              {user.is_admin && (
                                <span className="px-2 py-1 bg-red-600 text-xs rounded">ADMIN</span>
                              )}
                              {user.is_moderator && (
                                <span className="px-2 py-1 bg-blue-600 text-xs rounded">MOD</span>
                              )}
                              {user.is_subscriber && (
                                <div title="Subscriber" className="flex items-center">
                                  <Crown className="w-4 h-4 text-purple-400" />
                                </div>
                              )}
                              {user.is_banned && (
                                <span className="px-2 py-1 bg-gray-600 text-xs rounded">BANNED</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {user.badges ? JSON.parse(user.badges).map((badge: string) => {
                                const getBadgeIcon = (badgeName: string) => {
                                  const iconMap: { [key: string]: string } = {
                                    'VIP': '⭐',
                                    'Moderator': '🛡️',
                                    'Supporter': '💎',
                                    'OG': '👑',
                                    'Verified': '✓',
                                    'Artist': '🎨',
                                    'DJ': '🎵',
                                    'Gamer': '🎮',
                                  };
                                  return iconMap[badgeName] || '🏷️';
                                };

                                const getBadgeColor = (badgeName: string) => {
                                  const colorMap: { [key: string]: string } = {
                                    'VIP': 'bg-yellow-600',
                                    'Moderator': 'bg-green-600',
                                    'Supporter': 'bg-blue-600',
                                    'OG': 'bg-purple-600',
                                    'Verified': 'bg-cyan-600',
                                    'Artist': 'bg-pink-600',
                                    'DJ': 'bg-orange-600',
                                    'Gamer': 'bg-red-600',
                                  };
                                  return colorMap[badgeName] || 'bg-gray-600';
                                };

                                return (
                                  <div
                                    key={badge}
                                    className={`flex items-center px-2 py-1 ${getBadgeColor(badge)} text-white text-xs rounded font-medium`}
                                    title={badge}
                                  >
                                    <span className="mr-1">{getBadgeIcon(badge)}</span>
                                    <span>{badge}</span>
                                  </div>
                                );
                              }) : (
                                <span className="text-gray-500 text-xs">No badges</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-400 text-sm">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {!user.is_admin && (
                              <div className="flex space-x-1">
                                {/* Only admins can assign moderator role */}
                                {extendedUser?.localUser?.is_admin && (
                                  <button
                                    onClick={() => moderateUser(user.id, { is_moderator: !user.is_moderator })}
                                    className={`p-1 rounded ${
                                      user.is_moderator
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'bg-gray-600 hover:bg-gray-500'
                                    }`}
                                    title={user.is_moderator ? 'Remove Moderator' : 'Make Moderator'}
                                  >
                                    <Shield className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => moderateUser(user.id, { is_banned: !user.is_banned })}
                                  className={`p-1 rounded ${
                                    user.is_banned
                                      ? 'bg-green-600 hover:bg-green-700'
                                      : 'bg-red-600 hover:bg-red-700'
                                  }`}
                                  title={user.is_banned ? 'Unban User' : 'Ban User'}
                                >
                                  {user.is_banned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => setShowBadgeModal({
                                    userId: user.id,
                                    username: user.name || user.email,
                                    badges: user.badges ? JSON.parse(user.badges) : []
                                  })}
                                  className="p-1 rounded bg-yellow-600 hover:bg-yellow-700"
                                  title="Manage Badges"
                                >
                                  <Award className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'donations' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">Donor</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Message</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((donation) => (
                      <tr key={donation.id} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="py-3 px-4">
                          {donation.is_anonymous ? (
                            <span className="text-gray-400">Anonymous</span>
                          ) : (
                            donation.donor_name
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-green-400">
                          ${donation.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-gray-300 max-w-xs truncate">
                          {donation.message || <span className="text-gray-500">No message</span>}
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          {new Date(donation.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded ${
                            donation.status === 'completed' 
                              ? 'bg-green-600' 
                              : 'bg-yellow-600'
                          }`}>
                            {donation.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Badge Modal */}
      {showBadgeModal && (
        <BadgeModal
          userId={showBadgeModal.userId}
          username={showBadgeModal.username}
          currentBadges={showBadgeModal.badges}
          onClose={() => setShowBadgeModal(null)}
          onUpdate={() => {
            fetchData();
            setShowBadgeModal(null);
          }}
        />
      )}
    </div>
  );
}
