import React from 'react';

import type { ControlProps } from '../../types/control.types';
import { CmdType } from '../../types/manifest.types';
import { ActionControl } from './controls/ActionControl';
import { ColorPickerControl } from './controls/ColorPickerControl';
import { MultiSelectControl } from './controls/MultiSelectControl';
import { ProgressControl } from './controls/ProgressControl';
import { RangeControl } from './controls/RangeControl';
import { ReadOnlyControl } from './controls/ReadOnlyControl';
import { TextInputControl } from './controls/TextInputControl';
import { ToggleControl } from './controls/ToggleControl';
import { XYPadControl } from './controls/XYPadControl';

export function CommandControl(props: ControlProps) {
  switch (props.command.type) {
    case CmdType.ACTION:
      return <ActionControl {...props} />;
    case CmdType.TOGGLE:
      return <ToggleControl {...props} />;
    case CmdType.RANGE:
      return <RangeControl {...props} />;
    case CmdType.READ_ONLY:
      return <ReadOnlyControl {...props} />;
    case CmdType.TEXT_INPUT:
      return <TextInputControl {...props} />;
    case CmdType.COLOR_PICKER:
      return <ColorPickerControl {...props} />;
    case CmdType.XY_PAD:
      return <XYPadControl {...props} />;
    case CmdType.MULTI_SELECT:
      return <MultiSelectControl {...props} />;
    case CmdType.PROGRESS:
      return <ProgressControl {...props} />;
    default:
      return null;
  }
}
