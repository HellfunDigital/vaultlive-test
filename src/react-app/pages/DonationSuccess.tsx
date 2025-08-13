import { Link, useSearchParams } from 'react-router';
import { CheckCircle, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DonationSuccess() {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const donationId = searchParams.get('donation_id');

  useEffect(() => {
    const verifyDonation = async () => {
      if (!donationId) {
        // If no donationId is in the URL, this page can't verify
        setVerificationError('No donation ID found in URL. Verification cannot proceed.');
        setIsVerifying(false);
        return;
      }

      // Check if this is a PayPal return by looking for PayPal-specific URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const paypalOrderId = urlParams.get('token'); // PayPal uses 'token' parameter for order ID
      
      if (paypalOrderId) {
        // This is a PayPal return - capture the payment first
        try {
          const captureResponse = await fetch('/api/donations/paypal-capture', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              order_id: paypalOrderId, 
              donation_id: donationId 
            }),
          });

          if (!captureResponse.ok) {
            const errorData = await captureResponse.json();
            setVerificationError(errorData.error || 'Failed to capture PayPal payment.');
            setIsVerifying(false);
            return;
          }
        } catch (error) {
          console.error('PayPal capture failed:', error);
          setVerificationError('Failed to capture PayPal payment.');
          setIsVerifying(false);
          return;
        }
      }

      // For both PayPal (after capture) and Stripe, verify the donation
      try {
        const response = await fetch('/api/donations/verify-client-side', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ donation_id: donationId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setVerificationError(errorData.error || 'Failed to verify donation.');
        }
      } catch (error) {
        console.error('Donation verification failed:', error);
        setVerificationError('Network error or unexpected issue during verification.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyDonation();
  }, [donationId]);

  // Show verification loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg max-w-md w-full p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-2">Verifying Tip...</h1>
          <p className="text-gray-300">Please wait while we confirm your generous support.</p>
        </div>
      </div>
    );
  }

  // Show verification error state
  if (verificationError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Verification Failed</h1>
          <p className="text-gray-300 mb-6 leading-relaxed">
            {verificationError} Please contact support if you believe this is an error.
          </p>
          <div className="space-y-4">
            <Link
              to="/"
              className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-medium transition-all duration-200"
            >
              Back to Stream
            </Link>
            <p className="text-xs text-gray-400">
              You can close this tab and return to the stream.
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              Contact us at vaultkeeperirl@gmail.com
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show success state (verification completed successfully)
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Thank You! <Heart className="w-6 h-6 inline text-red-500 ml-2" />
        </h1>
        
        <p className="text-gray-300 mb-6 leading-relaxed">
          Your tip has been successfully completed! Your support means the world to us and helps keep the stream going. 
        </p>
        
        <p className="text-sm text-green-300 mb-8">
          Your tip message has been posted to the chat for everyone to see! 🎉
        </p>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-medium transition-all duration-200"
          >
            Back to Stream
          </Link>
          
          <p className="text-xs text-gray-400">
            You can close this tab and return to the stream to see your message in chat!
          </p>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            Having issues? Contact us at vaultkeeperirl@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
