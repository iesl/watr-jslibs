
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useApp, useFocusManager, Text, Newline } from "ink";
import * as ink from "ink";
import ansiEscapes from 'ansi-escapes';
import { useKeymap } from '~/qa-review/keymaps';
import { text, Col, Row } from '~/qa-review/ink-widgets';
import { CheckBox, defaultStateIndicators } from '~/qa-review/ink-checkbox';
import { toPairsDeep } from '~/qa-review/view-files';
import { RenderRecPaths, RenderRec, RenderAnyTruncated } from '~/qa-review/ink-records';

const KeymapDemo: React.FC<{}> = ({ }) => {
  const { exit } = useApp();

  const [addKeymapping, keymapElem] = useKeymap();
  const focusManager = useFocusManager();

  useEffect(() => {
    addKeymapping({
      keys: "q",
      desc: "quit",
      action: () => { process.exit(); }
    });

    addKeymapping({ keys: "j", desc: "focus next", action: () => { focusManager.focusNext(); } });
    addKeymapping({ keys: "k", desc: "focus prev", action: () => { focusManager.focusPrevious(); } });

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
          priest: 'roman, but really not, I do not think',
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
        overlong: [
          'alpha',
          'alpha',
          'alpha',
          'beta',
          'gamma',
        ],
        delta: 'delta',
      }
    ],
    bar: "some bar value",
  };
  // Render Record w/left margin controls

  const [cbInfo, setCBInfo] = useState<[number, number]>([0, 0])

  const cbStateCallback = (cbIndex: number) => (cbState: number) => {
    setCBInfo([cbIndex, cbState]);
  };

  useEffect(() => {
  }, [cbInfo]);

  const focusables = _.map(_.range(4), index => {
    return <CheckBox
      label={`key#${index}`}
      initialState={0}
      stateCallback={cbStateCallback(index)}
      stateIndicators={defaultStateIndicators(3)}
    />
  });

  const sampleRecPathPairs = toPairsDeep(sampleRec);

  return (
    <Col marginLeft={1} >

      <Row marginLeft={1} marginRight={3} width="80%" >

        <Col>
          {text('Record Display')}
          <Newline />

          <RenderRec
            rec={sampleRec}
            renderOverrides={[
              ['overlong', RenderAnyTruncated],
              ['priest', RenderAnyTruncated],
            ]}
          />

        </Col>

        <Col>
          {text('Updated Ver.')}
          <Newline />
          <RenderRecPaths recPaths={sampleRecPathPairs} />
        </Col>

      </Row>
      <Col>
        {focusables}
      </Col>
      <Text>CheckBox #{cbInfo[0]} updated to {cbInfo[1]}</Text>

      <Col marginLeft={1} marginBottom={1} width="80%" >
        {text('KeyMap')}
        {keymapElem}
      </Col>

    </Col>
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
