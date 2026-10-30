import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Button } from '../../src/components/Button';
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';

describe('Component: Button', () => {
  it('renders title and responds to press events', () => {
    let pressed = false;
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <Button
          testID="action-btn"
          title="Connect Room"
          onPress={() => {
            pressed = true;
          }}
        />
      );
    });

    const btn = tree!.root.findByProps({ testID: 'action-btn' });
    expect(tree!.root.findByType(Text).props.children).toBe('Connect Room');

    act(() => {
      btn.props.onPress();
    });
    expect(pressed).toBe(true);
  });

  it('shows ActivityIndicator and hides text when isLoading is true', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <Button
          title="Submitting"
          isLoading={true}
          onPress={() => {}}
        />
      );
    });

    expect(tree!.root.findAllByType(ActivityIndicator).length).toBe(1);
    expect(tree!.root.findAllByType(Text).length).toBe(0);
    expect(tree!.root.findByType(TouchableOpacity).props.disabled).toBe(true);
  });

  it('disables touchable when disabled is true', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <Button
          title="Disabled State"
          disabled={true}
          onPress={() => {}}
        />
      );
    });

    expect(tree!.root.findByType(TouchableOpacity).props.disabled).toBe(true);
  });

  it('renders custom icon alongside title', () => {
    const dummyIcon = <Text testID="dummy-icon">Icon</Text>;
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <Button
          title="With Icon"
          icon={dummyIcon}
          onPress={() => {}}
        />
      );
    });

    expect(tree!.root.findByProps({ testID: 'dummy-icon' })).toBeDefined();
  });
});

