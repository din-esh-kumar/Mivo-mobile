import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Input } from '../../src/components/Input';
import { Text, TextInput, TouchableOpacity } from 'react-native';

describe('Component: Input', () => {
  it('renders label and placeholder text', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <Input
          label="Email Address"
          placeholder="user@mivo.app"
          value=""
          onChangeText={() => {}}
        />
      );
    });

    const labels = tree!.root.findAllByType(Text);
    expect(labels.some((l) => l.props.children === 'Email Address')).toBe(true);

    const input = tree!.root.findByType(TextInput);
    expect(input.props.placeholder).toBe('user@mivo.app');
  });

  it('renders error message when error prop is provided', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <Input
          placeholder="Password"
          error="Password must be at least 8 characters"
        />
      );
    });

    const texts = tree!.root.findAllByType(Text);
    expect(
      texts.some((t) => t.props.children === 'Password must be at least 8 characters')
    ).toBe(true);
  });

  it('toggles password visibility with eye toggle button', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <Input
          placeholder="Secret Password"
          isPassword={true}
        />
      );
    });

    const input = tree!.root.findByType(TextInput);
    // Initially secure
    expect(input.props.secureTextEntry).toBe(true);

    const eyeBtn = tree!.root.findByType(TouchableOpacity);
    act(() => {
      eyeBtn.props.onPress();
    });

    expect(tree!.root.findByType(TextInput).props.secureTextEntry).toBe(false);
  });
});

