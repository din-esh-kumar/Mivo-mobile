import React from 'react';
import renderer, { act } from 'react-test-renderer';
import IndexScreen from '../../app/index';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { Text } from 'react-native';

const routerMocks = (require('expo-router') as any).__routerMocks;

describe('Screen: IndexScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders splash branding and logo', () => {
    act(() => {
      useAuthStore.setState({ isInitialized: false, user: null });
    });

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<IndexScreen />);
    });

    const root = tree!.root;
    const texts = root.findAllByType(Text);
    expect(texts.some((t) => t.props.children === 'MIVO')).toBe(true);
    expect(texts.some((t) => t.props.children === 'Unified Real-Time Communication')).toBe(true);

    act(() => {
      tree.unmount();
    });
  });

  it('redirects to login if initialized and no user is logged in', () => {
    act(() => {
      useAuthStore.setState({ isInitialized: true, user: null });
    });

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<IndexScreen />);
    });

    expect(routerMocks.replaceMock).toHaveBeenCalledWith('/(auth)/login');

    act(() => {
      tree.unmount();
    });
  });

  it('redirects to tabs if initialized and authenticated user exists', () => {
    act(() => {
      useAuthStore.setState({
        isInitialized: true,
        user: {
          id: 'user-1',
          username: 'alex',
          displayName: 'Alex Chen',
          email: 'alex@mivo.app',
          status: 'ONLINE',
          createdAt: '',
        },
      });
    });

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<IndexScreen />);
    });

    expect(routerMocks.replaceMock).toHaveBeenCalledWith('/(tabs)');

    act(() => {
      tree.unmount();
    });
  });
});

