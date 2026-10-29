import React from 'react';
import renderer, { act } from 'react-test-renderer';
import RoomStageScreen from '../../../app/room/[id]';
import { useRoomStore } from '../../../src/stores/useRoomStore';
import { useAuthStore } from '../../../src/stores/useAuthStore';
import { Text } from 'react-native';

const routerMocks = (require('expo-router') as any).__routerMocks;

describe('Screen: RoomStageScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 'me',
        username: 'self',
        displayName: 'Myself',
        email: 'me@mivo.app',
        status: 'ONLINE',
        createdAt: '',
      },
    });
    useRoomStore.setState({
      currentRoom: null,
      activeMode: 'VOICE',
      participants: [
        {
          userId: 'peer-sarah',
          displayName: 'Sarah Jenkins',
          username: 'sarah_pm',
          avatarUrl: null,
          isMuted: false,
          isVideoEnabled: false,
          isSpeaking: true,
          isHost: false,
          joinedAt: '',
        },
      ],
      isMuted: true,
      isVideoEnabled: false,
      isJoined: false,
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders room header, mode selector, participants grid, and media controls dock', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<RoomStageScreen />);
    });

    const root = tree!.root;
    expect(root.findByProps({ testID: 'toggle-mic-btn' })).toBeDefined();
    expect(root.findByProps({ testID: 'toggle-video-btn' })).toBeDefined();
    expect(root.findByProps({ testID: 'in-call-chat-btn' })).toBeDefined();
    expect(root.findByProps({ testID: 'leave-room-btn' })).toBeDefined();

    const texts = root.findAllByType(Text);
    expect(texts.some((t) => t.props.children === 'LIVE')).toBe(true);

    act(() => {
      tree.unmount();
    });
  });

  it('toggles microphone when pressing toggle mic button', async () => {
    const toggleMuteMock = jest.fn();
    useRoomStore.setState({ toggleMute: toggleMuteMock });

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<RoomStageScreen />);
    });

    const micBtn = tree!.root.findByProps({ testID: 'toggle-mic-btn' });
    act(() => {
      micBtn.props.onPress();
    });

    expect(toggleMuteMock).toHaveBeenCalled();

    act(() => {
      tree.unmount();
    });
  });

  it('toggles video when pressing toggle video button', async () => {
    const toggleVideoMock = jest.fn();
    useRoomStore.setState({ toggleVideo: toggleVideoMock });

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<RoomStageScreen />);
    });

    const videoBtn = tree!.root.findByProps({ testID: 'toggle-video-btn' });
    act(() => {
      videoBtn.props.onPress();
    });

    expect(toggleVideoMock).toHaveBeenCalled();

    act(() => {
      tree.unmount();
    });
  });

  it('navigates back and leaves room when pressing leave button', async () => {
    const leaveRoomMock = jest.fn();
    useRoomStore.setState({ leaveRoom: leaveRoomMock });

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<RoomStageScreen />);
    });

    const leaveBtn = tree!.root.findByProps({ testID: 'leave-room-btn' });
    act(() => {
      leaveBtn.props.onPress();
    });

    expect(leaveRoomMock).toHaveBeenCalled();
    expect(routerMocks.backMock).toHaveBeenCalled();

    act(() => {
      tree.unmount();
    });
  });
});

