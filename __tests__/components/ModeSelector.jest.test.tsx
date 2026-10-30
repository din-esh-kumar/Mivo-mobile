import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ModeSelector } from '../../src/components/ModeSelector';
import { RoomCommunicationMode } from '../../src/types';
import { Text } from 'react-native';

describe('Component: ModeSelector', () => {
  it('renders all four communication modes (Chat, Voice, Video, Stage)', () => {
    let selected: RoomCommunicationMode | null = null;
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ModeSelector
          currentMode="VOICE"
          onSelectMode={(m) => {
            selected = m;
          }}
        />
      );
    });

    const texts = tree!.root.findAllByType(Text);
    const labels = texts.map((t) => t.props.children);
    expect(labels).toContain('Chat');
    expect(labels).toContain('Voice');
    expect(labels).toContain('Video');
    expect(labels).toContain('Stage');

    // Click Stage mode pill
    const stagePill = tree!.root.findByProps({ testID: 'mode-pill-STREAM' });
    act(() => {
      stagePill.props.onPress();
    });

    expect(selected).toBe('STREAM');
  });

  it('triggers onSelectMode when clicking mode pill', () => {
    let modeChoice: RoomCommunicationMode = 'TEXT';
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ModeSelector
          currentMode="TEXT"
          onSelectMode={(m) => {
            modeChoice = m;
          }}
        />
      );
    });

    const voicePill = tree!.root.findByProps({ testID: 'mode-pill-VOICE' });
    act(() => {
      voicePill.props.onPress();
    });

    expect(modeChoice).toBe('VOICE');
  });
});

