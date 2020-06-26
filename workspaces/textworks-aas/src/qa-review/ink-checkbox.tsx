import _ from "lodash";
import React, { useEffect, useState } from "react";
import { Box, useFocus,  useInput } from "ink";
import { bold, red, text, blue, dim, gray } from '~/qa-review/ink-widgets';

const defaultIndicators = [
  ' ',
  '✓',
  '✗',
  '⚑',
];

export function defaultStateIndicators(n: number): string[] {
  return defaultIndicators.slice(0, n)
}

interface CheckBoxArgs {
  label: string;
  stateIndicators: string[];
  initialState: number;
  stateCallback: (newState: number) => void;
}

export const CheckBox: React.FC<CheckBoxArgs> = ({ label, stateIndicators, initialState, stateCallback }) => {
  const { isFocused } = useFocus({ autoFocus: true });

  // Checkbox state:
  const [currState, setState] = useState(() => {
    return initialState;
  });

  useInput((input) => {
    const numStates = stateIndicators.length;
    if (input === ' ' && isFocused) {
      setState(prev => (prev + 1) % numStates)
    }
  });

  const [focusIndicator, setFocusIndicator] = useState(dim(blue(text(''))));
  const [stateIndicator, setStateIndicator] = useState(() => {
    return stateIndicators[0];
  });

  useEffect(() => {
    const indicator = isFocused ?
      bold(blue(text("▸ "))) :
      dim(gray(text('  ')));

    setFocusIndicator(indicator);
  }, [isFocused])

  useEffect(() => {
    const indicator = stateIndicators[currState]
    setStateIndicator(indicator);
    stateCallback(currState);
  }, [currState])

  return (
    <Box marginLeft={2} height={1} >
      {focusIndicator}
      {bold(red(text(label)))}
      {bold(blue(text(`[${stateIndicator}]`)))}
    </Box>
  );
};

