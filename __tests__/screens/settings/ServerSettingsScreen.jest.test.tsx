import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ServerSettingsScreen from '../../../app/settings/server';
import { useConfigStore } from '../../../src/stores/useConfigStore';
import { Text } from 'react-native';

const routerMocks = (require('expo-router') as any).__routerMocks;

describe('Screen: ServerSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useConfigStore.setState({
        apiUrl: 'http://localhost:4000/api/v1',
        wsUrl: 'http://localhost:4000',
      });
    });
  });

  it('renders header, explanation banner, presets, and input fields', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<ServerSettingsScreen />);
    });

    const root = tree!.root;
    expect(root.findByProps({ testID: 'server-back-btn' })).toBeDefined();
    expect(root.findByProps({ testID: 'preset-wifi-btn' })).toBeDefined();
    expect(root.findByProps({ testID: 'preset-localhost-btn' })).toBeDefined();
    expect(root.findByProps({ testID: 'preset-emulator-btn' })).toBeDefined();
    expect(root.findByProps({ testID: 'input-api-url' })).toBeDefined();
    expect(root.findByProps({ testID: 'input-ws-url' })).toBeDefined();
    expect(root.findByProps({ testID: 'save-endpoints-btn' })).toBeDefined();
    expect(root.findByProps({ testID: 'reset-endpoints-btn' })).toBeDefined();

    const texts = root.findAllByType(Text);
    expect(texts.some((t) => t.props.children === 'Server Endpoints')).toBe(true);

    act(() => {
      tree.unmount();
    });
  });

  it('populates fields when selecting preset', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<ServerSettingsScreen />);
    });

    const wifiPresetBtn = tree!.root.findByProps({ testID: 'preset-wifi-btn' });
    act(() => {
      wifiPresetBtn.props.onPress();
    });

    const apiInput = tree!.root.findByProps({ testID: 'input-api-url' });
    const wsInput = tree!.root.findByProps({ testID: 'input-ws-url' });

    expect(apiInput.props.value).toBe('http://192.168.1.10:4000/api/v1');
    expect(wsInput.props.value).toBe('http://192.168.1.10:4000');

    act(() => {
      tree.unmount();
    });
  });

  it('saves custom endpoints on save button click', async () => {
    const updateEndpointsMock = jest.fn().mockResolvedValue(undefined);
    act(() => {
      useConfigStore.setState({ updateEndpoints: updateEndpointsMock });
    });

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<ServerSettingsScreen />);
    });

    const apiInput = tree!.root.findByProps({ testID: 'input-api-url' });
    act(() => {
      apiInput.props.onChangeText('http://custom-api.mivo.dev/api/v1');
    });

    const saveBtn = tree!.root.findByProps({ testID: 'save-endpoints-btn' });
    await act(async () => {
      saveBtn.props.onPress();
    });

    expect(updateEndpointsMock).toHaveBeenCalledWith(
      'http://custom-api.mivo.dev/api/v1',
      'http://localhost:4000'
    );

    act(() => {
      tree.unmount();
    });
  });
});
