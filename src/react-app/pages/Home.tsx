import { useAuth } from '@getmocha/users-service/react';
import Header from '@/react-app/components/Header';
import StreamEmbed from '@/react-app/components/StreamEmbed';
import IntegratedChat from '@/react-app/components/IntegratedChat';
import MiniCommunityWidget from '@/react-app/components/MiniCommunityWidget';
import TipModal from '@/react-app/components/TipModal';
import { useState } from 'react';
import { Link } from 'react-router';
import { ExternalLink, Instagram, Twitter, Youtube } from 'lucide-react';

export default function Home() {
  const { isPending, user } = useAuth();
  const [showTipModal, setShowTipModal] = useState(false);

  if (isPending) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Stream + Chat Section with Background */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://mocha-cdn.com/01987112-f036-7d2d-8b3f-02e13c03a71b/imresizer-1722144221790.jpg" 
            alt="Vaultkeeper Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80" />
        </div>
        
        <header className="relative z-10 p-3 md:p-6">
          <nav className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold glitch" data-text="vaultkeeper.live">vaultkeeper.live</h1>
            </div>
            
            <Header onTip={() => setShowTipModal(true)} />
          </nav>
        </header>
        
        
        
        <div className="relative z-10 max-w-[1600px] mx-auto px-3 md:px-4 py-4 md:py-6">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-3 md:gap-4 mb-4 md:mb-6">
            {/* Left Column - Stream and Community Widget */}
            <div className="space-y-3 md:space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden border-2 md:border-4 border-purple-600 shadow-2xl relative">
                {user ? (
                  <StreamEmbed />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-center p-6 max-w-sm">
                      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Login Required</h3>
                      <p className="text-gray-300 text-sm mb-4">
                        Sign in with Google to watch the live stream and access all premium features
                      </p>
                      <p className="text-xs text-gray-400">
                        Use any of the login buttons above to get started
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Community Widget - Under stream, left of chat */}
              <div className="rounded-lg bg-black/30 border border-gray-700 p-3">
                <div className="h-[280px] xl:h-[347px] w-full">
                  {user ? (
                    <MiniCommunityWidget />
                  ) : (
                    <div className="h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                      <div className="text-center p-6">
                        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16.8c-.8 0-1.54.5-1.85 1.26l-1.92 5.77c-.25.75.16 1.56.91 1.81.75.25 1.56-.16 1.81-.91l1.39-4.17.19-.57L18.58 16H16v6h4z"/>
                          </svg>
                        </div>
                        <h3 className="text-sm font-bold text-white mb-2">Community Stats</h3>
                        <p className="text-gray-400 text-xs">
                          Login to view community activity and leaderboards
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Column - Chat */}
            <aside className="rounded-lg border border-gray-800 bg-black/50 h-[500px] sm:h-[600px] lg:h-[750px] xl:h-[800px] w-full">
              <IntegratedChat />
            </aside>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section id="social" className="py-6 md:py-12 px-3 md:px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Follow Vaultkeeper Everywhere</h2>
          <p className="text-sm md:text-base text-gray-300 mb-4 md:mb-6">
            🚀 Join the community across all platforms for exclusive content and daily updates!
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 items-stretch">
            {/* Instagram */}
            <div className="h-full bg-gray-800 border border-gray-600 hover:border-pink-400 transition rounded-lg">
              <div className="flex flex-col items-center p-2 sm:p-3 h-full">
                <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400 mb-1 sm:mb-2"/>
                <h3 className="font-semibold text-white mb-1 sm:mb-2 text-xs sm:text-sm">Instagram</h3>
                <a 
                  href="https://instagram.com/VaultkeeperIRL" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium transition-colors text-center"
                >
                  Follow
                </a>
              </div>
            </div>
            
            {/* Twitter */}
            <div className="h-full bg-gray-800 border border-gray-600 hover:border-blue-400 transition rounded-lg">
              <div className="flex flex-col items-center p-2 sm:p-3 h-full">
                <Twitter className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 mb-1 sm:mb-2"/>
                <h3 className="font-semibold text-white mb-1 sm:mb-2 text-xs sm:text-sm">Twitter</h3>
                <a 
                  href="https://twitter.com/VaultkeeperIRL" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium transition-colors text-center"
                >
                  Follow
                </a>
              </div>
            </div>
            
            {/* TikTok */}
            <div className="h-full bg-gray-800 border border-gray-600 hover:border-cyan-400 transition rounded-lg">
              <div className="flex flex-col items-center p-2 sm:p-3 h-full">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300 mb-1 sm:mb-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.5 2h2.6c.3 2.1 1.7 3.8 3.8 4.3v2.6c-1.3-.1-2.6-.5-3.8-1.2v5.9c0 3.5-2.9 6.4-6.6 6.4S2 17.1 2 13.4 4.9 7 8.6 7c.5 0 1 .1 1.5.2v3.1c-.5-.2-1-.3-1.5-.3-1.9 0-3.4 1.6-3.4 3.4s1.5 3.4 3.4 3.4 3.4-1.6 3.4-3.4V2z"/>
                </svg>
                <h3 className="font-semibold text-white mb-1 sm:mb-2 text-xs sm:text-sm">TikTok</h3>
                <a 
                  href="https://www.tiktok.com/@vaultkeeperirl" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium transition-colors text-center"
                >
                  Follow
                </a>
              </div>
            </div>
            
            {/* YouTube */}
            <div className="h-full bg-gray-800 border border-gray-600 hover:border-red-400 transition rounded-lg">
              <div className="flex flex-col items-center p-2 sm:p-3 h-full">
                <Youtube className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mb-1 sm:mb-2"/>
                <h3 className="font-semibold text-white mb-1 sm:mb-2 text-xs sm:text-sm">YouTube</h3>
                <a 
                  href="https://youtube.com/@VaultkeeperIRL" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium transition-colors text-center"
                >
                  Subscribe
                </a>
              </div>
            </div>
            
            {/* Kick */}
            <div className="h-full bg-gray-800 border border-gray-600 hover:border-green-400 transition rounded-lg">
              <div className="flex flex-col items-center p-2 sm:p-3 h-full">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mb-1 sm:mb-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.5 0L4.7 0C3.4 0 2.3 1.1 2.3 2.4v19.2c0 1.3 1.1 2.4 2.4 2.4h2.8c1.3 0 2.4-1.1 2.4-2.4v-7.2l4.2 4.2c.5.5 1.1.8 1.8.8h3.4c1.3 0 2.4-1.1 2.4-2.4V16.2c0-.7-.3-1.3-.8-1.8L16.7 10.2l4.2-4.2c.5-.5.8-1.1.8-1.8V3.4C21.7 2.1 20.6 1 19.3 1h-3.4c-.7 0-1.3.3-1.8.8L9.9 6V2.4C9.9 1.1 8.8 0 7.5 0z"/>
                </svg>
                <h3 className="font-semibold text-white mb-1 sm:mb-2 text-xs sm:text-sm">Kick</h3>
                <a 
                  href="https://kick.com/Vaultkeeper" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium transition-colors text-center"
                >
                  Watch Live
                </a>
              </div>
            </div>
            
            {/* Spotify */}
            <div className="h-full bg-gray-800 border border-gray-600 hover:border-green-500 transition rounded-lg">
              <div className="flex flex-col items-center p-2 sm:p-3 h-full">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mb-1 sm:mb-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.49 17.34a.75.75 0 0 1-1.03.25c-2.81-1.72-6.36-2.11-10.53-1.15a.75.75 0 1 1-.33-1.47c4.57-1.02 8.48-.58 11.52 1.29c.36.22.48.69.27 1.08zM18.8 14.5a.94.94 0 0 1-1.29.32c-3.21-1.96-8.12-2.53-11.92-1.38a.94.94 0 1 1-.55-1.8c4.32-1.33 9.66-.69 13.32 1.52c.45.27.6.87.44 1.34zM18.94 11.5c-3.72-2.21-9.4-2.41-12.8-1.31a1.13 1.13 0 1 1-.65-2.16c3.96-1.19 10.3-.96 14.56 1.53a1.13 1.13 0 1 1-1.11 1.94z"/>
                </svg>
                <h3 className="font-semibold text-white mb-1 sm:mb-2 text-xs sm:text-sm">Spotify</h3>
                <a 
                  href="https://open.spotify.com/artist/08SO1Oa69ruOUGacCWfKcL" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium transition-colors text-center"
                >
                  Listen
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DeadBeat Fashion Section */}
      <section id="deadbeat" className="py-8 md:py-20 px-3 md:px-6 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">DeadBeat Fashion – Lifestyle Brand</h2>
          <p className="text-gray-300 mb-6 md:mb-8 text-sm md:text-lg px-2">
            Check out <strong>DeadBeat</strong> — an exclusive clothing brand that embodies the spirit of
            streaming culture and street style. Limited drops, premium quality, designed by streamers for
            streamers.
          </p>
          
          {/* DeadBeat logos */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 mb-6 md:mb-8">
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-black rounded-lg p-3 md:p-4 flex items-center justify-center border-2 border-gray-600">
              <img 
                src="https://mocha-cdn.com/01987112-f036-7d2d-8b3f-02e13c03a71b/Pkwyi1qATDulvsRMQsr0Xg.webp" 
                alt="DeadBeat Fashion Brand" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-black rounded-lg flex items-center justify-center p-3 md:p-4 border-2 border-gray-600">
              <img 
                src="https://mocha-cdn.com/01987112-f036-7d2d-8b3f-02e13c03a71b/fullsize-(3).gif" 
                alt="DeadBeat Animation" 
                className="w-full h-full object-contain rounded"
              />
            </div>
          </div>
          
          <a
            href="https://vaults-merch-stand.printify.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <ExternalLink className="h-4 w-4 md:h-5 md:w-5" />
            Shop DeadBeat – Limited Drops
          </a>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 py-6 md:py-10 px-3 md:px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <img 
                src="https://mocha-cdn.com/01987112-f036-7d2d-8b3f-02e13c03a71b/932ddb6a-22a8-48bc-9866-39f86563019b.png" 
                alt="Vaultkeeper Logo" 
                className="w-10 h-10 rounded-full border-2 border-purple-500"
              />
              <span className="text-xl font-bold">vaultkeeper.live</span>
            </div>
            <p className="text-gray-400 text-sm">
              Live streaming, gaming, and building community one stream at a time.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="text-gray-300 space-y-2">
              <li>
                <a 
                  href="https://kick.com/Vaultkeeper"
                  className="hover:text-white transition-colors flex items-center justify-center md:justify-start"
                >
                  🔴 Live Stream
                </a>
              </li>
              <li>
                <button
                  onClick={() => setShowTipModal(true)}
                  className="hover:text-white transition-colors"
                >
                  💰 Tip the Stream
                </button>
              </li>
              <li>
                <Link
                  to="/community-guidelines"
                  className="hover:text-white transition-colors flex items-center justify-center md:justify-start"
                >
                  📋 Community Guidelines
                </Link>
              </li>
              <li>
                <Link
                  to="/chat-overlay"
                  className="hover:text-white transition-colors flex items-center justify-center md:justify-start"
                >
                  📱 IRL Chat Overlay
                </Link>
              </li>
            </ul>
          </div>
          
          {/* DeadBeat Footer */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold mb-3">DeadBeat Fashion</h3>
            <p className="text-gray-400 text-sm mb-3">
              Lifestyle streetwear designed by streamers, for streamers. Limited drops available now.
            </p>
            <a
              href="https://vaults-merch-stand.printify.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-gray-600 text-gray-200 hover:bg-gray-700 px-4 py-2 rounded text-sm transition-colors"
            >
              Visit Store
            </a>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="mt-8 pt-4 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-500">
            © 2024 Vaultkeeper. All rights reserved. • Built for gaming community • Powered by passion for streaming
          </p>
        </div>
      </footer>
      
      {showTipModal && (
        <TipModal onClose={() => setShowTipModal(false)} />
      )}
    </div>
  );
}
