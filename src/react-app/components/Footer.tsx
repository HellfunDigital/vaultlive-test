// Footer component for the app

interface FooterProps {
  onDonate?: () => void;
}

export default function Footer({ onDonate }: FooterProps) {
  return (
    <footer className="bg-gray-900 py-8 md:py-10 px-4 md:px-6 border-t border-gray-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
            <img 
              src="https://mocha-cdn.com/01987112-f036-7d2d-8b3f-02e13c03a71b/932ddb6a-22a8-48bc-9866-39f86563019b.png" 
              alt="Vaultkeeper Logo" 
              className="w-10 h-10 rounded-full border-2 border-purple-500"
              loading="lazy"
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
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center justify-center md:justify-start"
              >
                🔴 Live Stream
              </a>
            </li>
            <li>
              {onDonate ? (
                <button
                  onClick={onDonate}
                  className="hover:text-white transition-colors"
                >
                  💰 Support the Stream
                </button>
              ) : (
                <span className="text-gray-500">💰 Support the Stream</span>
              )}
            </li>
            <li>
              <a 
                href="/community-guidelines"
                className="hover:text-white transition-colors"
              >
                📋 Community Guidelines
              </a>
            </li>
            <li>
              <a 
                href="/obs-panel"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                🎛️ OBS Panel
              </a>
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
  );
}
