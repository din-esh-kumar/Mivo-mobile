import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ChatScreen from '../../../app/chat/[id]';
import { useConversationStore } from '../../../src/stores/useConversationStore';
import { Text } from 'react-native';

const routerMocks = (require('expo-router') as any).__routerMocks;

describe('Screen: ChatScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    act(() => {
      useConversationStore.setState({
        messages: {
          'chan-gen': [
            {
              id: 'm-init',
              channelId: 'chan-gen',
              authorId: 'u-peer',
              author: { id: 'u-peer', username: 'carol', displayName: 'Carol Danvers' },
              content: 'Hello channel team!',
              createdAt: new Date().toISOString(),
            },
          ],
        },
        typingUsers: {},
      });
    });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders chat header, existing messages, and input box', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<ChatScreen />);
    });

    const root = tree!.root;
    expect(root.findByProps({ testID: 'chat-back-btn' })).toBeDefined();
    expect(root.findByProps({ testID: 'chat-huddle-btn' })).toBeDefined();
    expect(root.findByProps({ testID: 'chat-text-input' })).toBeDefined();
    expect(root.findByProps({ testID: 'chat-send-btn' })).toBeDefined();

    const texts = root.findAllByType(Text);
    expect(texts.some((t) => t.props.children === 'Hello channel team!')).toBe(true);

    act(() => {
      tree.unmount();
    });
  });

  it('sends message when typing text and pressing send button', async () => {
    const sendMessageMock = jest.fn();
    act(() => {
      useConversationStore.setState({ sendMessage: sendMessageMock });
    });

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<ChatScreen />);
    });

    const input = tree!.root.findByProps({ testID: 'chat-text-input' });
    const sendBtn = tree!.root.findByProps({ testID: 'chat-send-btn' });

    act(() => {
      input.props.onChangeText('Releasing version 1.0.0 now');
    });

    act(() => {
      sendBtn.props.onPress();
    });

    expect(sendMessageMock).toHaveBeenCalledWith(
      'chan-gen',
      'Releasing version 1.0.0 now',
      false,
      undefined
    );

    act(() => {
      jest.advanceTimersByTime(200);
      tree.unmount();
    });
  });

  it('launches room huddle when clicking huddle button in header', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<ChatScreen />);
    });

    const huddleBtn = tree!.root.findByProps({ testID: 'chat-huddle-btn' });
    act(() => {
      huddleBtn.props.onPress();
    });

    expect(routerMocks.pushMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/room/[id]',
      })
    );

    act(() => {
      tree.unmount();
    });
  });
});
