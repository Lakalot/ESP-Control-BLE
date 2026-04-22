import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import { TextWidget } from '@/manifest/render/widgets/TextWidget';
import { StatWidget } from '@/manifest/render/widgets/StatWidget';
import { ToggleWidget } from '@/manifest/render/widgets/ToggleWidget';
import { ButtonWidget } from '@/manifest/render/widgets/ButtonWidget';
import { SliderWidget } from '@/manifest/render/widgets/SliderWidget';
import { SelectWidget } from '@/manifest/render/widgets/SelectWidget';
import { palette } from '@/ui/theme/ui';

const noop = () => {};

function renderProps(overrides: Record<string, unknown> = {}) {
  return {
    node: { slug: 'n', label: 'Label', tone: undefined, bind: undefined },
    action: undefined,
    value: undefined,
    enabled: true,
    tone: undefined,
    onInvoke: noop,
    isPending: false,
    ...overrides,
  } as any;
}

describe('premium manifest widgets', () => {
  it('renders text widgets as premium content cards', () => {
    const { getByTestId, getByText } = render(<TextWidget {...renderProps()} />);

    expect(getByTestId('text-widget')).toBeTruthy();
    expect(getByText('Label')).toBeTruthy();
  });

  it('renders stat widgets with placeholder when no value is available', () => {
    const { getByText } = render(<StatWidget {...renderProps()} />);

    expect(getByText('---')).toBeTruthy();
  });

  it('renders toggle widgets with visible current state text', () => {
    const { getByText } = render(<ToggleWidget {...renderProps()} />);

    expect(getByText('Label')).toBeTruthy();
    expect(getByText('Unknown')).toBeTruthy();
  });

  it('renders destructive buttons with premium danger styling', () => {
    const { getByTestId, getByText } = render(
        <ButtonWidget
          {...renderProps({
            action: { runtimeId: 1, slug: 'system.factory_reset', label: 'Factory reset', dangerLevel: 'dangerous', confirm: undefined, cooldownMs: 0, inputSchema: {}, resultSchema: undefined },
            node: {
              slug: 'factory-reset',
              label: 'Factory reset',
            tone: undefined,
            bind: { action: 'system.factory_reset' },
          },
        })}
      />,
    );

    expect(getByText('Factory reset')).toBeTruthy();
    expect(StyleSheet.flatten(getByTestId('button-widget').props.style).backgroundColor).toBe(
      palette.danger,
    );
  });

  it('disables action widgets when the bound action is unavailable', () => {
    const { getByRole, getByTestId } = render(
      <>
        <ToggleWidget
          {...renderProps({
            node: { slug: 'debug', label: 'Debug', tone: undefined, bind: { action: 'device.set_debug' } },
          })}
        />
        <ButtonWidget
          {...renderProps({
            node: { slug: 'factory-reset', label: 'Factory reset', tone: undefined, bind: { action: 'system.factory_reset' } },
          })}
        />
      </>,
    );

    expect(getByRole('switch').props.disabled).toBe(true);
    expect(getByTestId('button-widget').props.accessibilityState?.disabled).toBe(true);
  });

  it('renders a premium slider widget with current numeric value', () => {
    const node: any = {
      slug: 'brightness',
      label: 'Brightness',
      tone: undefined,
      bind: { action: 'light.set_brightness' },
    };
    const value: any = {
      slug: 'light.brightness',
      value: { kind: 'uint', value: 42 },
      updatedAt: 0,
      stale: false,
    };

    const { getByText, getByTestId } = render(
      <SliderWidget
        {...renderProps({ node, value, action: { runtimeId: 1, slug: 'light.set_brightness', label: 'Brightness', dangerLevel: 'safe', confirm: undefined, cooldownMs: 0, inputSchema: {}, resultSchema: undefined } })}
      />,
    );

    expect(getByTestId('slider-widget')).toBeTruthy();
    expect(getByText('Brightness')).toBeTruthy();
    expect(getByText('42')).toBeTruthy();
  });

  it('renders a V5 select widget with available enum options', () => {
    const node: any = {
      slug: 'profile',
      label: 'Fan Profile',
      tone: undefined,
      bind: { action: 'fan.set_profile', resource: 'fan.profile' },
    };
    const value: any = {
      slug: 'fan.profile',
      value: { kind: 'enum', value: 'normal' },
      updatedAt: 0,
      stale: false,
    };
    const action: any = {
      runtimeId: 1,
      slug: 'fan.set_profile',
      label: 'Set Fan Profile',
      dangerLevel: 'normal',
      confirm: undefined,
      cooldownMs: 0,
      inputSchema: {},
      resultSchema: undefined,
    };

    const { getByText, getByTestId } = render(
      <SelectWidget
        {...renderProps({ node, value, action, enumOptions: ['slow', 'normal', 'fast'] })}
      />,
    );

    expect(getByTestId('select-widget')).toBeTruthy();
    expect(getByText('Fan Profile')).toBeTruthy();
    expect(getByText('normal')).toBeTruthy();
    expect(getByText('slow')).toBeTruthy();
    expect(getByText('fast')).toBeTruthy();
  });
});
