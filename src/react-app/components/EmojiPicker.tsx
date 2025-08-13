import { X } from 'lucide-react';

interface EmojiItem {
  code: string;
  emoji: string;
  name: string;
  customImage?: string;
}

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
  isSubscriber?: boolean;
}

export default function EmojiPicker({ onEmojiSelect, onClose, isSubscriber = false }: EmojiPickerProps) {
  const freeEmojis = [
    {
      category: 'Basic Emojis (Free)',
      emojis: [
        { code: ':smile:', emoji: '😊', name: 'Smile' } as EmojiItem,
        { code: ':laugh:', emoji: '😂', name: 'Laugh' } as EmojiItem,
        { code: ':heart:', emoji: '❤️', name: 'Heart' } as EmojiItem,
        { code: ':thumbsup:', emoji: '👍', name: 'Thumbs Up' } as EmojiItem,
        { code: ':fire:', emoji: '🔥', name: 'Fire' } as EmojiItem,
        { code: ':party:', emoji: '🎉', name: 'Party' } as EmojiItem,
        { code: ':gaming:', emoji: '🎮', name: 'Gaming' } as EmojiItem,
        { code: ':stream:', emoji: '📺', name: 'Stream' } as EmojiItem,
        { code: ':chat:', emoji: '💬', name: 'Chat' } as EmojiItem,
        { code: ':pog:', emoji: '😮', name: 'Pog' } as EmojiItem,
      ]
    }
  ];

  const premiumEmojis = [
    {
      category: 'Subscriber emotes',
      emojis: [
        { code: ':eyes:', emoji: '👀', name: 'Eyes' } as EmojiItem,
        { code: ':skull:', emoji: '💀', name: 'Skull' } as EmojiItem,
        { code: ':thumbsdown:', emoji: '👎', name: 'Thumbs Down' } as EmojiItem,
        { code: ':clap:', emoji: '👏', name: 'Clap' } as EmojiItem,
        { code: ':rocket:', emoji: '🚀', name: 'Rocket' } as EmojiItem,
        { code: ':100:', emoji: '💯', name: '100' } as EmojiItem,
        { code: ':rainbow:', emoji: '🌈', name: 'Rainbow' } as EmojiItem,
        { code: ':star:', emoji: '⭐', name: 'Star' } as EmojiItem,
        { code: ':diamond:', emoji: '💎', name: 'Diamond' } as EmojiItem,
        { code: ':kappa:', emoji: '🐸', name: 'Kappa' } as EmojiItem,
        { code: ':omegalul:', emoji: '😂', name: 'OMEGALUL' } as EmojiItem,
        { code: ':sadge:', emoji: '😢', name: 'Sadge' } as EmojiItem,
        { code: ':copium:', emoji: '😤', name: 'Copium' } as EmojiItem,
        { code: ':based:', emoji: '😎', name: 'Based' } as EmojiItem,
        { code: ':cringe:', emoji: '😬', name: 'Cringe' } as EmojiItem,
        { code: ':gigachad:', emoji: '💪', name: 'GigaChad' } as EmojiItem,
        { code: ':pepega:', emoji: '🤪', name: 'Pepega' } as EmojiItem,
        { code: ':pogchamp:', emoji: '😱', name: 'PogChamp' } as EmojiItem,
        { code: ':kekw:', emoji: '😂', name: 'KEKW' } as EmojiItem,
        { code: ':pepehands:', emoji: '😢', name: 'PepeHands' } as EmojiItem,
        { code: ':monkas:', emoji: '😰', name: 'MonkaS' } as EmojiItem,
        { code: ':5head:', emoji: '🧠', name: '5Head' } as EmojiItem,
        { code: ':ez:', emoji: '😎', name: 'EZ' } as EmojiItem,
      ]
    }
  ];

  const emojiCategories = isSubscriber ? [...freeEmojis, ...premiumEmojis] : freeEmojis;

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl w-80 max-h-96 overflow-hidden z-[50000]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 flex items-center justify-between">
        <h3 className="text-white font-medium">
          {isSubscriber ? 'Premium Emojis ✨' : 'Basic Emojis'}
        </h3>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Emoji Grid */}
      <div className="p-4 max-h-80 overflow-y-auto">
        {emojiCategories.map((category) => (
          <div key={category.category} className="mb-4">
            <h4 className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wider">
              {category.category}
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {category.emojis.map((emoji: EmojiItem) => {
                const isPremiumOnly = category.category === 'Subscriber emotes' && !isSubscriber;
                return (
                  <button
                    key={emoji.code}
                    onClick={() => {
                      if (!isPremiumOnly) {
                        onEmojiSelect(emoji.code);
                      }
                    }}
                    className={`p-2 rounded-lg transition-colors group flex flex-col items-center ${
                      isPremiumOnly
                        ? 'opacity-50 cursor-not-allowed bg-gray-800'
                        : 'hover:bg-gray-700'
                    }`}
                    title={`${emoji.name} (${emoji.code})${
                      isPremiumOnly ? ' - Premium Only' : ''
                    }`}
                    disabled={isPremiumOnly}
                  >
                    {emoji.customImage ? (
                      <img src={emoji.customImage} alt={emoji.name} className="w-8 h-8 mb-1 object-contain" />
                    ) : (
                      <span className="text-2xl mb-1">{emoji.emoji}</span>
                    )}
                    <span className="text-xs text-gray-400 group-hover:text-gray-300 truncate w-full text-center">
                      {emoji.code}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-gray-700 p-3 text-center">
        <p className="text-xs text-gray-400">
          Click to add emoji code to your message
        </p>
        {!isSubscriber && (
          <p className="text-xs text-purple-400 mt-1">
            Subscribe for premium emojis! ✨
          </p>
        )}
      </div>
    </div>
  );
}
