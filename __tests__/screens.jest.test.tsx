import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import LoginScreen from '../app/(auth)/login';
import RegisterScreen from '../app/(auth)/register';
import ChannelsScreen from '../app/(tabs)/index';
import ConversationsScreen from '../app/(tabs)/conversations';
import ActivitiesScreen from '../app/(tabs)/activities';
import ProfileScreen from '../app/(tabs)/profile';
import ChatScreen from '../app/chat/[id]';
import RoomStageScreen from '../app/room/[id]';
import ServerSettingsScreen from '../app/settings/server';

describe('React Native Full Screen Rendering Regression', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders LoginScreen without errors', () => {
    let tree: any;
    act(() => {
      tree = ReactTestRenderer.create(<LoginScreen />);
    });
    const root = tree.root;
    const textNodes = root.findAllByType('Text');
    const texts = textNodes.map((n: any) =>
      Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)
    );
    expect(texts.some((t: string) => t.includes('Welcome to Mivo'))).toBe(true);
    expect(texts.some((t: string) => t.includes('Sign In'))).toBe(true);
    expect(texts.some((t: string) => t.includes('Explore as Demo User'))).toBe(true);
    act(() => {
      tree.unmount();
    });
  });

  it('renders RegisterScreen with input fields and submit button', () => {
    let tree: any;
    act(() => {
      tree = ReactTestRenderer.create(<RegisterScreen />);
    });
    const root = tree.root;
    const textNodes = root.findAllByType('Text');
    const texts = textNodes.map((n: any) =>
      Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)
    );
    expect(texts.some((t: string) => t.includes('Create Account'))).toBe(true);
    expect(texts.some((t: string) => t.includes('Full / Display Name'))).toBe(true);
    act(() => {
      tree.unmount();
    });
  });

  it('renders ChannelsScreen with community list and channel groups', async () => {
    let tree: any;
    await act(async () => {
      tree = ReactTestRenderer.create(<ChannelsScreen />);
    });
    const root = tree.root;
    const textNodes = root.findAllByType('Text');
    const texts = textNodes.map((n: any) =>
      Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)
    );
    expect(texts.some((t: string) => t.includes('TEXT CHANNELS'))).toBe(true);
    expect(texts.some((t: string) => t.includes('VOICE HUDDLES & STAGES'))).toBe(true);
    act(() => {
      tree.unmount();
    });
  });

  it('renders ConversationsScreen with search bar and direct message threads', async () => {
    let tree: any;
    await act(async () => {
      tree = ReactTestRenderer.create(<ConversationsScreen />);
    });
    const root = tree.root;
    const textNodes = root.findAllByType('Text');
    const texts = textNodes.map((n: any) =>
      Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)
    );
    expect(texts.some((t: string) => t.includes('Direct Messages'))).toBe(true);
    act(() => {
      tree.unmount();
    });
  });

  it('renders ActivitiesScreen with alerts feed', () => {
    let tree: any;
    act(() => {
      tree = ReactTestRenderer.create(<ActivitiesScreen />);
    });
    const root = tree.root;
    const textNodes = root.findAllByType('Text');
    const texts = textNodes.map((n: any) =>
      Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)
    );
    expect(texts.some((t: string) => t.includes('Activity & Alerts'))).toBe(true);
    expect(texts.some((t: string) => t.includes('Live Stage Started'))).toBe(true);
    act(() => {
      tree.unmount();
    });
  });

  it('renders ProfileScreen with user presence status and settings toggles', async () => {
    let tree: any;
    await act(async () => {
      tree = ReactTestRenderer.create(<ProfileScreen />);
    });
    const root = tree.root;
    const textNodes = root.findAllByType('Text');
    const texts = textNodes.map((n: any) =>
      Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)
    );
    expect(texts.some((t: string) => t.includes('SET STATUS'))).toBe(true);
    expect(texts.some((t: string) => t.includes('PREFERENCES'))).toBe(true);
    expect(texts.some((t: string) => t.includes('Sign Out of Mivo'))).toBe(true);
    act(() => {
      tree.unmount();
    });
  });

  it('renders ChatScreen with message list and huddle launch button', async () => {
    let tree: any;
    await act(async () => {
      tree = ReactTestRenderer.create(<ChatScreen />);
    });
    const root = tree.root;
    const textNodes = root.findAllByType('Text');
    const texts = textNodes.map((n: any) =>
      Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)
    );
    expect(texts.some((t: string) => t.includes('Huddle'))).toBe(true);
    act(() => {
      tree.unmount();
    });
  });

  it('renders RoomStageScreen with mode selector and dock media controls', async () => {
    let tree: any;
    await act(async () => {
      tree = ReactTestRenderer.create(<RoomStageScreen />);
    });
    const root = tree.root;
    const textNodes = root.findAllByType('Text');
    const texts = textNodes.map((n: any) =>
      Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)
    );
    expect(texts.some((t: string) => t.includes('LIVE'))).toBe(true);
    act(() => {
      tree.unmount();
    });
  });

  it('renders ServerSettingsScreen with preset options and URL inputs', () => {
    let tree: any;
    act(() => {
      tree = ReactTestRenderer.create(<ServerSettingsScreen />);
    });
    const root = tree.root;
    const textNodes = root.findAllByType('Text');
    const texts = textNodes.map((n: any) =>
      Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)
    );
    expect(texts.some((t: string) => t.includes('Server Endpoints'))).toBe(true);
    expect(texts.some((t: string) => t.includes('QUICK PRESETS'))).toBe(true);
    expect(texts.some((t: string) => t.includes('Save & Reconnect'))).toBe(true);
    act(() => {
      tree.unmount();
    });
  });
});
