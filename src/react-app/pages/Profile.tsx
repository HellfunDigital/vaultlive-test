import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';
import { 
  User, Calendar, MessageCircle, DollarSign, Crown, ArrowLeft, Award, 
  ExternalLink, Star, Zap, TrendingUp, CreditCard, AlertCircle, X 
} from 'lucide-react';
import SubscriptionModal from '@/react-app/components/SubscriptionModal';
import DailyCheckinButton from '@/react-app/components/DailyCheckinButton';
import type { LocalUser, ExtendedMochaUser } from '@/shared/types';

interface UserProfileData extends LocalUser {
  totalDonations: number;
  totalMessages: number;
  joinedDaysAgo: number;
}

interface Subscription {
  id: number;
  plan_type: string;
  status: string;
  amount: number;
  billing_cycle: string;
  start_date: string;
  end_date: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

interface BillingHistory {
  id: string;
  amount: number;
  status: string;
  created: number;
  description: string;
  invoice_url?: string;
}

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isPending } = useAuth();
  const currentExtendedUser = currentUser as ExtendedMochaUser;
  
  // Determine if this is the current user's profile or someone else's
  const isOwnProfile = !userId || (currentExtendedUser?.localUser?.id?.toString() === userId);
  const targetUserId = isOwnProfile ? currentExtendedUser?.localUser?.id?.toString() : userId;

  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!isPending && !currentUser && isOwnProfile) {
      navigate('/');
      return;
    }

    if (!isPending && targetUserId) {
      fetchProfileData();
      if (isOwnProfile) {
        fetchAccountData();
      }
    }
  }, [currentUser, isPending, targetUserId, isOwnProfile, navigate]);

  const fetchProfileData = async () => {
    if (!targetUserId) return;
    
    try {
      const response = await fetch(`/api/users/${targetUserId}/profile`);
      
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else if (response.status === 404) {
        setError('User not found');
      } else {
        setError('Failed to load user profile');
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setError('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccountData = async () => {
    if (!isOwnProfile) return;
    
    try {
      const [subscriptionResponse, billingResponse] = await Promise.all([
        fetch('/api/subscriptions/me', { credentials: 'include' }),
        fetch('/api/subscriptions/billing-history', { credentials: 'include' })
      ]);

      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json();
        setSubscription(subscriptionData);
      }

      if (billingResponse.ok) {
        const billingData = await billingResponse.json();
        setBillingHistory(billingData);
      }
    } catch (error) {
      console.error('Failed to fetch account data:', error);
    }
  };

  const cancelSubscription = async () => {
    if (!subscription?.stripe_subscription_id) return;

    setIsCancelling(true);
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        await fetchAccountData();
        setShowCancelConfirm(false);
        alert('Subscription cancelled successfully. You will retain access until the end of your current billing period.');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
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

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
          <p className="text-gray-400 mb-4">{error || 'This user profile could not be found.'}</p>
          <Link to="/" className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Back to Stream
          </Link>
        </div>
      </div>
    );
  }

  const badges = profileData.badges ? JSON.parse(profileData.badges) : [];

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

  const formatJoinDate = () => {
    const joinDate = new Date(profileData.created_at);
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    
    return `${monthNames[joinDate.getMonth()]} ${joinDate.getFullYear()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-400 bg-green-400/10';
      case 'cancelled':
      case 'canceled':
        return 'text-red-400 bg-red-400/10';
      case 'past_due':
        return 'text-yellow-400 bg-yellow-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Stream</span>
              </button>
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6 text-purple-500" />
                <h1 className="text-2xl font-bold">
                  {isOwnProfile ? 'My Profile' : `${profileData.name}'s Profile`}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              {profileData.picture ? (
                <img
                  src={profileData.picture}
                  alt={profileData.name || 'User'}
                  className="w-24 h-24 rounded-full border-4 border-purple-500"
                />
              ) : (
                <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center border-4 border-purple-500">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              {profileData.is_subscriber && (
                <div className="absolute -bottom-2 -right-2 bg-purple-600 rounded-full p-2 border-4 border-gray-800">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 
                className="text-3xl font-bold mb-2"
                style={{ color: profileData.name_color || '#ffffff' }}
              >
                {profileData.name || 'Unknown User'}
              </h2>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {profileData.is_admin && (
                  <span className="px-3 py-1 bg-red-600 text-white text-sm rounded-full font-medium">
                    Admin
                  </span>
                )}
                {profileData.is_moderator && (
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full font-medium">
                    Moderator
                  </span>
                )}
                {profileData.is_subscriber && (
                  <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full font-medium flex items-center space-x-1">
                    <Crown className="w-3 h-3" />
                    <span>Subscriber</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center md:justify-start text-gray-400 text-sm space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatJoinDate()}</span>
                <span>•</span>
                <span>{profileData.joinedDaysAgo} days ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats and Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Community Stats */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Award className="w-5 h-5 text-purple-400" />
                <span>Community Stats</span>
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-lg font-bold text-blue-400">{profileData.xp_total || 0}</div>
                  <div className="text-gray-400 text-xs">Total XP</div>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-lg font-bold text-indigo-400">Lvl {profileData.user_level || 1}</div>
                  <div className="text-gray-400 text-xs">User Level</div>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-lg font-bold text-yellow-400">
                    {isOwnProfile ? (profileData.points_balance || 0) : (profileData.points_earned_total || 0)}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {isOwnProfile ? 'Points' : 'Earned'}
                  </div>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-lg font-bold text-cyan-400">{profileData.totalMessages}</div>
                  <div className="text-gray-400 text-xs">Messages</div>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-lg font-bold text-green-400">${profileData.totalDonations.toFixed(2)}</div>
                  <div className="text-gray-400 text-xs">Donated</div>
                </div>
              </div>
            </div>

            {/* XP Progress & Achievement Levels */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Level Progress</h3>
              
              <div className="space-y-4">
                {/* XP Progress to Next Level */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">Level {profileData.user_level || 1}</span>
                    </div>
                    <span className="text-sm text-gray-400">Next: Level {(profileData.user_level || 1) + 1}</span>
                  </div>
                  
                  {(() => {
                    const currentXP = profileData.xp_total || 0;
                    const currentLevel = profileData.user_level || 1;
                    const xpPerLevel = 100;
                    const currentLevelXP = (currentLevel - 1) * xpPerLevel;
                    const progressXP = currentXP - currentLevelXP;
                    const requiredXP = xpPerLevel;
                    const progressPercent = Math.min(100, Math.max(0, (progressXP / requiredXP) * 100));
                    
                    return (
                      <>
                        <div className="flex justify-between text-sm text-gray-400 mb-2">
                          <span>{Math.max(0, progressXP)}/{requiredXP} XP</span>
                          <span>{Math.max(0, requiredXP - progressXP)} XP to next level</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Points Summary */}
                {isOwnProfile && (
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="font-medium text-sm">Points Summary</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400 text-xs">Current Balance:</span>
                        <div className="text-base font-bold text-yellow-400">{profileData.points_balance || 0}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs">Total Earned:</span>
                        <div className="text-base font-bold text-green-400">{profileData.points_earned_total || 0}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Subscription Section (Own Profile Only) */}
            {isOwnProfile && (
              <div className="bg-gray-800 rounded-lg">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-xl font-bold flex items-center space-x-2">
                    <Crown className="w-5 h-5 text-purple-400" />
                    <span>Subscription</span>
                  </h3>
                </div>

                <div className="p-6">
                  {subscription ? (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="font-semibold text-gray-300 mb-2">Current Plan</h4>
                          <div className="text-2xl font-bold text-purple-400 mb-1">
                            {subscription.plan_type === 'lifetime' ? 'Lifetime Premium' : 'Premium'}
                          </div>
                          <div className="text-gray-400">
                            {subscription.plan_type === 'lifetime' 
                              ? 'Lifetime access' 
                              : `$${subscription.amount.toFixed(2)}/${subscription.billing_cycle}`
                            }
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-300 mb-2">Status</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-300 mb-2">Started</h4>
                          <div className="text-gray-300">{formatDate(subscription.start_date)}</div>
                        </div>

                        {subscription.end_date && subscription.plan_type !== 'lifetime' && (
                          <div>
                            <h4 className="font-semibold text-gray-300 mb-2">
                              {subscription.status === 'cancelled' ? 'Access Ends' : 'Next Billing'}
                            </h4>
                            <div className="text-gray-300">{formatDate(subscription.end_date)}</div>
                          </div>
                        )}
                      </div>

                      {subscription.status === 'active' && subscription.plan_type !== 'lifetime' && subscription.stripe_subscription_id && (
                        <div className="bg-gray-900 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                            <div className="flex-1">
                              <h5 className="font-medium text-white mb-2">Cancel Subscription</h5>
                              <p className="text-gray-400 text-sm mb-3">
                                You can cancel your subscription at any time. You'll retain access to premium features until the end of your current billing period.
                              </p>
                              <button
                                onClick={() => setShowCancelConfirm(true)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                              >
                                Cancel Subscription
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {subscription.status === 'cancelled' && (
                        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                            <div>
                              <h5 className="font-medium text-yellow-300 mb-1">Subscription Cancelled</h5>
                              <p className="text-yellow-200 text-sm">
                                Your subscription has been cancelled. You'll retain access to premium features until {formatDate(subscription.end_date || subscription.start_date)}.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Crown className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-300 mb-2">No Active Subscription</h4>
                      <p className="text-gray-400 mb-4">
                        Upgrade to Premium to unlock custom emojis, priority chat, and exclusive features!
                      </p>
                      <button
                        onClick={() => setShowSubscriptionModal(true)}
                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                      >
                        <Crown className="w-5 h-5" />
                        <span>Get Premium</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Billing History (Own Profile Only) */}
            {isOwnProfile && billingHistory.length > 0 && (
              <div className="bg-gray-800 rounded-lg mt-6">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-xl font-bold flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-green-400" />
                    <span>Billing History</span>
                  </h3>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {billingHistory.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${
                            payment.status === 'succeeded' ? 'bg-green-400' : 
                            payment.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                          }`}></div>
                          <div>
                            <div className="font-medium text-white">{payment.description || 'Premium Subscription'}</div>
                            <div className="text-sm text-gray-400">{formatTimestamp(payment.created)}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-medium text-green-400">${payment.amount.toFixed(2)}</div>
                            <div className={`text-xs ${getStatusColor(payment.status)}`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </div>
                          </div>
                          {payment.invoice_url && (
                            <a
                              href={payment.invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-400 hover:text-white transition-colors"
                              title="View Invoice"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Badges Sidebar */}
          <div className="space-y-6">
            {/* Daily Check-in (Own Profile Only) */}
            {isOwnProfile && <DailyCheckinButton />}

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                <Award className="w-4 h-4 text-yellow-400" />
                <span>Badges</span>
              </h3>
              
              {badges.length > 0 ? (
                <div className="space-y-2">
                  {badges.map((badge: string) => (
                    <div
                      key={badge}
                      className={`flex items-center px-3 py-2 ${getBadgeColor(badge)} rounded-lg`}
                    >
                      <span className="text-lg mr-2">{getBadgeIcon(badge)}</span>
                      <div>
                        <div className="font-medium text-white text-sm">{badge}</div>
                        <div className="text-xs text-white/70">
                          {badge === 'VIP' ? 'VIP Member' :
                           badge === 'Moderator' ? 'Chat Moderator' :
                           badge === 'Supporter' ? 'Stream Supporter' :
                           badge === 'OG' ? 'OG Member' :
                           badge === 'Verified' ? 'Verified' :
                           badge === 'Artist' ? 'Community Artist' :
                           badge === 'DJ' ? 'Music Lover' :
                           badge === 'Gamer' ? 'Gaming Fan' :
                           'Special Badge'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-6">
                  <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No badges yet</p>
                  <p className="text-xs mt-1">Stay active to earn badges!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Cancel Subscription?</h3>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                Are you sure you want to cancel your premium subscription? You'll lose access to:
              </p>
              <ul className="text-sm text-gray-400 space-y-1 ml-4">
                <li>• Custom emojis in chat</li>
                <li>• Priority chat support</li>
                <li>• Special subscriber badge</li>
                <li>• Early access to new features</li>
              </ul>
              <p className="text-sm text-yellow-300 mt-4">
                You'll retain access until {subscription?.end_date ? formatDate(subscription.end_date) : 'the end of your billing period'}.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={cancelSubscription}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal
          onClose={() => setShowSubscriptionModal(false)}
        />
      )}
    </div>
  );
}
