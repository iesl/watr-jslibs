
import _ from "lodash";
import React, { useState, useEffect } from "react";
import { Text, Box, Color, useApp } from "ink";
import * as ink from "ink";
import ansiEscapes from 'ansi-escapes';
//@ts-ignore
import Divider from 'ink-divider';
import { useKeymap2 } from './keymaps';
import { RenderRec } from './qa-widgets';

const KeymapDemo: React.FC<{}> = ({ }) => {
  const { exit } = useApp();

  const [addKeymapping, keymapElem] = useKeymap2();

  useEffect(() => {
    addKeymapping({
      keys: "q",
      desc: "quit",
      action: () => { process.exit(); }
    });
    addKeymapping({ keys: "vab", desc: "(v)iew a b", action: () => { exit(); } });
    addKeymapping({ keys: "vac", desc: "(v)iew a c", action: () => { exit(); } });
    addKeymapping({ keys: "vba", desc: "(v)iew b a", action: () => { exit(); } });
    addKeymapping({ keys: "vbb", desc: "(v)iew b b", action: () => { exit(); } });

    addKeymapping({ keys: "o1", desc: "(o)pen 1", action: () => { exit(); } });
    addKeymapping({ keys: "o2", desc: "(o)pen 2", action: () => { exit(); } });

    addKeymapping({ keys: "c1", desc: "(c)lose 1", action: () => { exit(); } });
    addKeymapping({ keys: "c2", desc: "(c)lose 2", action: () => { exit(); } });
  }, []);

  const sampleRec: Record<string, any> = {
    foo: "some foo value",
    quux: [
      {
        alpha: 'alpha',
        beta: 'beta',
        gamma: {
          romeo: 'capulet',
          juliet: 'montague',
          priest: 'roman',
        },
        baz: [
          {
            alpha: 'alpha',
            beta: 'beta',
          },
          'alpha',
          'beta',
          'gamma',
        ],
        delta: 'delta',
      }
    ],
    bar: "some bar value",
  };
  return (
    <Box flexDirection="column" marginLeft={1} >

      <Box flexDirection="column" marginLeft={1} marginBottom={1} width="80%" >
        <Divider title={'Record Display'} />
        <RenderRec rec={sampleRec} />
      </Box>

      <Box flexDirection="column" marginLeft={1} marginBottom={1} width="80%" >
        <Divider title={'Keymap'} />
        {keymapElem}
      </Box>
    </Box>
  );

};

export async function runKeymapDemo(): Promise<void> {
  process.stdout.write(ansiEscapes.clearTerminal);
  process.stdout.write(ansiEscapes.clearScreen);
  process.stdout.write(ansiEscapes.cursorDown(1));

  const app = ink.render(
    <KeymapDemo />
  );
  await app.waitUntilExit();
  return;
}

runKeymapDemo();
