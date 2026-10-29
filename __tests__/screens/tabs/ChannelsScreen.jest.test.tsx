import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ChannelsScreen from '../../../app/(tabs)/index';
import { useCommunityStore } from '../../../src/stores/useCommunityStore';
import { Text } from 'react-native';

const routerMocks = (require('expo-router') as any).__routerMocks;

describe('Screen: ChannelsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders community name, carousel pills, and channel sections', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<ChannelsScreen />);
    });

    const root = tree!.root;
    const texts = root.findAllByType(Text);
    expect(texts.some((t) => t.props.children === 'TEXT CHANNELS')).toBe(true);
    expect(texts.some((t) => t.props.children === 'VOICE HUDDLES & STAGES')).toBe(true);
    expect(texts.some((t) => t.props.children === 'INTERACTIVE LIVE STAGES')).toBe(true);

    // Should find community pill
    expect(root.findByProps({ testID: 'community-pill-comm-1' })).toBeDefined();

    act(() => {
      tree.unmount();
    });
  });

  it('navigates to chat screen when clicking text channel row', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<ChannelsScreen />);
    });

    const channelRow = tree!.root.findByProps({ testID: 'channel-row-chan-gen' });
    act(() => {
      channelRow.props.onPress();
    });

    expect(routerMocks.pushMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/chat/[id]',
        params: expect.objectContaining({ id: 'chan-gen', name: 'general', type: 'channel' }),
      })
    );

    act(() => {
      tree.unmount();
    });
  });

  it('navigates to room stage screen when clicking voice channel row', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<ChannelsScreen />);
    });

    const voiceRow = tree!.root.findByProps({ testID: 'channel-row-chan-voice-1' });
    act(() => {
      voiceRow.props.onPress();
    });

    expect(routerMocks.pushMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/room/[id]',
        params: expect.objectContaining({ id: 'chan-voice-1', mode: 'VOICE' }),
      })
    );

    act(() => {
      tree.unmount();
    });
  });
});
