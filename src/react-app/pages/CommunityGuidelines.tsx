import { Link } from 'react-router';
import { Shield, Heart, Users, AlertTriangle, Star, MessageCircle, ArrowLeft } from 'lucide-react';

export default function CommunityGuidelines() {
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
                <Shield className="w-6 h-6 text-purple-500" />
                <h1 className="text-2xl font-bold">Community Guidelines</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="w-8 h-8 text-white" />
            <h2 className="text-2xl font-bold text-white">Welcome to the VaultKeeper Community!</h2>
          </div>
          <p className="text-purple-100 text-lg">
            Our community thrives on respect, positivity, and shared passion for gaming and streaming. 
            These guidelines help ensure everyone has a great experience. Let's build something amazing together! 💜
          </p>
        </div>

        {/* Core Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-green-500/30">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-green-400">Be Respectful</h3>
            </div>
            <p className="text-gray-300 mb-3">
              Treat everyone with kindness and respect. We're all here to have fun and support each other.
            </p>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• No personal attacks or harassment</li>
              <li>• Respect different opinions and perspectives</li>
              <li>• Help new community members feel welcome</li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-red-500/30">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-bold text-red-400">Zero Tolerance for Hate</h3>
            </div>
            <p className="text-gray-300 mb-3">
              We have absolutely zero tolerance for hate speech, discrimination, or targeted harassment.
            </p>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• No slurs or derogatory language</li>
              <li>• No discrimination based on identity</li>
              <li>• Immediate action will be taken</li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-blue-500/30">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-bold text-blue-400">Keep It Safe</h3>
            </div>
            <p className="text-gray-300 mb-3">
              Maintain a safe environment for everyone in our community.
            </p>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• No threats or intimidation</li>
              <li>• Don't share private information</li>
              <li>• Report safety concerns to moderators</li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500/30">
            <div className="flex items-center space-x-3 mb-4">
              <MessageCircle className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-bold text-yellow-400">Smart Chat Rules</h3>
            </div>
            <p className="text-gray-300 mb-3">
              Help keep chat fun and engaging for everyone.
            </p>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• No spam or excessive self-promotion</li>
              <li>• Stay relevant to the stream</li>
              <li>• One referral link per user maximum</li>
            </ul>
          </div>
        </div>

        {/* Detailed Guidelines */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <Star className="w-5 h-5 text-purple-400" />
            <span>Detailed Community Guidelines</span>
          </h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-purple-400 mb-2">🎮 Gaming & Stream Etiquette</h4>
              <ul className="text-gray-300 space-y-1 ml-4">
                <li>• Keep backseating constructive and helpful</li>
                <li>• Don't spoil games or upcoming content</li>
                <li>• Respect the streamer's gaming choices and style</li>
                <li>• Use appropriate language during family-friendly streams</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-green-400 mb-2">💎 Points & XP System</h4>
              <ul className="text-gray-300 space-y-1 ml-4">
                <li>• Use features in good faith - don't exploit bugs</li>
                <li>• Earn points through genuine participation</li>
                <li>• Report any system issues to moderators</li>
                <li>• Respect cooldowns and limitations</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-blue-400 mb-2">🔗 Links & Self-Promotion</h4>
              <ul className="text-gray-300 space-y-1 ml-4">
                <li>• Ask permission before sharing external links</li>
                <li>• One self-promotion per stream maximum</li>
                <li>• No malicious or inappropriate links</li>
                <li>• Referral links should be used sparingly</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-cyan-400 mb-2">🌐 Third-Party Platforms</h4>
              <ul className="text-gray-300 space-y-1 ml-4">
                <li>• Follow Twitch, Kick, and other platform ToS</li>
                <li>• Don't circumvent platform-specific rules</li>
                <li>• Respect intellectual property and copyright</li>
                <li>• Maintain consistency across all platforms</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Enforcement */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-400" />
            <span>Enforcement & Appeals</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-yellow-400 mb-3">Enforcement Levels</h4>
              <div className="space-y-3">
                <div className="bg-yellow-900/20 rounded p-3 border-l-4 border-yellow-500">
                  <div className="font-semibold text-yellow-400">⚠️ Warning</div>
                  <div className="text-sm text-gray-300">For minor infractions or first-time issues</div>
                </div>
                <div className="bg-orange-900/20 rounded p-3 border-l-4 border-orange-500">
                  <div className="font-semibold text-orange-400">🔇 Temporary Restrictions</div>
                  <div className="text-sm text-gray-300">Chat timeout or points deduction</div>
                </div>
                <div className="bg-red-900/20 rounded p-3 border-l-4 border-red-500">
                  <div className="font-semibold text-red-400">🚫 Permanent Ban</div>
                  <div className="text-sm text-gray-300">For serious violations or repeat offenders</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-green-400 mb-3">Appeals Process</h4>
              <div className="text-gray-300 space-y-2">
                <p className="text-sm">
                  Think a moderation action was unfair? You can appeal:
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Contact moderators via Discord</li>
                  <li>• Provide context and reasoning</li>
                  <li>• Appeals reviewed within 24-48 hours</li>
                  <li>• Be respectful during the appeal process</li>
                </ul>
                <div className="mt-4 p-3 bg-green-900/20 rounded border border-green-500/30">
                  <p className="text-green-400 text-sm font-semibold">
                    Remember: Admissions of guilt and genuine apologies go a long way! 💚
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Community Values */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-6 border border-purple-500/30">
          <h3 className="text-xl font-bold mb-4 text-center">Our Community Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl mb-2">💜</div>
              <div className="font-semibold text-purple-400">Inclusivity</div>
              <div className="text-sm text-gray-300">Everyone is welcome here</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🎮</div>
              <div className="font-semibold text-blue-400">Gaming First</div>
              <div className="text-sm text-gray-300">We're here for the games</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🌟</div>
              <div className="font-semibold text-yellow-400">Growth</div>
              <div className="text-sm text-gray-300">We grow together</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400">
          <p>
            Questions about these guidelines? Reach out to our <Link to="/" className="text-purple-400 hover:text-purple-300">moderators</Link> anytime!
          </p>
          <p className="mt-2 text-sm">
            Last updated: January 2024 • Version 1.0
          </p>
        </div>
      </div>
    </div>
  );
}
