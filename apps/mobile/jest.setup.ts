// react-hook-form warns about missing performance measurement APIs in jsdom.
globalThis.performance ??= { now: () => Date.now() } as Performance;

jest.mock('@expo/vector-icons/Feather', () => {
  const React = require('react');
  const { Text } = require('react-native');

  function FeatherIcon({ name, color }: { name: string; color?: string }) {
    return React.createElement(Text, { style: { color } }, name);
  }

  FeatherIcon.glyphMap = {
    home: 1,
    settings: 1,
    'bar-chart-2': 1,
    sliders: 1,
    wifi: 1,
    activity: 1,
    thermometer: 1,
    zap: 1,
    circle: 1,
  };

  return {
    __esModule: true,
    default: FeatherIcon,
  };
}, { virtual: true });
