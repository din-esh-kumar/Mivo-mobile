import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { MessageBubble } from '../../src/components/MessageBubble';
import { ChatMessageDTO } from '../../src/types';
import { Text } from 'react-native';

describe('Component: MessageBubble', () => {
  const sampleMessage: ChatMessageDTO = {
    id: 'msg-test-1',
    authorId: 'u-other',
    author: {
      id: 'u-other',
      username: 'sarah_pm',
      displayName: 'Sarah Jenkins',
      avatarUrl: null,
      status: 'ONLINE',
    },
    content: 'Testing message delivery on Expo',
    createdAt: new Date().toISOString(),
  };

  it('renders author name and message text for peer messages', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <MessageBubble
          message={sampleMessage}
          isCurrentUser={false}
        />
      );
    });

    const texts = tree!.root.findAllByType(Text);
    expect(texts.some((t) => t.props.children === 'Sarah Jenkins')).toBe(true);
    expect(texts.some((t) => t.props.children === 'Testing message delivery on Expo')).toBe(true);
  });

  it('renders current user bubble aligned without duplicating sender header', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <MessageBubble
          message={sampleMessage}
          isCurrentUser={true}
        />
      );
    });

    const texts = tree!.root.findAllByType(Text);
    expect(texts.some((t) => t.props.children === 'Testing message delivery on Expo')).toBe(true);
    // When isCurrentUser is true, author header row is omitted
    expect(texts.some((t) => t.props.children === 'Sarah Jenkins')).toBe(false);
  });

  it('renders reply quote banner when message replies to another message', () => {
    const replyMessage: ChatMessageDTO = {
      ...sampleMessage,
      id: 'msg-reply-1',
      replyToMessageId: 'msg-parent',
      replyTo: {
        id: 'msg-parent',
        content: 'Original question from teammate',
        author: {
          id: 'u-1',
          username: 'teammate',
          displayName: 'Teammate',
        },
      },
    };

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <MessageBubble
          message={replyMessage}
          isCurrentUser={false}
        />
      );
    });

    const texts = tree!.root.findAllByType(Text);
    expect(texts.some((t) => t.props.children === 'Original question from teammate')).toBe(true);
  });

  it('renders reaction pills when message has reactions', () => {
    const reactedMessage: ChatMessageDTO = {
      ...sampleMessage,
      reactions: {
        '🔥': ['u-1', 'u-2', 'u-3'],
        '🚀': ['u-4'],
      },
    };

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <MessageBubble
          message={reactedMessage}
          isCurrentUser={false}
        />
      );
    });

    const texts = tree!.root.findAllByType(Text);
    expect(texts.some((t) => t.props.children === '🔥')).toBe(true);
    expect(texts.some((t) => t.props.children === 3)).toBe(true);
    expect(texts.some((t) => t.props.children === '🚀')).toBe(true);
    expect(texts.some((t) => t.props.children === 1)).toBe(true);
  });
});

