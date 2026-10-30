import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Badge } from '../../src/components/Badge';
import { Text } from 'react-native';

describe('Component: Badge', () => {
  it('renders string and numeric labels correctly', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<Badge label="Online" />);
    });
    expect(tree!.root.findByType(Text).props.children).toBe('Online');

    let treeNum: renderer.ReactTestRenderer;
    act(() => {
      treeNum = renderer.create(<Badge label={5} />);
    });
    expect(treeNum!.root.findByType(Text).props.children).toBe(5);
  });

  it('renders different variants (success, danger, cyan, neutral, warning)', () => {
    const variants: Array<'primary' | 'success' | 'danger' | 'warning' | 'neutral' | 'cyan'> = [
      'primary',
      'success',
      'danger',
      'warning',
      'neutral',
      'cyan',
    ];

    variants.forEach((v) => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<Badge label={v} variant={v} />);
      });
      expect(tree!.root.findByType(Text).props.children).toBe(v);
    });
  });

  it('supports small and medium sizing', () => {
    let treeSm: renderer.ReactTestRenderer;
    act(() => {
      treeSm = renderer.create(<Badge label="Small" size="sm" />);
    });
    expect(treeSm!.root.findByType(Text).props.style).toContainEqual(
      expect.objectContaining({ fontSize: 10 })
    );

    let treeMd: renderer.ReactTestRenderer;
    act(() => {
      treeMd = renderer.create(<Badge label="Medium" size="md" />);
    });
    expect(treeMd!.root.findByType(Text).props.style).toContainEqual(
      expect.objectContaining({ fontSize: 12 })
    );
  });
});

