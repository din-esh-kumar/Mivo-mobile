import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ActivitiesScreen from '../../../app/(tabs)/activities';
import { Text, TouchableOpacity } from 'react-native';

const routerMocks = (require('expo-router') as any).__routerMocks;

describe('Screen: ActivitiesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders activities feed with stage alerts, mentions, and meeting summaries', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<ActivitiesScreen />);
    });

    const texts = tree!.root.findAllByType(Text);
    expect(texts.some((t) => t.props.children === 'Activity & Alerts')).toBe(true);
    expect(texts.some((t) => t.props.children === 'Live Stage Started')).toBe(true);
    expect(texts.some((t) => t.props.children === 'Mentioned in #general')).toBe(true);
    expect(texts.some((t) => t.props.children === 'MOM Meeting Summary Ready')).toBe(true);

    act(() => {
      tree.unmount();
    });
  });

  it('navigates to stage room when clicking live stage activity', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<ActivitiesScreen />);
    });

    const rows = tree!.root.findAllByType(TouchableOpacity);
    const stageRow = rows.find((r) => {
      const rowTexts = r.findAllByType(Text);
      return rowTexts.some((t) => t.props.children === 'Live Stage Started');
    });

    expect(stageRow).toBeDefined();
    act(() => {
      stageRow!.props.onPress();
    });

    expect(routerMocks.pushMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/room/[id]',
        params: expect.objectContaining({ id: 'chan-stage-1', mode: 'STREAM' }),
      })
    );

    act(() => {
      tree.unmount();
    });
  });
});
