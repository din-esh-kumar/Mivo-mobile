import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ConversationsScreen from '../../../app/(tabs)/conversations';
import { useConversationStore } from '../../../src/stores/useConversationStore';
import { Text } from 'react-native';

const routerMocks = (require('expo-router') as any).__routerMocks;

describe('Screen: ConversationsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search bar, header, and conversation items', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<ConversationsScreen />);
    });

    const root = tree!.root;
    expect(root.findByProps({ testID: 'search-conversations-input' })).toBeDefined();
    expect(root.findByProps({ testID: 'new-chat-btn' })).toBeDefined();

    const texts = root.findAllByType(Text);
    expect(texts.some((t) => t.props.children === 'Direct Messages')).toBe(true);
    expect(texts.some((t) => t.props.children === 'Sarah Jenkins')).toBe(true);

    act(() => {
      tree.unmount();
    });
  });

  it('filters conversation list when typing into search input', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<ConversationsScreen />);
    });

    const searchInput = tree!.root.findByProps({ testID: 'search-conversations-input' });
    act(() => {
      searchInput.props.onChangeText('Marcus');
    });

    const texts = tree!.root.findAllByType(Text);
    expect(texts.some((t) => t.props.children === 'Marcus Vance')).toBe(true);
    expect(texts.some((t) => t.props.children === 'Sarah Jenkins')).toBe(false);

    act(() => {
      tree.unmount();
    });
  });
});
