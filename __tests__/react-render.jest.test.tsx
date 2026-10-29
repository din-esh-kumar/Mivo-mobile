import React from 'react';
import { View, Text } from 'react-native';
import { Avatar } from '../src/components/Avatar';
import { Badge } from '../src/components/Badge';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import { ModeSelector } from '../src/components/ModeSelector';
import { ParticipantTile } from '../src/components/ParticipantTile';
import { MessageBubble } from '../src/components/MessageBubble';
import { ChatMessageDTO, RoomMemberDTO } from '../src/types';

describe('React Native Component Tree & Element Tests', () => {
  it('instantiates Avatar element with initials', () => {
    const element = <Avatar name="Sarah Jenkins" size={40} />;
    expect(element.props.name).toBe('Sarah Jenkins');
    expect(element.props.size).toBe(40);
  });

  it('instantiates Badge with variant', () => {
    const element = <Badge label="Stage" variant="cyan" />;
    expect(element.props.label).toBe('Stage');
    expect(element.props.variant).toBe('cyan');
  });

  it('instantiates Button with callbacks', () => {
    const onPress = jest.fn();
    const element = <Button title="Join Stage" onPress={onPress} variant="primary" />;
    expect(element.props.title).toBe('Join Stage');
    expect(element.props.variant).toBe('primary');
  });

  it('instantiates Input with label and error', () => {
    const element = <Input label="Email" placeholder="test@mivo.app" error="Invalid email" />;
    expect(element.props.label).toBe('Email');
    expect(element.props.error).toBe('Invalid email');
  });

  it('instantiates ModeSelector with mode', () => {
    const onSelect = jest.fn();
    const element = <ModeSelector currentMode="VOICE" onSelectMode={onSelect} />;
    expect(element.props.currentMode).toBe('VOICE');
  });

  it('instantiates ParticipantTile for host member', () => {
    const member: RoomMemberDTO = {
      userId: 'u1',
      displayName: 'Marcus Vance',
      username: 'marcus',
      isMuted: true,
      isVideoEnabled: false,
      isHost: true,
      joinedAt: '',
    };
    const element = <ParticipantTile member={member} isCurrentUser={false} />;
    expect(element.props.member.displayName).toBe('Marcus Vance');
    expect(element.props.member.isHost).toBe(true);
  });

  it('instantiates MessageBubble with message payload', () => {
    const msg: ChatMessageDTO = {
      id: 'm1',
      content: 'Live mesh connection active',
      authorId: 'u1',
      author: { id: 'u1', username: 'alex', displayName: 'Alex Mercer' },
      createdAt: new Date().toISOString(),
    };
    const element = <MessageBubble message={msg} isCurrentUser={true} />;
    expect(element.props.message.content).toBe('Live mesh connection active');
    expect(element.props.isCurrentUser).toBe(true);
  });
});

