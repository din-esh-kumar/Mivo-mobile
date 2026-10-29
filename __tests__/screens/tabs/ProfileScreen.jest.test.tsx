import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ProfileScreen from '../../../app/(tabs)/profile';
import { useAuthStore } from '../../../src/stores/useAuthStore';
import { Text, Switch } from 'react-native';

const routerMocks = (require('expo-router') as any).__routerMocks;

describe('Screen: ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useAuthStore.setState({
        user: {
          id: 'u-1',
          username: 'alex',
          displayName: 'Alex Chen',
          email: 'alex@mivo.app',
          status: 'ONLINE',
          createdAt: '',
        },
      });
    });
  });

  it('renders user details, status options, and preference switches', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<ProfileScreen />);
    });

    const root = tree!.root;
    const texts = root.findAllByType(Text);
    expect(texts.some((t) => t.props.children === 'Alex Chen')).toBe(true);
    expect(
      texts.some((t) => {
        const textStr = Array.isArray(t.props.children)
          ? t.props.children.join('')
          : String(t.props.children);
        return textStr.includes('alex');
      })
    ).toBe(true);

    expect(root.findByProps({ testID: 'status-ONLINE' })).toBeDefined();
    expect(root.findByProps({ testID: 'status-DND' })).toBeDefined();

    const switches = root.findAllByType(Switch);
    expect(switches.length).toBeGreaterThanOrEqual(2);

    act(() => {
      tree.unmount();
    });
  });

  it('updates status when status pill is selected', async () => {
    const updateStatusMock = jest.fn();
    act(() => {
      useAuthStore.setState({ updateStatus: updateStatusMock });
    });

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<ProfileScreen />);
    });

    const dndPill = tree!.root.findByProps({ testID: 'status-DND' });
    act(() => {
      dndPill.props.onPress();
    });

    expect(updateStatusMock).toHaveBeenCalledWith('DND');

    act(() => {
      tree.unmount();
    });
  });
});
