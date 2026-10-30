import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { THEME } from '../constants/theme';
import { ChatMessageDTO } from '../types';
import { Avatar } from './Avatar';
import { CheckCheck } from 'lucide-react-native';
import { triggerHaptic } from '../utils/haptics';

interface MessageBubbleProps {
  message: ChatMessageDTO;
  isCurrentUser: boolean;
  onReply?: (message: ChatMessageDTO) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  onReply,
}) => {
  const [isClient, setIsClient] = useState(Platform.OS !== 'web');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatTime = (iso?: string) => {
    if (!iso || !isClient) return '';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      const h = d.getHours().toString().padStart(2, '0');
      const m = d.getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    } catch {
      return '';
    }
  };

  const handleLongPress = () => {
    if (onReply) {
      triggerHaptic();
      onReply(message);
    }
  };

  const formattedTime = formatTime(message.createdAt);
  const authorName = message.author?.displayName || 'User';
  const avatarUrl = message.author?.avatarUrl;

  return (
    <View
      style={[
        styles.wrapper,
        isCurrentUser ? styles.wrapperMe : styles.wrapperOther,
      ]}
    >
      {!isCurrentUser && (
        <Avatar
          url={avatarUrl}
          name={authorName}
          size={32}
        />
      )}

      <View style={[styles.bubbleContainer, isCurrentUser && styles.alignRight]}>
        {!isCurrentUser && (
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>{authorName}</Text>
            {formattedTime ? <Text style={styles.timeText}>{formattedTime}</Text> : null}
          </View>
        )}

        {/* Reply Quote Banner */}
        {message.replyTo && (
          <View style={styles.replyQuote}>
            <View style={styles.replyBar} />
            <View style={styles.replyBody}>
              <Text style={styles.replyAuthor}>
                Replying to {message.replyTo.author?.displayName || 'User'}:
              </Text>
              <Text style={styles.replyContent} numberOfLines={1}>
                {message.replyTo.content}
              </Text>
            </View>
          </View>
        )}

        {/* Bubble */}
        <TouchableOpacity
          activeOpacity={0.88}
          onLongPress={handleLongPress}
          style={[
            styles.bubble,
            isCurrentUser ? styles.bubbleMe : styles.bubbleOther,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isCurrentUser ? styles.textMe : styles.textOther,
            ]}
          >
            {message.content}
          </Text>

          {isCurrentUser && formattedTime ? (
            <View style={styles.meStatusRow}>
              <Text style={styles.timeMeText}>{formattedTime}</Text>
              <CheckCheck size={12} color="rgba(255, 255, 255, 0.7)" style={styles.checkIcon} />
            </View>
          ) : null}
        </TouchableOpacity>

        {/* Reactions */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <View style={[styles.reactionsRow, isCurrentUser && styles.reactionsRowMe]}>
            {Object.entries(message.reactions).map(([emoji, userIds]) => (
              <View key={emoji} style={styles.reactionPill}>
                <Text style={styles.reactionEmoji}>{emoji}</Text>
                <Text style={styles.reactionCount}>{userIds.length}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
    gap: 8,
  },
  wrapperMe: {
    justifyContent: 'flex-end',
  },
  wrapperOther: {
    justifyContent: 'flex-start',
  },
  bubbleContainer: {
    maxWidth: '78%',
    alignItems: 'flex-start',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    marginLeft: 4,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    letterSpacing: -0.2,
  },
  timeText: {
    fontSize: 10.5,
    color: THEME.colors.textMuted,
  },
  replyQuote: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  replyBar: {
    width: 3,
    backgroundColor: THEME.colors.primary,
    borderRadius: 2,
    marginRight: 6,
  },
  replyBody: {
    flex: 1,
  },
  replyAuthor: {
    fontSize: 10.5,
    fontWeight: '700',
    color: THEME.colors.primaryLight,
  },
  replyContent: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  bubbleMe: {
    backgroundColor: THEME.colors.bubbleMe,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  bubbleOther: {
    backgroundColor: '#151D2E',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  messageText: {
    fontSize: 14.5,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  textMe: {
    color: '#FFFFFF',
  },
  textOther: {
    color: '#F1F5F9',
  },
  meStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 3,
    gap: 3,
  },
  timeMeText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 2,
  },
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  reactionsRowMe: {
    justifyContent: 'flex-end',
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 3,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#CBD5E1',
  },
});
