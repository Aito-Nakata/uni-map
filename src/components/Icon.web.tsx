import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#000', style }) => {
  // Material Design アイコン名のマッピング
  const iconMap: { [key: string]: string } = {
    'map': '🗺️',
    'list': '📋',
    'favorite': '❤️',
    'settings': '⚙️',
    'search': '🔍',
    'filter-list': '🔽',
    'location-on': '📍',
    'directions': '🧭',
    'star': '⭐',
    'star-border': '☆',
    'close': '✕',
    'check': '✓',
    'info': 'ℹ️',
    'error': '⚠️',
    'warning': '⚠️',
    'schedule': '🕐',
    'phone': '📞',
    'email': '✉️',
    'web': '🌐',
    'share': '📤',
    'wifi': '📶',
    'wifi-off': '📵',
    'sync': '🔄',
    'check-circle': '✅',
    'cancel': '❌',
    'directions-walk': '🚶',
    'directions-car': '🚗',
    'directions-transit': '🚌',
    'train': '🚊',
    'videogame-asset': '🎮',
    'palette': '🎨',
    'notifications': '🔔',
    'data-usage': '📊',
    'cleaning-services': '🧹',
    'privacy-tip': '🔒',
    'help': '❓',
    'feedback': '💬',
    'photo-camera': '📷',
    'chevron-left': '←',
    'chevron-right': '→',
    'delete': '🗑️',
    'edit': '✏️',
    'add': '➕',
    'remove': '➖',
    'expand-more': '▼',
    'expand-less': '▲',
    'menu': '☰',
    'more-vert': '⋮',
    'arrow-back': '←',
    'arrow-forward': '→',
    'home': '🏠',
    'store': '🏪',
    'circle': '●',
    'emoji-events': '🏆',
    'access-time': '🕐',
    'error-outline': '⚠️',
    'fullscreen': '⛶',
  };

  const iconCharacter = iconMap[name] || '●';

  return (
    <span
      style={{
        fontSize: size,
        color: color,
        fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif',
        display: 'inline-block',
        textAlign: 'center',
        lineHeight: 1,
        ...style,
      }}
    >
      {iconCharacter}
    </span>
  );
};

export default Icon;