import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate, Link } from 'react-router';
import { Shield, Users, DollarSign, ArrowLeft, Crown, Ban, CheckCircle, Mail, Award, Gift, ExternalLink, TestTube, Send, Trash2, Edit, Coins, Tv } from 'lucide-react';
import BadgeModal from '@/react-app/components/BadgeModal';
import AdminUsernameModal from '@/react-app/components/AdminUsernameModal';
import AdminPointsModal from '@/react-app/components/AdminPointsModal';
import StreamSourceModal from '@/react-app/components/StreamSourceModal';
import type { LocalUser, Donation, ExtendedMochaUser } from '@/shared/types';

export default function Admin() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const extendedUser = user as ExtendedMochaUser;
  const [users, setUsers] = useState<LocalUser[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'donations' | 'test-alerts' | 'stream-settings'>('users');
  const [isLoading, setIsLoading] = useState(true);
  const [showBadgeModal, setShowBadgeModal] = useState<{ userId: number; username: string; badges: string[] } | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState<{ 
    id: number; 
    name: string; 
    email: string; 
    is_subscriber: boolean; 
    name_color?: string; 
  } | null>(null);
  const [showPointsModal, setShowPointsModal] = useState<{
    id: number;
    name: string;
    email: string;
    points_balance?: number;
    points_earned_total?: number;
  } | null>(null);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [testDonation, setTestDonation] = useState({ donor_name: 'Test Donor', amount: 5.00, message: 'This is a test donation!' });
  const [testSending, setTestSending] = useState(false);

  useEffect(() => {
    if (!isPending && (!user || !extendedUser.localUser?.is_admin)) {
      navigate('/');
      return;
    }

    if (extendedUser?.localUser?.is_admin) {
      fetchData();
    }
  }, [user, isPending, navigate, extendedUser]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersResponse, donationsResponse] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/admin/donations', { credentials: 'include' }),
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
      console.error('Failed to fetch admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const grantFreeSubscription = async (userId: number) => {
    if (!confirm('Grant free lifetime subscription to this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/grant-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        fetchData(); // Refresh data
        alert('Free lifetime subscription granted successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to grant subscription');
      }
    } catch (error) {
      console.error('Failed to grant subscription:', error);
      alert('Failed to grant subscription');
    }
  };

  const moderateUser = async (userId: number, updates: { is_banned?: boolean; is_subscriber?: boolean; is_moderator?: boolean }) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/moderate`, {
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
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Failed to moderate user:', error);
      alert('Failed to update user');
    }
  };

  const verifyDonation = async (donationId: number) => {
    if (!confirm('Verify this donation and post message to chat? Only do this after confirming payment was received.')) return;

    try {
      const response = await fetch(`/api/admin/donations/${donationId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        fetchData(); // Refresh data
        alert('Donation verified and message posted to chat! 🎉');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to verify donation');
      }
    } catch (error) {
      console.error('Failed to verify donation:', error);
      alert('Failed to verify donation');
    }
  };

  const deleteDonation = async (donationId: number) => {
    if (!confirm('Are you sure you want to delete this donation? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/donations/${donationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        fetchData(); // Refresh data
        alert('Donation deleted successfully');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete donation');
      }
    } catch (error) {
      console.error('Failed to delete donation:', error);
      alert('Failed to delete donation');
    }
  };

  const sendTestDonation = async () => {
    if (testSending) return;
    
    setTestSending(true);
    try {
      const response = await fetch('/api/admin/test-donation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(testDonation),
      });

      if (response.ok) {
        alert('Test donation sent! Check your OBS alerts overlay.');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send test donation');
      }
    } catch (error) {
      console.error('Failed to send test donation:', error);
      alert('Failed to send test donation');
    } finally {
      setTestSending(false);
    }
  };

  const sendTestSubscription = async () => {
    if (testSending) return;
    
    setTestSending(true);
    try {
      const response = await fetch('/api/admin/test-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username: 'Test Subscriber' }),
      });

      if (response.ok) {
        alert('Test subscription sent! Check your OBS alerts overlay.');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send test subscription');
      }
    } catch (error) {
      console.error('Failed to send test subscription:', error);
      alert('Failed to send test subscription');
    } finally {
      setTestSending(false);
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!extendedUser?.localUser?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this area.</p>
          <Link to="/" className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const totalDonations = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const emailList = users.map(u => u.email).join(', ');

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
                <Shield className="w-6 h-6 text-red-500" />
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex space-x-2">
                <a
                  href="/obs-overlay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>OBS Overlay</span>
                </a>
                <a
                  href="/obs-alerts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>OBS Alerts</span>
                </a>
                <a
                  href="/obs-panel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>OBS Panel</span>
                </a>
              </div>
              <div className="text-sm text-gray-400">
                Welcome, {user?.google_user_data.name || user?.email}
              </div>
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
                    ? 'border-purple-500 text-purple-400'
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
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-5 h-5 inline mr-2" />
                Donations ({donations.length})
              </button>
              <button
                onClick={() => setActiveTab('test-alerts')}
                className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'test-alerts'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <TestTube className="w-5 h-5 inline mr-2" />
                Test Alerts
              </button>
              <button
                onClick={() => setActiveTab('stream-settings')}
                className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'stream-settings'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Tv className="w-5 h-5 inline mr-2" />
                Stream Settings
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'users' && (
              <div>
                {/* Email List Export */}
                <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium flex items-center space-x-2">
                      <Mail className="w-5 h-5" />
                      <span>Email List</span>
                    </h3>
                    <button
                      onClick={() => navigator.clipboard.writeText(emailList)}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                    >
                      Copy All
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={emailList}
                    className="w-full h-20 bg-gray-800 text-gray-300 rounded p-2 text-sm"
                  />
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Email</th>
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
                              <button
                                onClick={() => setShowPointsModal({
                                  id: user.id,
                                  name: user.name || 'Unknown',
                                  email: user.email,
                                  points_balance: user.points_balance,
                                  points_earned_total: user.points_earned_total
                                })}
                                className={`${user.is_banned ? 'line-through text-gray-500' : 'text-white hover:text-yellow-400 transition-colors'} cursor-pointer`}
                                title="Click to manage points"
                              >
                                {user.name || 'Unknown'}
                              </button>
                              <div className="text-xs text-gray-400">
                                {user.points_balance?.toLocaleString() || 0} pts
                              </div>
                            </div>
                          </td>
                          <td className={`py-3 px-4 ${user.is_banned ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{user.email}</td>
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
                                <button
                                  onClick={() => moderateUser(user.id, { is_subscriber: !user.is_subscriber })}
                                  className={`p-1 rounded ${
                                    user.is_subscriber
                                      ? 'bg-purple-600 hover:bg-purple-700'
                                      : 'bg-gray-600 hover:bg-gray-500'
                                  }`}
                                  title={user.is_subscriber ? 'Remove Subscriber' : 'Make Subscriber'}
                                >
                                  <Crown className="w-4 h-4" />
                                </button>
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
                                <button
                                  onClick={() => grantFreeSubscription(user.id)}
                                  className="p-1 rounded bg-emerald-600 hover:bg-emerald-700"
                                  title="Grant Free Subscription"
                                >
                                  <Gift className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setShowUsernameModal({
                                    id: user.id,
                                    name: user.name || '',
                                    email: user.email,
                                    is_subscriber: user.is_subscriber,
                                    name_color: user.name_color || undefined
                                  })}
                                  className="p-1 rounded bg-indigo-600 hover:bg-indigo-700"
                                  title="Edit Username"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setShowPointsModal({
                                    id: user.id,
                                    name: user.name || 'Unknown',
                                    email: user.email,
                                    points_balance: user.points_balance,
                                    points_earned_total: user.points_earned_total
                                  })}
                                  className="p-1 rounded bg-yellow-600 hover:bg-yellow-700"
                                  title="Manage Points"
                                >
                                  <Coins className="w-4 h-4" />
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

            {activeTab === 'test-alerts' && (
              <div className="space-y-6">
                <div className="bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <TestTube className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-bold">Test OBS Alerts</h3>
                  </div>
                  <p className="text-gray-400 mb-6">
                    Send test donations and subscriptions to verify your OBS alerts overlay is working correctly.
                  </p>

                  {/* Test Donation */}
                  <div className="bg-gray-800 rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      <span>Test Donation Alert</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Donor Name</label>
                        <input
                          type="text"
                          value={testDonation.donor_name}
                          onChange={(e) => setTestDonation(prev => ({ ...prev, donor_name: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500"
                          placeholder="Test Donor"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Amount ($)</label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={testDonation.amount}
                          onChange={(e) => setTestDonation(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500"
                          placeholder="5.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Message</label>
                        <input
                          type="text"
                          value={testDonation.message}
                          onChange={(e) => setTestDonation(prev => ({ ...prev, message: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500"
                          placeholder="This is a test donation!"
                        />
                      </div>
                    </div>
                    <button
                      onClick={sendTestDonation}
                      disabled={testSending}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>{testSending ? 'Sending...' : 'Send Test Donation'}</span>
                    </button>
                  </div>

                  {/* Test Subscription */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <Crown className="w-5 h-5 text-purple-400" />
                      <span>Test Subscription Alert</span>
                    </h4>
                    <p className="text-gray-400 mb-4">
                      Sends a test subscription alert with a random test username.
                    </p>
                    <button
                      onClick={sendTestSubscription}
                      disabled={testSending}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>{testSending ? 'Sending...' : 'Send Test Subscription'}</span>
                    </button>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mt-6">
                    <h4 className="text-lg font-semibold mb-2 text-blue-400">Instructions</h4>
                    <ul className="text-sm text-blue-100 space-y-1">
                      <li>• Make sure your OBS alerts overlay is open at <code className="bg-blue-800 px-1 rounded">/obs-alerts</code></li>
                      <li>• Test alerts will appear immediately when sent</li>
                      <li>• Alerts will play sound effects and animations</li>
                      <li>• Each alert disappears after 8 seconds</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stream-settings' && (
              <div className="space-y-6">
                <div className="bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Tv className="w-6 h-6 text-purple-400" />
                      <h3 className="text-xl font-bold">Stream Source Management</h3>
                    </div>
                    <button
                      onClick={() => setShowStreamModal(true)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Change Stream Source
                    </button>
                  </div>
                  
                  <p className="text-gray-400 mb-6">
                    Control what stream source all viewers see on the main page. Changes apply immediately to all users.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <h4 className="font-medium text-white">Kick</h4>
                      </div>
                      <p className="text-sm text-gray-400">kick.com/vaultkeeper</p>
                      <p className="text-xs text-green-400 mt-2">Default platform</p>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <h4 className="font-medium text-white">Twitch</h4>
                      </div>
                      <p className="text-sm text-gray-400">twitch.tv/vaultkeeperirl</p>
                      <p className="text-xs text-purple-400 mt-2">Alternative platform</p>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <h4 className="font-medium text-white">YouTube</h4>
                      </div>
                      <p className="text-sm text-gray-400">Custom stream URL</p>
                      <p className="text-xs text-red-400 mt-2">Supports unlisted streams</p>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 mt-6">
                    <h4 className="text-lg font-semibold mb-2 text-blue-400">Features</h4>
                    <ul className="text-sm text-blue-100 space-y-1">
                      <li>• Instant switching between platforms</li>
                      <li>• Support for unlisted YouTube streams</li>
                      <li>• All viewers see the same stream automatically</li>
                      <li>• No need for viewers to refresh their browsers</li>
                    </ul>
                  </div>
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
                      <th className="text-left py-3 px-4">Actions</th>
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
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            {donation.status === 'pending' && (
                              <button
                                onClick={() => verifyDonation(donation.id)}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded font-medium transition-colors"
                              >
                                ✅ Verify & Post
                              </button>
                            )}
                            <button
                              onClick={() => deleteDonation(donation.id)}
                              className="p-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                              title="Delete donation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>  
                          </div>
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

      {/* Admin Username Modal */}
      {showUsernameModal && (
        <AdminUsernameModal
          user={showUsernameModal}
          onClose={() => setShowUsernameModal(null)}
          onUpdate={() => {
            fetchData();
            setShowUsernameModal(null);
          }}
        />
      )}

      {/* Admin Points Modal */}
      {showPointsModal && (
        <AdminPointsModal
          user={showPointsModal}
          onClose={() => setShowPointsModal(null)}
          onUpdate={() => {
            fetchData();
            setShowPointsModal(null);
          }}
        />
      )}

      {/* Stream Source Modal */}
      {showStreamModal && (
        <StreamSourceModal
          onClose={() => setShowStreamModal(false)}
          onUpdate={() => {
            setShowStreamModal(false);
            // Stream settings don't affect admin data, so no need to fetchData()
          }}
        />
      )}
    </div>
  );
}
