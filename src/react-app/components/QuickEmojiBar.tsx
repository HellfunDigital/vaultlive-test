import { useEffect, useState } from 'react';

interface QuickEmojiBarProps {
  onEmojiSelect: (emoji: string) => void;
  onEmojiSend?: (emoji: string) => void;
  isSubscriber?: boolean;
}

interface EmojiItem {
  code: string;
  emoji: string;
  name: string;
  customImage?: string;
  isSubscriber?: boolean;
}

export default function QuickEmojiBar({ onEmojiSelect, onEmojiSend, isSubscriber = false }: QuickEmojiBarProps) {
  const [recentEmojis, setRecentEmojis] = useState<EmojiItem[]>([]);

  // All available emojis
  const allEmojis: EmojiItem[] = [
    // Free emojis
    { code: ':smile:', emoji: '😊', name: 'Smile' },
    { code: ':laugh:', emoji: '😂', name: 'Laugh' },
    { code: ':heart:', emoji: '❤️', name: 'Heart' },
    { code: ':thumbsup:', emoji: '👍', name: 'Thumbs Up' },
    { code: ':fire:', emoji: '🔥', name: 'Fire' },
    { code: ':party:', emoji: '🎉', name: 'Party' },
    { code: ':gaming:', emoji: '🎮', name: 'Gaming' },
    { code: ':stream:', emoji: '📺', name: 'Stream' },
    { code: ':chat:', emoji: '💬', name: 'Chat' },
    { code: ':pog:', emoji: '😮', name: 'Pog' },
    
    // Premium emojis
    { code: ':eyes:', emoji: '👀', name: 'Eyes', isSubscriber: true },
    { code: ':skull:', emoji: '💀', name: 'Skull', isSubscriber: true },
    { code: ':thumbsdown:', emoji: '👎', name: 'Thumbs Down', isSubscriber: true },
    { code: ':clap:', emoji: '👏', name: 'Clap', isSubscriber: true },
    { code: ':rocket:', emoji: '🚀', name: 'Rocket', isSubscriber: true },
    { code: ':100:', emoji: '💯', name: '100', isSubscriber: true },
    { code: ':rainbow:', emoji: '🌈', name: 'Rainbow', isSubscriber: true },
    { code: ':star:', emoji: '⭐', name: 'Star', isSubscriber: true },
    { code: ':diamond:', emoji: '💎', name: 'Diamond', isSubscriber: true },
    { code: ':kappa:', emoji: '🐸', name: 'Kappa', isSubscriber: true },
    { code: ':omegalul:', emoji: '😂', name: 'OMEGALUL', isSubscriber: true },
    { code: ':sadge:', emoji: '😢', name: 'Sadge', isSubscriber: true },
    { code: ':copium:', emoji: '😤', name: 'Copium', isSubscriber: true },
    { code: ':based:', emoji: '😎', name: 'Based', isSubscriber: true },
    { code: ':cringe:', emoji: '😬', name: 'Cringe', isSubscriber: true },
    { code: ':gigachad:', emoji: '💪', name: 'GigaChad', isSubscriber: true },
    { code: ':pepega:', emoji: '🤪', name: 'Pepega', isSubscriber: true },
    { code: ':pogchamp:', emoji: '😱', name: 'PogChamp', isSubscriber: true },
    { code: ':kekw:', emoji: '😂', name: 'KEKW', isSubscriber: true },
    { code: ':pepehands:', emoji: '😢', name: 'PepeHands', isSubscriber: true },
    { code: ':monkas:', emoji: '😰', name: 'MonkaS', isSubscriber: true },
    { code: ':5head:', emoji: '🧠', name: '5Head', isSubscriber: true },
    { code: ':ez:', emoji: '😎', name: 'EZ', isSubscriber: true },
  ];

  // Load recent emojis from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-emojis');
    if (saved) {
      try {
        const savedCodes = JSON.parse(saved);
        const recentEmojiItems = savedCodes
          .map((code: string) => allEmojis.find(e => e.code === code))
          .filter((emoji: EmojiItem | undefined): emoji is EmojiItem => emoji !== undefined)
          .slice(0, 10); // Limit to 10 recent emojis
        setRecentEmojis(recentEmojiItems);
      } catch (error) {
        console.error('Failed to parse recent emojis:', error);
      }
    }

    // If no recent emojis, show popular defaults
    if (recentEmojis.length === 0) {
      const defaultEmojis = [
        ':smile:', ':laugh:', ':heart:', ':fire:', ':party:', 
        ':thumbsup:', ':gaming:', ':stream:', ':pog:', ':chat:'
      ];
      const defaultEmojiItems = defaultEmojis
        .map(code => allEmojis.find(e => e.code === code))
        .filter((emoji: EmojiItem | undefined): emoji is EmojiItem => emoji !== undefined);
      setRecentEmojis(defaultEmojiItems);
    }
  }, []);

  // Update recent emojis when one is selected
  const handleEmojiClick = (emoji: EmojiItem) => {
    if (emoji.isSubscriber && !isSubscriber) {
      return; // Don't allow non-subscribers to use premium emojis
    }

    // If onEmojiSend is provided, send directly to chat
    // Otherwise, add to input field (for backwards compatibility)
    if (onEmojiSend) {
      onEmojiSend(emoji.code);
    } else {
      onEmojiSelect(emoji.code);
    }
    
    // Update recent emojis list
    const updatedRecent = [
      emoji,
      ...recentEmojis.filter(e => e.code !== emoji.code)
    ].slice(0, 10);
    
    setRecentEmojis(updatedRecent);
    
    // Save to localStorage
    localStorage.setItem('recent-emojis', JSON.stringify(updatedRecent.map(e => e.code)));
  };

  // Filter emojis based on subscription status
  const displayedEmojis = recentEmojis.filter(emoji => 
    !emoji.isSubscriber || isSubscriber
  );

  if (displayedEmojis.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-2">
      <div className="flex items-center space-x-1">
        <span className="text-xs text-gray-400 mr-2">Quick:</span>
        <div className="flex items-center space-x-1 overflow-x-auto">
          {displayedEmojis.map((emoji) => (
            <button
              key={emoji.code}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEmojiClick(emoji);
              }}
              className="flex-shrink-0 p-1.5 rounded-md hover:bg-gray-700 transition-colors group"
              title={`${emoji.name} (${emoji.code})`}
            >
              {emoji.customImage ? (
                <img 
                  src={emoji.customImage} 
                  alt={emoji.name} 
                  className="w-6 h-6 object-contain" 
                />
              ) : (
                <span className="text-lg">{emoji.emoji}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
