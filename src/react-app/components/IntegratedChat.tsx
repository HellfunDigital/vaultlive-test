import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { Send, MessageCircle, Crown, Settings, Trash2, Smile, ShoppingCart, Gift, Ban } from 'lucide-react';
import { Link } from 'react-router';
import UsernameModal from './UsernameModal';
import SubscriptionModal from './SubscriptionModal';
import GiftSubscriptionModal from './GiftSubscriptionModal';
import EmojiPicker from './EmojiPicker';
import QuickEmojiBar from './QuickEmojiBar';
import TTSControlsPanel from './TTSControlsPanel';
import PointsShop from './PointsShop';
import { useNotifications } from '@/react-app/hooks/useNotifications';
import type { ChatMessage, ExtendedMochaUser } from '@/shared/types';

export default function IntegratedChat() {
  const { user, redirectToLogin } = useAuth();
  const extendedUser = user as ExtendedMochaUser;
  const { showNotification } = useNotifications();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPointsShop, setShowPointsShop] = useState(false);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [pinnedMessage, setPinnedMessage] = useState<any>(null);
  const [pinCountdown, setPinCountdown] = useState(0);
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    username: string;
    messageId?: number;
    messageText?: string;
  }>({ show: false, x: 0, y: 0, username: '' });
  const [showCommandSuggestions, setShowCommandSuggestions] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState<Array<{command: string, description: string, adminOnly?: boolean}>>([]);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if user is banned
  const isBanned = extendedUser?.localUser?.is_banned;

  // Available slash commands
  const availableCommands = [
    { command: '/ban', description: 'Ban a user from chat', adminOnly: true },
    { command: '/unban', description: 'Unban a user from chat', adminOnly: true },
    { command: '/timeout', description: 'Timeout a user for specified duration', adminOnly: true },
    { command: '/untimeout', description: 'Remove timeout from a user', adminOnly: true },
    { command: '/mod', description: 'Give moderator privileges to a user', adminOnly: true },
    { command: '/unmod', description: 'Remove moderator privileges from a user', adminOnly: true },
    { command: '/clear', description: 'Clear the chat', adminOnly: true },
    { command: '/pin', description: 'Pin a message for specified duration', adminOnly: true },
    { command: '/unpin', description: 'Remove pinned message', adminOnly: true },
    { command: '/slow', description: 'Enable slow mode with specified interval', adminOnly: true },
    { command: '/slowoff', description: 'Disable slow mode', adminOnly: true },
    { command: '/subsonly', description: 'Enable subscribers-only mode', adminOnly: true },
    { command: '/subsoff', description: 'Disable subscribers-only mode', adminOnly: true },
    { command: '/followers', description: 'Enable followers-only mode', adminOnly: true },
    { command: '/followersoff', description: 'Disable followers-only mode', adminOnly: true },
    { command: '/emoteonly', description: 'Enable emote-only mode', adminOnly: true },
    { command: '/emoteonlyoff', description: 'Disable emote-only mode', adminOnly: true },
    { command: '/announce', description: 'Send an announcement message', adminOnly: true },
    { command: '/shoutout', description: 'Give a shoutout to another streamer' },
    { command: '/so', description: 'Alias for shoutout command' },
    { command: '/raid', description: 'Raid another channel', adminOnly: true },
    { command: '/host', description: 'Host another channel', adminOnly: true },
    { command: '/unhost', description: 'Stop hosting', adminOnly: true },
    { command: '/uptime', description: 'Show how long the stream has been live' },
    { command: '/followage', description: 'Show how long you have been following' },
    { command: '/me', description: 'Send a message in third person' },
    { command: '/w', description: 'Send a whisper/private message' },
    { command: '/whisper', description: 'Send a whisper/private message' },
    { command: '/ignore', description: 'Ignore messages from a user' },
    { command: '/unignore', description: 'Stop ignoring messages from a user' },
    { command: '/block', description: 'Block a user' },
    { command: '/unblock', description: 'Unblock a user' },
    { command: '/color', description: 'Change your username color' },
    { command: '/commercial', description: 'Run a commercial break', adminOnly: true },
    { command: '/marker', description: 'Create a stream marker', adminOnly: true },
    { command: '/title', description: 'Change the stream title', adminOnly: true },
    { command: '/game', description: 'Change the stream category/game', adminOnly: true },
    { command: '/commands', description: 'Show list of available commands' },
    { command: '/help', description: 'Show help information' }
  ];

  const scrollToBottom = (force = false) => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      if (force || isUserAtBottom) {
        container.scrollTop = container.scrollHeight;
        setIsUserAtBottom(true);
      }
    }
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const threshold = 100; // pixels from bottom
      const isNearBottom = 
        container.scrollTop + container.clientHeight >= 
        container.scrollHeight - threshold;
      setIsUserAtBottom(isNearBottom);
    }
  };

  const fetchMessages = async (shouldScrollToBottom = false) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('/api/chat/messages', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setMessages(prevMessages => {
          // Check for new messages and trigger notifications
          if (data.length > prevMessages.length) {
            const newMessages = data.slice(prevMessages.length);
            newMessages.forEach((message: ChatMessage) => {
              // Check if this is a System tip message
              if (message.username === 'System' && message.message.includes('donated $')) {
                const tipMatch = message.message.match(/💰\s(.+?)\sdonated\s\$(\d+\.?\d*)/);
                if (tipMatch) {
                  const tipper = tipMatch[1];
                  const amount = parseFloat(tipMatch[2]);
                  
                  // Extract message if present
                  const messageMatch = message.message.match(/:\s"(.+)"/);
                  const tipMessage = messageMatch ? messageMatch[1] : '';
                  
                  // Show notification
                  showNotification({
                    type: 'donation',
                    title: `${tipper} Tipped!`,
                    message: tipMessage || `Thank you for the $${amount.toFixed(2)} tip!`,
                    data: { amount, donorName: tipper, message: tipMessage },
                    sound: 'donation'
                  });
                  
                  // Still trigger TTS event for backward compatibility
                  const tipEvent = new CustomEvent('tip-tts', {
                    detail: { donorName: tipper, amount, message: tipMessage }
                  });
                  window.dispatchEvent(tipEvent);
                }
              }
              // Check for subscription messages
              else if (message.username === 'System' && message.message.includes('just subscribed')) {
                const subMatch = message.message.match(/🎉\s(.+?)\sjust subscribed/);
                if (subMatch) {
                  const subscriberName = subMatch[1];
                  
                  showNotification({
                    type: 'subscription',
                    title: `${subscriberName} Subscribed!`,
                    message: 'Welcome to the premium community!',
                    data: { subscriberName },
                    sound: 'subscription'
                  });
                  
                  const ttsEvent = new CustomEvent('tts-request', {
                    detail: {
                      text: `${subscriberName} just subscribed! Welcome to the premium community!`,
                      type: 'subscription'
                    }
                  });
                  window.dispatchEvent(ttsEvent);
                }
              }
              // Check for level up messages
              else if (message.username === 'System' && message.message.includes('just reached Level')) {
                const levelMatch = message.message.match(/🎉\s(.+?)\sjust reached Level\s(\d+)/);
                if (levelMatch) {
                  const userName = levelMatch[1];
                  const level = parseInt(levelMatch[2]);
                  
                  showNotification({
                    type: 'level_up',
                    title: `${userName} Leveled Up!`,
                    message: `Congratulations on reaching Level ${level}!`,
                    data: { userName, level },
                    sound: 'level_up'
                  });
                  
                  const ttsEvent = new CustomEvent('tts-request', {
                    detail: {
                      text: `${userName} just reached Level ${level}! Congratulations!`,
                      type: 'level_up'
                    }
                  });
                  window.dispatchEvent(ttsEvent);
                }
              }
              // Check for Points Shop purchase messages
              else if (message.username === 'PointsShop') {
                const pointsMatch = message.message.match(/(\d+)\s+points/);
                const usernameMatch = message.message.match(/^[⚡✨🌈📌👑📢🎵]\s+(.+?)\s+purchased/);
                
                if (usernameMatch) {
                  const purchaserName = usernameMatch[1];
                  const points = pointsMatch ? parseInt(pointsMatch[1]) : 0;
                  
                  showNotification({
                    type: 'points_purchase',
                    title: `${purchaserName} Used Points!`,
                    message: message.message,
                    data: { purchaserName, points },
                    sound: 'points_purchase'
                  });
                }
                
                const ttsEvent = new CustomEvent('tts-request', {
                  detail: {
                    text: message.message,
                    type: 'points_shop'
                  }
                });
                window.dispatchEvent(ttsEvent);
              }
              // Check for mentions of current user
              else if (message.username !== 'System' && 
                       message.username !== 'ShoutoutBot' && 
                       message.username !== 'PointsShop' && 
                       message.username !== 'TTSShop' &&
                       extendedUser?.localUser?.name &&
                       message.message.toLowerCase().includes(`@${extendedUser.localUser.name.toLowerCase()}`)) {
                
                showNotification({
                  type: 'chat_mention',
                  title: `${message.username} mentioned you!`,
                  message: message.message,
                  data: { mentioner: message.username },
                  sound: 'chat_mention'
                });
              }
              // Play sound for regular chat messages (but not your own messages)
              else if (message.username !== 'System' && 
                       message.username !== 'ShoutoutBot' && 
                       message.username !== 'PointsShop' && 
                       message.username !== 'TTSShop' &&
                       message.platform === 'vaultkeeper' &&
                       !message.message.startsWith('!') &&
                       !message.message.startsWith('/') &&
                       message.username !== extendedUser?.localUser?.name) {
                
                // Play a subtle sound for regular chat messages from other users
                showNotification({
                  type: 'system',
                  title: 'New Message',
                  message: `${message.username}: ${message.message}`,
                  data: { username: message.username, message: message.message },
                  sound: 'system',
                  persistent: false
                });
                
                // Also trigger TTS for regular chat messages
                const chatTTSEvent = new CustomEvent('chat-tts', {
                  detail: {
                    username: message.username,
                    message: message.message,
                    isSubscriber: message.is_subscriber,
                    isAdmin: message.platform === 'vaultkeeper' && extendedUser?.localUser?.is_admin
                  }
                });
                window.dispatchEvent(chatTTSEvent);
              }
            });
          }
          
          // If new messages arrived and user is at bottom, we'll scroll
          if (data.length > prevMessages.length && isUserAtBottom) {
            setTimeout(() => scrollToBottom(), 100);
          }
          return data;
        });
        
        // Force scroll if explicitly requested (like after sending a message)
        if (shouldScrollToBottom) {
          setTimeout(() => scrollToBottom(true), 100);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to fetch messages:', error);
      }
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isLoading) return;

    setIsLoading(true);
    try {
      const messageData: any = { message: newMessage };
      
      // Add reply data if replying to a message
      if (replyingTo) {
        messageData.replied_to_message_id = replyingTo.id;
        messageData.replied_to_username = replyingTo.username;
      }

      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        // Don't trigger TTS for your own messages since you just typed them
        // TTS is for hearing other people's messages

        setNewMessage('');
        setReplyingTo(null); // Clear reply state
        // Always scroll to bottom when user sends a message
        setIsUserAtBottom(true);
        fetchMessages(true); // Refresh messages and force scroll
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = async (messageId: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchMessages(); // Refresh messages
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message');
    }
  };

  const fetchUserSubscription = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/subscriptions/me', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const subscription = await response.json();
        setUserSubscription(subscription);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const response = await fetch('/api/stats/online-users');
      if (response.ok) {
        const data = await response.json();
        setOnlineUsers(data.onlineUsers || 0);
      }
    } catch (error) {
      console.error('Failed to fetch online users:', error);
    }
  };

  const fetchPinnedMessage = async () => {
    try {
      const response = await fetch('/api/chat/pinned-message');
      if (response.ok) {
        const data = await response.json();
        setPinnedMessage(data.pinnedMessage || null);
        
        // Update countdown
        if (data.pinnedMessage) {
          const expiresAt = new Date(data.pinnedMessage.expires_at).getTime();
          const now = new Date().getTime();
          const timeLeft = Math.max(0, Math.ceil((expiresAt - now) / 1000));
          setPinCountdown(timeLeft);
        } else {
          setPinCountdown(0);
        }
      }
    } catch (error) {
      console.error('Failed to fetch pinned message:', error);
    }
  };

  // Handle removing pinned message (admin/mod only)
  const removePinnedMessage = async () => {
    if (!pinnedMessage) return;

    try {
      const response = await fetch('/api/admin/remove-pinned-message', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setPinnedMessage(null);
        setPinCountdown(0);
        // Refresh messages
        fetchMessages();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to remove pinned message');
      }
    } catch (error) {
      console.error('Failed to remove pinned message:', error);
      alert('Failed to remove pinned message');
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Handle command suggestions
  const handleInputChange = (value: string) => {
    setNewMessage(value);
    
    // Check if input starts with '/' and show command suggestions
    if (value.startsWith('/')) {
      const commandText = value.slice(1).toLowerCase();
      
      // Filter commands based on user permissions and input
      const filtered = availableCommands.filter(cmd => {
        // Check permissions
        if (cmd.adminOnly && !extendedUser?.localUser?.is_admin && !extendedUser?.localUser?.is_moderator) {
          return false;
        }
        
        // Filter by typed text
        return cmd.command.slice(1).toLowerCase().includes(commandText) ||
               cmd.description.toLowerCase().includes(commandText);
      });
      
      setFilteredCommands(filtered);
      setShowCommandSuggestions(filtered.length > 0 && commandText.length >= 0);
      setSelectedCommandIndex(0);
    } else {
      setShowCommandSuggestions(false);
      setFilteredCommands([]);
    }
  };

  // Handle command selection
  const selectCommand = (command: string) => {
    setNewMessage(command + ' ');
    setShowCommandSuggestions(false);
    setFilteredCommands([]);
    // Focus back on input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // Handle keyboard navigation in command suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showCommandSuggestions || filteredCommands.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedCommandIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedCommandIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        break;
      case 'Enter':
        if (filteredCommands[selectedCommandIndex]) {
          e.preventDefault();
          selectCommand(filteredCommands[selectedCommandIndex].command);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowCommandSuggestions(false);
        setFilteredCommands([]);
        break;
    }
  };

  // Handle right-click context menu on usernames
  const handleUsernameRightClick = (e: React.MouseEvent, username: string, messageId?: number, messageText?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't show context menu for system users or if user is not logged in
    if (!user || username === 'System' || username === 'ShoutoutBot' || username === 'PointsShop' || username === 'TTSShop') {
      return;
    }

    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      username: username,
      messageId: messageId,
      messageText: messageText
    });
  };

  // Close context menu
  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, username: '' });
  };

  // Handle gift subscription from context menu
  const handleGiftFromContext = () => {
    if (!user) {
      redirectToLogin();
      return;
    }
    setShowGiftModal(true);
    closeContextMenu();
  };

  // Handle pin message from context menu
  const handlePinMessage = async () => {
    if (!contextMenu.messageId || !contextMenu.messageText || !contextMenu.username) {
      return;
    }

    try {
      const response = await fetch('/api/admin/pin-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message_id: contextMenu.messageId,
          message_text: contextMenu.messageText,
          username: contextMenu.username,
          duration: 60 // Pin for 60 seconds by default
        }),
      });

      if (response.ok) {
        // Refresh messages to show the new pinned message
        fetchMessages();
        fetchPinnedMessage();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to pin message');
      }
    } catch (error) {
      console.error('Failed to pin message:', error);
      alert('Failed to pin message');
    } finally {
      closeContextMenu();
    }
  };

  // Click outside handler for context menu and command suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu.show) {
        closeContextMenu();
      }
      if (showCommandSuggestions) {
        // Check if click is outside the input and command suggestions
        const target = event.target as Element;
        if (!target.closest('.relative')) {
          setShowCommandSuggestions(false);
          setFilteredCommands([]);
        }
      }
    };

    if (contextMenu.show || showCommandSuggestions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.show, showCommandSuggestions]);

  const renderMessageText = (text: string, messageIsSubscriber: boolean, messageIsAdmin: boolean) => {
    // Free emojis available to all users
    const freeEmojis: { [key: string]: string } = {
      ':smile:': '😊',
      ':laugh:': '😂',
      ':heart:': '❤️',
      ':thumbsup:': '👍',
      ':fire:': '🔥',
      ':party:': '🎉',
      ':gaming:': '🎮',
      ':stream:': '📺',
      ':chat:': '💬',
      ':pog:': '😮',
    };

    // Premium emojis only for subscribers
    const premiumEmojis: { [key: string]: string } = {
      ':eyes:': '👀',
      ':skull:': '💀',
      ':thumbsdown:': '👎',
      ':clap:': '👏',
      ':rocket:': '🚀',
      ':100:': '💯',
      ':rainbow:': '🌈',
      ':star:': '⭐',
      ':diamond:': '💎',
      ':pogchamp:': '😱',
      ':kekw:': '😂',
      ':pepehands:': '😢',
      ':monkas:': '😰',
      ':5head:': '🧠',
      ':ez:': '😎',
      ':kappa:': '🐸',
      ':omegalul:': '😂',
      ':sadge:': '😢',
      ':copium:': '😤',
      ':based:': '😎',
      ':cringe:': '😬',
      ':gigachad:': '💪',
      ':pepega:': '🤪'
    };

    let processedText = text;
    
    // Always convert free emojis
    for (const [code, emoji] of Object.entries(freeEmojis)) {
      processedText = processedText.replace(new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), emoji);
    }
    
    // Only convert premium emojis for subscribers or admins
    if (messageIsSubscriber || messageIsAdmin) {
      for (const [code, emoji] of Object.entries(premiumEmojis)) {
        processedText = processedText.replace(new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), emoji);
      }
    }
    
    // Convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    processedText = processedText.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>');
    
    return processedText;
  };

  useEffect(() => {
    fetchMessages(true); // Initial load should scroll to bottom
    fetchUserSubscription();
    fetchOnlineUsers();
    fetchPinnedMessage();
    const interval = setInterval(() => {
      fetchMessages(); // Regular polling should respect scroll position
      fetchOnlineUsers();
      fetchPinnedMessage();
    }, 5000); // Poll every 5 seconds (reduced from 3)
    return () => clearInterval(interval);
  }, [user]);

  // Countdown timer for pinned messages
  useEffect(() => {
    if (pinCountdown > 0) {
      const timer = setTimeout(() => {
        setPinCountdown(pinCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (pinCountdown === 0 && pinnedMessage) {
      // Message expired, refresh to remove it
      setTimeout(fetchPinnedMessage, 1000);
    }
  }, [pinCountdown, pinnedMessage]);

  

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 sm:p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold flex items-center space-x-2 sm:space-x-3">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Chat</span>
          </h2>
          <div className="text-xs sm:text-sm opacity-75 font-medium">
            {onlineUsers} online
          </div>
        </div>
        <p className="text-purple-100 text-xs sm:text-sm mt-1">
          Chat with the community • Also streaming on Kick & Twitch
        </p>
      </div>

      {/* Pinned Message */}
      {pinnedMessage && (
        <div className={`p-3 mx-3 mt-3 rounded-r-lg ${
          pinnedMessage.created_at && new Date().getTime() - new Date(pinnedMessage.created_at).getTime() < 35000
            ? 'paid-pin' // Paid pin (created within last 35 seconds)
            : 'admin-pin' // Admin/mod pin
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className={`w-4 h-4 ${
                pinnedMessage.created_at && new Date().getTime() - new Date(pinnedMessage.created_at).getTime() < 35000
                  ? 'text-yellow-400' 
                  : 'text-blue-400'
              }`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className={`font-semibold text-sm ${
                pinnedMessage.created_at && new Date().getTime() - new Date(pinnedMessage.created_at).getTime() < 35000
                  ? 'text-yellow-400' 
                  : 'text-blue-400'
              }`}>
                📌 {pinnedMessage.created_at && new Date().getTime() - new Date(pinnedMessage.created_at).getTime() < 35000 
                  ? 'Paid Pin' 
                  : 'Pinned Message'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-400">
                {pinCountdown}s left
              </div>
              {/* Remove pin button for admin/mod */}
              {(extendedUser?.localUser?.is_admin || extendedUser?.localUser?.is_moderator) && (
                <button
                  onClick={removePinnedMessage}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  title="Remove pinned message"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className="mt-2">
            <span className={`font-medium ${
              pinnedMessage.created_at && new Date().getTime() - new Date(pinnedMessage.created_at).getTime() < 35000
                ? 'text-yellow-300' 
                : 'text-blue-300'
            }`}>{pinnedMessage.username}:</span>
            <span className="text-white ml-2">{pinnedMessage.message_text}</span>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 relative bg-gray-900 min-h-0">
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className={`h-full overflow-y-auto p-3 space-y-2 ${!user || isBanned ? 'blur-sm' : ''}`}
          style={{ scrollBehavior: 'smooth' }}
        >
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8 sm:py-12">
            <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
            <h3 className="text-base sm:text-lg font-medium mb-2">Welcome to the chat!</h3>
            <p className="text-xs sm:text-sm">{user ? "Start the conversation!" : "Login to join the chat"}</p>
            {!user && (
              <div className="mt-6 space-y-2 text-xs">
                <p>💬 Also chatting on:</p>
                <div className="flex justify-center space-x-4">
                  <a 
                    href="https://kick.com/vaultkeeper" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300"
                  >
                    Kick
                  </a>
                  <a 
                    href="https://twitch.tv/vaultkeeperirl" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300"
                  >
                    Twitch
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          messages.map((message) => {
            // Get displayed badges (user's choice of which badges to show) with error handling
            // Falls back to all badges if displayed_badges is not set
            const allUserBadges = (() => {
              try {
                return message.user_badges ? JSON.parse(message.user_badges) : [];
              } catch (error) {
                console.error('Error parsing message user_badges:', error);
                return [];
              }
            })();
            
            const displayedBadges = (() => {
              try {
                const badges = message.displayed_badges ? JSON.parse(message.displayed_badges) : allUserBadges;
                // Limit to maximum of 3 badges for display
                return badges.slice(0, 3);
              } catch (error) {
                console.error('Error parsing message displayed_badges:', error);
                return allUserBadges.slice(0, 3);
              }
            })();

            // Check for message effects based on database records
            const hasHighlightEffect = message.has_highlight_effect || false;
            const hasRainbowEffect = message.has_rainbow_effect || false;
            const hasNameGlow = message.name_glow_color || null;
            const isPinned = pinnedMessage && pinnedMessage.message_id === message.id;
            
            return (
              <div 
                key={message.id} 
                className={`group rounded-lg p-2 transition-colors duration-150 ${
                  hasHighlightEffect ? 'bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 border border-yellow-500/50 shadow-lg shadow-yellow-500/20' :
                  isPinned ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/50' :
                  'hover:bg-gray-800/30'
                }`}
              >
                {/* Reply indicator */}
                {message.replied_to_message_id && message.replied_to_username && (
                  <div className="flex items-center space-x-1 text-xs text-gray-400 mb-1 pl-4">
                    <span>↳ Replying to</span>
                    <span className="text-purple-400 font-medium">@{message.replied_to_username}</span>
                  </div>
                )}
                <div className="flex items-start space-x-2">
                  <div className="flex items-center space-x-2">
                    {/* Display badges BEFORE username - on the left side */}
                    <div className="flex items-center space-x-1">
                      {displayedBadges.map((badge: string) => {
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

                        return (
                          <div
                            key={badge}
                            className={`flex items-center px-1.5 py-0.5 ${getBadgeColor(badge)} text-white rounded-full text-xs font-medium`}
                            title={badge}
                          >
                            <span className="leading-none">{getBadgeIcon(badge)}</span>
                          </div>
                        );
                      })}
                      
                      {message.is_subscriber && (
                        <div 
                          title={message.platform === 'vaultkeeper' ? 'VaultKeeper Subscriber' : 'Subscriber'}
                          className="flex items-center bg-purple-600 px-1.5 py-0.5 rounded-full"
                        >
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Username with colon */}
                    {message.user_id && message.platform === 'vaultkeeper' ? (
                      <Link
                        to={`/profile/${message.user_id}`}
                        onContextMenu={(e) => handleUsernameRightClick(e, message.username?.toString().replace(/\s+\d+$/, '').trim() || 'Unknown', message.id, message.message)}
                        className={`font-semibold text-sm hover:underline ${hasNameGlow ? 'name-glow' : ''}`}
                        style={{ 
                          color: hasNameGlow || message.name_color || (
                            message.is_subscriber ? '#c084fc' : '#d1d5db'
                          )
                        }}
                      >
                        {message.username?.toString().replace(/\s+\d+$/, '').trim() || 'Unknown'}:
                      </Link>
                    ) : (
                      <span 
                        onContextMenu={(e) => handleUsernameRightClick(e, message.username?.toString().replace(/\s+\d+$/, '').trim() || 'Unknown', message.id, message.message)}
                        className={`font-semibold text-sm cursor-pointer ${hasNameGlow ? 'name-glow' : ''}`}
                        style={{ 
                          color: hasNameGlow || message.name_color || (
                            message.is_subscriber ? '#c084fc' : 
                            message.platform === 'twitch' ? '#d8b4fe' :
                            message.platform === 'kick' ? '#86efac' :
                            '#d1d5db'
                          )
                        }}
                      >
                        {message.username?.toString().replace(/\s+\d+$/, '').trim() || 'Unknown'}:
                      </span>
                    )}
                  </div>
                  
                  <span 
                    className={`text-sm break-words flex-1 ${
                      hasRainbowEffect ? 'rainbow-text' : 'text-white'
                    } ${hasHighlightEffect ? 'highlight-glow' : ''}`}
                    dangerouslySetInnerHTML={{
                      __html: renderMessageText(message.message, !!message.is_subscriber, !!(message.platform === 'vaultkeeper' && extendedUser?.localUser?.is_admin))
                    }}
                  />
                  
                  <span className="text-xs text-gray-400 shrink-0">
                    {new Date(message.created_at + 'Z').toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                  
                  {/* Reply Button */}
                  {user && !isBanned && (
                    <button
                      onClick={() => {
                        setReplyingTo(message);
                        // Focus the input after setting reply
                        setTimeout(() => {
                          inputRef.current?.focus();
                        }, 0);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-purple-400 text-gray-500 transition-all duration-200 shrink-0"
                      title="Reply to message"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Admin/Moderator Delete Button */}
                  {(extendedUser?.localUser?.is_admin || extendedUser?.localUser?.is_moderator) && (
                    <button
                      onClick={() => deleteMessage(message.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-gray-500 transition-all duration-200 shrink-0"
                      title="Delete message"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
        </div>

        {/* Ban Overlay for Banned Users */}
        {isBanned && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/80 backdrop-blur-sm">
            <div className="text-center p-6 bg-red-800/90 rounded-lg border border-red-600/50 max-w-sm mx-4">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Ban className="w-8 h-8 text-white" />
              </div>
              <div className="text-white text-xl font-bold mb-2">You Have Been Banned</div>
              <div className="text-red-200 text-lg font-medium mb-4">
                🌱 Go touch some grass 🌱
              </div>
              <div className="text-red-100 text-sm">
                Your access to chat has been restricted. Contact support if you believe this is a mistake.
              </div>
            </div>
          </div>
        )}

        {/* Login Overlay for Non-authenticated Users */}
        {!user && !isBanned && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm">
            <div className="text-center p-6 bg-gray-800/90 rounded-lg border border-gray-700/50 max-w-sm mx-4">
              <div className="text-white text-lg font-semibold mb-2">Login Required</div>
              <div className="text-gray-300 text-sm mb-4">
                Sign in to view and participate in the live chat
              </div>
              <button
                onClick={() => redirectToLogin()}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
              >
                Login with Google
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Emoji Bar */}
      {user && !isBanned && (
        <QuickEmojiBar 
          onEmojiSelect={addEmoji}
          onEmojiSend={async (emoji: string) => {
            // Send emoji directly as a message
            if (!user || isLoading) return;
            
            setIsLoading(true);
            try {
              const messageData: any = { message: emoji };
              
              const response = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(messageData),
              });

              if (response.ok) {
                setIsUserAtBottom(true);
                fetchMessages(true);
              } else {
                const error = await response.json();
                alert(error.error || 'Failed to send message');
              }
            } catch (error) {
              console.error('Failed to send message:', error);
              alert('Failed to send message');
            } finally {
              setIsLoading(false);
            }
          }}
          isSubscriber={!!userSubscription || extendedUser?.localUser?.is_subscriber || extendedUser?.localUser?.is_admin}
        />
      )}

      {/* TTS Controls Panel (for admins/moderators) */}
      {(extendedUser?.localUser?.is_admin || extendedUser?.localUser?.is_moderator) && !isBanned && (
        <div className="border-t border-gray-700 bg-gray-800 p-2">
          <TTSControlsPanel />
        </div>
      )}

      {/* Message Input */}
      {user && !isBanned ? (
        <form onSubmit={sendMessage} className="p-2 sm:p-3 md:p-4 border-t border-gray-700 bg-gray-800">
          {/* Reply indicator */}
          {replyingTo && (
            <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-2 mb-2">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-400">Replying to</span>
                <span className="text-purple-400 font-medium">@{replyingTo.username}</span>
                <span className="text-gray-300 truncate max-w-[200px]">"{replyingTo.message}"</span>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Cancel reply"
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex space-x-1 sm:space-x-2 mb-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={replyingTo ? `Replying to @${replyingTo.username}...` : "Type your message! Use emojis: :smile: :fire: :heart: | Try /commands for chat commands"}
                className="w-full bg-gray-700 text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400 text-sm sm:text-base"
                disabled={isLoading}
                maxLength={500}
              />
              
              {/* Command Suggestions Dropdown */}
              {showCommandSuggestions && filteredCommands.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50">
                  <div className="p-2 border-b border-gray-600">
                    <div className="text-xs text-gray-400 font-medium">Available Commands ({filteredCommands.length})</div>
                    <div className="text-xs text-gray-500">Use ↑↓ to navigate, Enter to select</div>
                  </div>
                  {filteredCommands.map((cmd, index) => (
                    <button
                      key={cmd.command}
                      onClick={() => selectCommand(cmd.command)}
                      className={`w-full text-left px-3 py-2 transition-colors ${
                        index === selectedCommandIndex 
                          ? 'bg-purple-600 text-white' 
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-mono text-sm text-purple-400">{cmd.command}</div>
                          <div className="text-xs text-gray-400 truncate">{cmd.description}</div>
                        </div>
                        {cmd.adminOnly && (
                          <div className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                            Admin
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-2 top-3 text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 z-40">
                  <EmojiPicker 
                onEmojiSelect={addEmoji} 
                onClose={() => setShowEmojiPicker(false)}
                isSubscriber={!!userSubscription || extendedUser?.localUser?.is_subscriber || extendedUser?.localUser?.is_admin}
              />
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!newMessage.trim() || isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowPointsShop(true)}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200"
              title="Points Shop"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowUsernameModal(true)}
              className="bg-gray-600 hover:bg-gray-500 text-white px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200"
              title="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs text-gray-400 space-y-1 sm:space-y-0">
            <span>{newMessage.length}/500 characters</span>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
              {!userSubscription && !extendedUser?.localUser?.is_subscriber && !extendedUser?.localUser?.is_admin && (
                <button
                  type="button"
                  onClick={() => setShowSubscriptionModal(true)}
                  className="text-purple-400 hover:text-purple-300 font-medium text-left sm:text-center"
                >
                  ✨ Get Premium for More Emojis!
                </button>
              )}
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="truncate text-xs">
                  Chatting as: {extendedUser?.localUser?.name || extendedUser?.google_user_data?.name || 'Unknown'}
                </span>
                {(userSubscription || extendedUser?.localUser?.is_subscriber || extendedUser?.localUser?.is_admin) && (
                  <div title="Premium Subscriber" className="flex items-center">
                    <Crown className="w-3 h-3 text-purple-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      ) : !isBanned ? (
        <div className="p-3 sm:p-4 border-t border-gray-700 bg-gray-800 text-center">
          <p className="text-gray-400 mb-3 text-sm">Login to join the chat</p>
          <button
            onClick={() => redirectToLogin()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base"
          >
            Login with Google
          </button>
        </div>
      ) : (
        <div className="p-3 sm:p-4 border-t border-red-700 bg-red-800/30 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Ban className="w-5 h-5 text-red-400" />
            <p className="text-red-200 text-sm font-medium">Chat Access Denied</p>
          </div>
          <p className="text-red-300 text-xs">
            🌱 You have been banned - go touch some grass 🌱
          </p>
        </div>
      )}

      {/* Username Modal */}
      {showUsernameModal && (
        <UsernameModal
          onClose={() => setShowUsernameModal(false)}
          onUpdate={() => {
            fetchMessages();
          }}
        />
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal
          onClose={() => setShowSubscriptionModal(false)}
        />
      )}

      {/* Points Shop Modal */}
      {showPointsShop && (
        <PointsShop
          onClose={() => setShowPointsShop(false)}
        />
      )}

      {/* Gift Subscription Modal */}
      {showGiftModal && (
        <GiftSubscriptionModal
          onClose={() => setShowGiftModal(false)}
          prefilledUsername={contextMenu.username}
        />
      )}

      {/* Username Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 min-w-[150px]"
          style={{
            left: `${Math.min(contextMenu.x, window.innerWidth - 160)}px`,
            top: `${Math.min(contextMenu.y, window.innerHeight - 100)}px`,
            zIndex: 999999999
          }}
        >
          <button
            onClick={handleGiftFromContext}
            className="w-full px-4 py-2 text-left text-white hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Gift className="w-4 h-4" />
            <span>Gift Subscription</span>
          </button>
          
          {/* Pin Message option for admins/mods */}
          {(extendedUser?.localUser?.is_admin || extendedUser?.localUser?.is_moderator) && contextMenu.messageId && (
            <button
              onClick={handlePinMessage}
              className="w-full px-4 py-2 text-left text-white hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span>Pin Message</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
