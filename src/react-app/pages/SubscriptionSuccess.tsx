import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Crown, Gift } from 'lucide-react';

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  
  const [error, setError] = useState('');
  
  const sessionId = searchParams.get('session_id');
  const isGift = searchParams.get('gift') === 'true';
  const recipient = searchParams.get('recipient');

  useEffect(() => {
    const verifySubscription = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch(`/api/subscriptions/success?session_id=${sessionId}`, {
          credentials: 'include',
        });

        if (response.ok) {
          // Success handled by state change
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to verify subscription');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('Failed to verify subscription');
      } finally {
        setIsVerifying(false);
      }
    };

    verifySubscription();
  }, [sessionId]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg max-w-md w-full p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-2">Verifying Payment...</h1>
          <p className="text-gray-300">Please wait while we confirm your subscription.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">Payment Issue</h1>
          
          <p className="text-gray-300 mb-6 leading-relaxed">
            {error}
          </p>
          
          <div className="space-y-4">
            <Link
              to="/"
              className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-medium transition-all duration-200"
            >
              Back to Stream
            </Link>
            
            <p className="text-xs text-gray-400">
              Having issues? Contact us at vaultkeeperirl@gmail.com
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isGift && recipient) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Gift Sent Successfully! 🎁
          </h1>
          
          <p className="text-gray-300 mb-6 leading-relaxed">
            Your premium subscription gift for <span className="text-purple-400 font-bold">{recipient}</span> has been processed! They now have access to all premium features and will see your gift notification in chat.
          </p>

          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-white mb-2">What {recipient} received:</h3>
            <div className="text-left space-y-1 text-sm text-gray-300">
              <div>✅ Custom emojis in chat</div>
              <div>✅ Emoji shortcuts (:smile:, :fire:, etc.)</div>
              <div>✅ Priority chat support</div>
              <div>✅ Special subscriber badge</div>
              <div>✅ Early access to new features</div>
              <div>✅ Ad-free experience</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Link
              to="/"
              className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-medium transition-all duration-200"
            >
              Return to Stream
            </Link>
            
            <p className="text-xs text-gray-400">
              Thank you for spreading the premium experience! 🎉
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              Questions? Contact us at vaultkeeperirl@gmail.com
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Crown className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Welcome to Premium! ✨
        </h1>
        
        <p className="text-gray-300 mb-6 leading-relaxed">
          Your subscription has been activated! You now have access to custom emojis, priority chat support, and all premium features.
        </p>
        
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-white mb-2">Premium Features Unlocked:</h3>
          <div className="text-left space-y-1 text-sm text-gray-300">
            <div>✅ Custom emojis in chat</div>
            <div>✅ Emoji shortcuts (:smile:, :fire:, etc.)</div>
            <div>✅ Priority chat support</div>
            <div>✅ Special subscriber badge</div>
            <div>✅ Early access to new features</div>
            <div>✅ Ad-free experience</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-medium transition-all duration-200"
          >
            Start Using Premium Features
          </Link>
          
          <p className="text-xs text-gray-400">
            You can manage your subscription anytime from your account settings
          </p>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            Questions? Contact us at vaultkeeperirl@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
