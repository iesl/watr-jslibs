import _ from "lodash";
import React from "react";
import { Text, Box, BoxProps } from "ink";

export type ModJSX = (fc: JSX.Element | string) => JSX.Element;
export type StringToJSX = (s: string) => JSX.Element;

// TODO splice the JSX attributes together rather than nesting them
export const dim: ModJSX = e => <Text dimColor>{e}</Text>;
export const dimGray: ModJSX = e => <Text dimColor color="gray">{e}</Text>;
export const gray: ModJSX = e => <Text color="gray">{e}</Text>;
export const bold: ModJSX = e => <Text bold>{e}</Text>;
export const red: ModJSX = e => <Text color="red">{e}</Text>;
export const blue: ModJSX = e => <Text color="blue">{e}</Text>;
export const boldBlue: ModJSX = e => <Text bold color="blue">{e}</Text>;

export function text(s: string): JSX.Element {
  return <Text>{s}</Text>;
}

export const objKeyColor: StringToJSX = (key: string) => red(text(key));
export const kvSepColor: StringToJSX = (key: string) => dimGray(text(key));

export const Row: React.FC<BoxProps> = (bps) => {
  return <Box {...bps} />;
};

export const Col: React.FC<BoxProps> = (bps) => {
  return <Box flexDirection="column" {...bps} />;
};


