import { useState, useEffect } from 'react';
import { Calendar, Gift, Zap, TrendingUp, X, CheckCircle } from 'lucide-react';
import { useAuth } from '@getmocha/users-service/react';
import type { ExtendedMochaUser } from '@/shared/types';

interface CheckinStatus {
  can_checkin: boolean;
  already_checked_in: boolean;
  current_streak: number;
  total_checkins: number;
  today_rewards: {
    xp_awarded: number;
    points_awarded: number;
  } | null;
}

interface CheckinResult {
  success: boolean;
  xp_awarded: number;
  points_awarded: number;
  current_streak: number;
  level_up: boolean;
  new_level: number;
  new_xp_total: number;
  new_points_balance: number;
  bonus_xp: number;
  bonus_points: number;
  message: string;
}

export default function DailyCheckinButton() {
  const { user } = useAuth();
  const extendedUser = user as ExtendedMochaUser;
  const [status, setStatus] = useState<CheckinStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [lastResult, setLastResult] = useState<CheckinResult | null>(null);

  useEffect(() => {
    if (extendedUser?.localUser) {
      fetchCheckinStatus();
    }
  }, [extendedUser]);

  const fetchCheckinStatus = async () => {
    try {
      const response = await fetch('/api/users/daily-checkin/status', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Error fetching check-in status:', error);
    }
  };

  const handleCheckin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users/daily-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setLastResult(data);
        setShowRewards(true);
        await fetchCheckinStatus(); // Refresh status
        
        // Trigger a custom event to update user data in other components
        window.dispatchEvent(new CustomEvent('userDataUpdated'));
        
        // Only reload if absolutely necessary - try to update state locally first
        setTimeout(() => {
          if (window.location.pathname === '/profile') {
            window.location.reload();
          }
        }, 1000);
      } else {
        if (data.alreadyCheckedIn) {
          // Update status to reflect already checked in
          await fetchCheckinStatus();
        } else {
          alert(data.error || 'Failed to check in');
        }
      }
    } catch (error) {
      console.error('Error during check-in:', error);
      alert('Failed to check in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!extendedUser?.localUser || !status) {
    return null;
  }

  const getStreakBonus = (streak: number) => {
    if (streak <= 1) return { bonusXP: 0, bonusPoints: 0 };
    const bonus = Math.min(streak - 1, 10);
    return { bonusXP: bonus * 5, bonusPoints: bonus * 2 };
  };

  const nextRewards = getStreakBonus(status.current_streak + 1);
  const totalXPNext = 25 + nextRewards.bonusXP;
  const totalPointsNext = 10 + nextRewards.bonusPoints;

  return (
    <>
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-4 border border-blue-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Daily Check-In</h3>
            {status.current_streak > 0 && (
              <div className="flex items-center space-x-1 bg-orange-600/20 px-2 py-1 rounded-full">
                <span className="text-orange-300 text-sm">🔥 {status.current_streak}</span>
              </div>
            )}
          </div>
          
          {status.already_checked_in && (
            <CheckCircle className="w-5 h-5 text-green-400" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-blue-400">{totalXPNext}</div>
            <div className="text-xs text-gray-400">XP Reward</div>
            {nextRewards.bonusXP > 0 && (
              <div className="text-xs text-green-400">+{nextRewards.bonusXP} streak bonus</div>
            )}
          </div>
          
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-yellow-400">{totalPointsNext}</div>
            <div className="text-xs text-gray-400">Points Reward</div>
            {nextRewards.bonusPoints > 0 && (
              <div className="text-xs text-green-400">+{nextRewards.bonusPoints} streak bonus</div>
            )}
          </div>
        </div>

        {status.already_checked_in ? (
          <div className="text-center">
            <div className="bg-green-600/20 text-green-300 px-4 py-2 rounded-lg text-sm mb-2">
              ✅ Already checked in today!
            </div>
            {status.today_rewards && (
              <div className="text-xs text-gray-400">
                Earned: {status.today_rewards.xp_awarded} XP + {status.today_rewards.points_awarded} points
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleCheckin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Checking In...</span>
              </>
            ) : (
              <>
                <Gift className="w-4 h-4" />
                <span>Claim Daily Rewards</span>
              </>
            )}
          </button>
        )}

        {/* Stats */}
        <div className="flex justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-gray-700">
          <span>Total Check-ins: {status.total_checkins}</span>
          <span>Current Streak: {status.current_streak} days</span>
        </div>
      </div>

      {/* Rewards Modal */}
      {showRewards && lastResult && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-blue-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Check-In Complete!</h2>
              <p className="text-gray-300 mb-4">{lastResult.message}</p>

              {/* Rewards Breakdown */}
              <div className="bg-black/20 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span className="text-xl font-bold text-blue-400">+{lastResult.xp_awarded}</span>
                    </div>
                    <div className="text-xs text-gray-400">XP Earned</div>
                    {lastResult.bonus_xp > 0 && (
                      <div className="text-xs text-green-400">({lastResult.bonus_xp} bonus)</div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-xl font-bold text-yellow-400">+{lastResult.points_awarded}</span>
                    </div>
                    <div className="text-xs text-gray-400">Points Earned</div>
                    {lastResult.bonus_points > 0 && (
                      <div className="text-xs text-green-400">({lastResult.bonus_points} bonus)</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Level Up Notification */}
              {lastResult.level_up && (
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-3 mb-4">
                  <div className="text-purple-300 font-bold text-lg">🎉 Level Up!</div>
                  <div className="text-white">You reached Level {lastResult.new_level}!</div>
                </div>
              )}

              {/* Streak Celebration */}
              {lastResult.current_streak >= 3 && (
                <div className="bg-orange-600/20 border border-orange-500/30 rounded-lg p-3 mb-4">
                  <div className="text-orange-300 font-bold">🔥 {lastResult.current_streak} Day Streak!</div>
                  <div className="text-gray-300 text-sm">Keep it up for even bigger bonuses!</div>
                </div>
              )}

              <button
                onClick={() => setShowRewards(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
              >
                Awesome!
              </button>

              <button
                onClick={() => setShowRewards(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
