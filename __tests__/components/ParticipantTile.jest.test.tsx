import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ParticipantTile } from '../../src/components/ParticipantTile';
import { RoomMemberDTO } from '../../src/types';
import { Text } from 'react-native';

describe('Component: ParticipantTile', () => {
  const memberVoice: RoomMemberDTO = {
    userId: 'u-peer',
    displayName: 'Elena Rostova',
    username: 'elena',
    avatarUrl: null,
    isMuted: true,
    isVideoEnabled: false,
    isSpeaking: false,
    isHost: false,
    joinedAt: '',
  };

  it('renders participant name and mute indicator', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<ParticipantTile member={memberVoice} isCurrentUser={false} />);
    });

    const texts = tree!.root.findAllByType(Text);
    expect(texts.some((t) => String(t.props.children).includes('Elena Rostova'))).toBe(true);
  });

  it('indicates current user with (You) suffix', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<ParticipantTile member={memberVoice} isCurrentUser={true} />);
    });

    const texts = tree!.root.findAllByType(Text);
    expect(texts.some((t) => String(t.props.children).includes('(You)'))).toBe(true);
  });

  it('renders simulated video preview when video is enabled', () => {
    const memberVideo: RoomMemberDTO = {
      ...memberVoice,
      isVideoEnabled: true,
    };

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<ParticipantTile member={memberVideo} />);
    });

    const texts = tree!.root.findAllByType(Text);
    expect(texts.some((t) => t.props.children === '[HD Video Stream]')).toBe(true);
  });
});

