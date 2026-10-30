import React from 'react';
import renderer, { act } from 'react-test-renderer';
import RegisterScreen from '../../../app/(auth)/register';
import { useAuthStore } from '../../../src/stores/useAuthStore';
import { Text } from 'react-native';

const routerMocks = (require('expo-router') as any).__routerMocks;

describe('Screen: RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
    });
  });

  it('renders registration form inputs and back button', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<RegisterScreen />);
    });

    const root = tree!.root;
    expect(root.findByProps({ testID: 'register-name-input' })).toBeDefined();
    expect(root.findByProps({ testID: 'register-username-input' })).toBeDefined();
    expect(root.findByProps({ testID: 'register-email-input' })).toBeDefined();
    expect(root.findByProps({ testID: 'register-password-input' })).toBeDefined();
    expect(root.findByProps({ testID: 'register-submit-btn' })).toBeDefined();
    expect(root.findByProps({ testID: 'back-to-login-btn' })).toBeDefined();
  });

  it('shows error banner when fields are empty', async () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<RegisterScreen />);
    });

    const submitBtn = tree!.root.findByProps({ testID: 'register-submit-btn' });
    await act(async () => {
      submitBtn.props.onPress();
    });

    const texts = tree!.root.findAllByType(Text);
    expect(texts.some((t) => t.props.children === 'Please fill in all fields')).toBe(true);
  });

  it('navigates back to login when clicking back or sign in link', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<RegisterScreen />);
    });

    const backBtn = tree!.root.findByProps({ testID: 'back-to-login-btn' });
    act(() => {
      backBtn.props.onPress();
    });

    expect(routerMocks.backMock).toHaveBeenCalled();
  });
});

