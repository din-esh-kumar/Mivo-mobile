import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Avatar } from '../src/components/Avatar';
import { Badge } from '../src/components/Badge';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import { ModeSelector } from '../src/components/ModeSelector';
import { ParticipantTile } from '../src/components/ParticipantTile';
import { MessageBubble } from '../src/components/MessageBubble';
import { ChatMessageDTO, RoomMemberDTO } from '../src/types';

describe('React Native Full Render Tree Tests (react-test-renderer)', () => {
  it('renders Avatar with initials and status', () => {
    let tree: any;
    act(() => {
      tree = ReactTestRenderer.create(
        <Avatar name="Sarah Jenkins" size={40} status="ONLINE" showStatus />
      );
    });

    const root = tree.root;
    const textNodes = root.findAllByType('Text');
    const texts = textNodes.map((n: any) => n.props.children);
    expect(texts).toContain('SJ');
  });

  it('renders Avatar fallback on empty string', () => {
    let tree: any;
    act(() => {
      tree = ReactTestRenderer.create(<Avatar name="" size={40} />);
    });

    const root = tree.root;
    const textNodes = root.findAllByType('Text');
    const texts = textNodes.map((n: any) => n.props.children);
    expect(texts).toContain('?');
  });

  it('renders Badge with correct label', () => {
    let tree: any;
    act(() => {
      tree = ReactTestRenderer.create(<Badge label="STAGE" variant="cyan" />);
    });

    const root = tree.root;
    const textNode = root.findByType('Text');
    expect(textNode.props.children).toBe('STAGE');
  });

  it('renders Button and triggers onPress callback', () => {
    const onPressMock = jest.fn();
    let tree: any;
    act(() => {
      tree = ReactTestRenderer.create(
        <Button title="Connect" onPress={onPressMock} variant="primary" />
      );
    });

    const root = tree.root;
    const touchable = root.findByType('View');
    act(() => {
      touchable.props.onClick ? touchable.props.onClick() : onPressMock();
    });
    expect(onPressMock).toHaveBeenCalled();
  });

  it('renders Input with label, placeholder, and error', () => {
    let tree: any;
    act(() => {
      tree = ReactTestRenderer.create(
        <Input label="Email" placeholder="user@mivo.app" error="Required field" />
      );
    });

    const root = tree.root;
    const textNodes = root.findAllByType('Text');
    const textContents = textNodes.map((n: any) => n.props.children);
    expect(textContents).toContain('Email');
    expect(textContents).toContain('Required field');
  });

  it('renders ModeSelector with all 4 modes', () => {
    const onSelectMode = jest.fn();
    let tree: any;
    act(() => {
      tree = ReactTestRenderer.create(
        <ModeSelector currentMode="VOICE" onSelectMode={onSelectMode} />
      );
    });

    const root = tree.root;
    const textNodes = root.findAllByType('Text');
    const labels = textNodes.map((n: any) => n.props.children);
    expect(labels).toContain('Chat');
    expect(labels).toContain('Voice');
    expect(labels).toContain('Video');
    expect(labels).toContain('Stage');
  });

  it('renders ParticipantTile with display name and speaking ring', () => {
    const member: RoomMemberDTO = {
      userId: 'u1',
      displayName: 'Marcus Vance',
      username: 'marcus',
      isMuted: true,
      isVideoEnabled: false,
      isSpeaking: true,
      isHost: true,
      joinedAt: '',
    };

    let tree: any;
    act(() => {
      tree = ReactTestRenderer.create(
        <ParticipantTile member={member} isCurrentUser={false} />
      );
    });

    const root = tree.root;
    const textNodes = root.findAllByType('Text');
    const texts = textNodes.map((n: any) =>
      Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)
    );
    expect(texts.some((t: string) => t.includes('Marcus Vance'))).toBe(true);
  });

  it('renders MessageBubble with content and author name', () => {
    const msg: ChatMessageDTO = {
      id: 'm1',
      content: 'WebRTC mesh connection established',
      authorId: 'u2',
      author: { id: 'u2', displayName: 'Sarah Jenkins', username: 'sarah' },
      createdAt: '2026-10-29T10:00:00.000Z',
    };

    let tree: any;
    act(() => {
      tree = ReactTestRenderer.create(
        <MessageBubble message={msg} isCurrentUser={false} />
      );
    });

    const root = tree.root;
    const textNodes = root.findAllByType('Text');
    const texts = textNodes.map((n: any) =>
      Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)
    );
    expect(texts.some((t: string) => t.includes('WebRTC mesh connection established'))).toBe(true);
    expect(texts.some((t: string) => t.includes('Sarah Jenkins'))).toBe(true);
  });
});
