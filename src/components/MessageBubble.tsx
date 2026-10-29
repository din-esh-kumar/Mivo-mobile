import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';
import { ChatMessageDTO } from '../types';
import { Avatar } from './Avatar';

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
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View
      style={[
        styles.wrapper,
        isCurrentUser ? styles.wrapperMe : styles.wrapperOther,
      ]}
    >
      {!isCurrentUser && (
        <Avatar
          url={message.author.avatarUrl}
          name={message.author.displayName}
          size={32}
        />
      )}

      <View style={[styles.bubbleContainer, isCurrentUser && styles.alignRight]}>
        {!isCurrentUser && (
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>{message.author.displayName}</Text>
            <Text style={styles.timeText}>{formattedTime}</Text>
          </View>
        )}

        {/* Reply Quote Banner */}
        {message.replyTo && (
          <View style={styles.replyQuote}>
            <Text style={styles.replyAuthor}>
              Replying to {message.replyTo.author?.displayName}:
            </Text>
            <Text style={styles.replyContent} numberOfLines={1}>
              {message.replyTo.content}
            </Text>
          </View>
        )}

        {/* Bubble */}
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={() => onReply && onReply(message)}
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

          {isCurrentUser && (
            <Text style={styles.timeMeText}>{formattedTime}</Text>
          )}
        </TouchableOpacity>

        {/* Reactions */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <View style={styles.reactionsRow}>
            {Object.entries(message.reactions).map(([emoji, users]) => (
              <View key={emoji} style={styles.reactionPill}>
                <Text style={styles.reactionEmoji}>{emoji}</Text>
                <Text style={styles.reactionCount}>{users.length}</Text>
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
    gap: 8,
    maxWidth: '88%',
  },
  wrapperMe: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  wrapperOther: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  bubbleContainer: {
    flexShrink: 1,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
    marginLeft: 4,
  },
  authorName: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  timeText: {
    color: THEME.colors.textMuted,
    fontSize: 10,
  },
  replyQuote: {
    borderLeftWidth: 2,
    borderLeftColor: THEME.colors.primary,
    paddingLeft: 6,
    marginBottom: 4,
    opacity: 0.8,
  },
  replyAuthor: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  replyContent: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: THEME.borderRadius.lg,
  },
  bubbleMe: {
    backgroundColor: THEME.colors.bubbleMe,
    borderBottomRightRadius: 2,
  },
  bubbleOther: {
    backgroundColor: THEME.colors.bubbleOther,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  textMe: {
    color: '#FFFFFF',
  },
  textOther: {
    color: THEME.colors.textPrimary,
  },
  timeMeText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 9,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.full,
    gap: 4,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
});

