import { useState } from 'react';
import { X, Coins, Plus, Minus } from 'lucide-react';

interface AdminPointsModalProps {
  user: {
    id: number;
    name: string;
    email: string;
    points_balance?: number;
    points_earned_total?: number;
  };
  onClose: () => void;
  onUpdate: () => void;
}

export default function AdminPointsModal({ user, onClose, onUpdate }: AdminPointsModalProps) {
  const [pointsAmount, setPointsAmount] = useState(100);
  const [isAwarding, setIsAwarding] = useState(true); // true for awarding, false for deducting
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presetAmounts = [10, 25, 50, 100, 250, 500, 1000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (pointsAmount <= 0) {
      alert('Points amount must be greater than 0');
      return;
    }

    if (!description.trim()) {
      alert('Please provide a description');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalAmount = isAwarding ? pointsAmount : -pointsAmount;
      const response = await fetch(`/api/admin/users/${user.id}/award-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          points_amount: finalAmount,
          transaction_type: isAwarding ? 'admin_award' : 'admin_deduct',
          description: description.trim()
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully ${isAwarding ? 'awarded' : 'deducted'} ${pointsAmount} points! ${result.message || ''}`);
        onUpdate();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || `Failed to ${isAwarding ? 'award' : 'deduct'} points`);
      }
    } catch (error) {
      console.error('Failed to modify points:', error);
      alert(`Failed to ${isAwarding ? 'award' : 'deduct'} points`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[99999] p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Coins className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Manage Points (Admin)</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-orange-100 mt-2">
            {user.name || user.email}
          </p>
        </div>

        {/* Current Balance */}
        <div className="p-4 bg-gray-700 border-b border-gray-600">
          <div className="text-center">
            <p className="text-gray-300 text-sm">Current Points Balance</p>
            <p className="text-3xl font-bold text-yellow-400">
              {user.points_balance?.toLocaleString() || 0}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Total Earned: {user.points_earned_total?.toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Action Type Toggle */}
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setIsAwarding(true)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md font-medium transition-colors ${
                isAwarding
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Award Points</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAwarding(false)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md font-medium transition-colors ${
                !isAwarding
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Minus className="w-4 h-4" />
              <span>Deduct Points</span>
            </button>
          </div>

          {/* Preset Amounts */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quick Amounts
            </label>
            <div className="grid grid-cols-4 gap-2">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setPointsAmount(amount)}
                  className={`px-3 py-2 text-sm rounded border transition-colors ${
                    pointsAmount === amount
                      ? 'bg-yellow-600 border-yellow-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Amount
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={pointsAmount}
              onChange={(e) => setPointsAmount(parseInt(e.target.value) || 0)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter points amount"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description/Reason *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder={isAwarding ? "Reward for community engagement" : "Point adjustment"}
              maxLength={200}
            />
            <div className="text-xs text-gray-400 mt-1">
              {description.length}/200 characters
            </div>
          </div>

          {/* Warning for deductions */}
          {!isAwarding && (
            <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">
                ⚠️ Warning: You are about to deduct {pointsAmount} points from this user. This action will be logged.
              </p>
            </div>
          )}

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
              disabled={isSubmitting || pointsAmount <= 0 || !description.trim()}
              className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isAwarding
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                  : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white'
              }`}
            >
              {isSubmitting 
                ? `${isAwarding ? 'Awarding' : 'Deducting'}...` 
                : `${isAwarding ? 'Award' : 'Deduct'} ${pointsAmount} Points`
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
