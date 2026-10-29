import React from 'react';
import renderer, { act } from 'react-test-renderer';
import LoginScreen from '../../../app/(auth)/login';
import { useAuthStore } from '../../../src/stores/useAuthStore';
import { Text } from 'react-native';

const routerMocks = (require('expo-router') as any).__routerMocks;

describe('Screen: LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
    });
  });

  it('renders branding, email/password inputs, and action buttons', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<LoginScreen />);
    });

    const root = tree!.root;
    expect(root.findByProps({ testID: 'login-email-input' })).toBeDefined();
    expect(root.findByProps({ testID: 'login-password-input' })).toBeDefined();
    expect(root.findByProps({ testID: 'sign-in-btn' })).toBeDefined();
    expect(root.findByProps({ testID: 'demo-user-btn' })).toBeDefined();
    expect(root.findByProps({ testID: 'server-endpoint-btn' })).toBeDefined();

    const texts = root.findAllByType(Text);
    expect(texts.some((t) => t.props.children === 'Welcome to Mivo')).toBe(true);
  });

  it('shows error banner when trying to submit empty fields', async () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<LoginScreen />);
    });

    const signInBtn = tree!.root.findByProps({ testID: 'sign-in-btn' });
    await act(async () => {
      signInBtn.props.onPress();
    });

    const texts = tree!.root.findAllByType(Text);
    expect(
      texts.some((t) => t.props.children === 'Please enter both email and password')
    ).toBe(true);
  });

  it('navigates to server endpoint settings on server button click', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<LoginScreen />);
    });

    const serverBtn = tree!.root.findByProps({ testID: 'server-endpoint-btn' });
    act(() => {
      serverBtn.props.onPress();
    });

    expect(routerMocks.pushMock).toHaveBeenCalledWith('/settings/server');
  });

  it('navigates to tabs on successful guest login', async () => {
    useAuthStore.setState({
      loginAsGuest: jest.fn().mockResolvedValue({ success: true }),
    });

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<LoginScreen />);
    });

    const demoBtn = tree!.root.findByProps({ testID: 'demo-user-btn' });
    await act(async () => {
      demoBtn.props.onPress();
    });

    expect(routerMocks.replaceMock).toHaveBeenCalledWith('/(tabs)');
  });
});

