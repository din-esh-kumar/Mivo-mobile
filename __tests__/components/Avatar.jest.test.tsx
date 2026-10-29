import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Avatar } from '../../src/components/Avatar';
import { Text, Image, View } from 'react-native';

describe('Component: Avatar', () => {
  it('renders initials when no URL is provided', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<Avatar name="Alex Chen" size={48} />);
    });

    const root = tree!.root;
    const textNode = root.findByType(Text);
    expect(textNode.props.children).toBe('AC');
    expect(root.findAllByType(Image).length).toBe(0);
  });

  it('renders single initial for single name or fallback ? for empty name', () => {
    let tree1: renderer.ReactTestRenderer;
    act(() => {
      tree1 = renderer.create(<Avatar name="Solo" />);
    });
    expect(tree1!.root.findByType(Text).props.children).toBe('S');

    let tree2: renderer.ReactTestRenderer;
    act(() => {
      tree2 = renderer.create(<Avatar name="" />);
    });
    expect(tree2!.root.findByType(Text).props.children).toBe('?');
  });

  it('renders Image when url is provided', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<Avatar url="https://mivo.app/avatar.png" name="Alex" size={50} />);
    });

    const images = tree!.root.findAllByType(Image);
    expect(images.length).toBe(1);
    expect(images[0].props.source).toEqual({ uri: 'https://mivo.app/avatar.png' });
  });

  it('renders status badge when showStatus is true and status is given', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<Avatar name="Alex" status="ONLINE" showStatus={true} />);
    });

    const views = tree!.root.findAllByType(View);
    // Container, Fallback, and Status Badge
    expect(views.length).toBeGreaterThanOrEqual(3);
  });
});

