
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useApp, useFocusManager, Text, Newline } from "ink";
import * as ink from "ink";
import ansiEscapes from 'ansi-escapes';
import { useKeymap } from '~/qa-review/keymaps';
import { text, Col, Row } from '~/qa-review/ink-widgets';
import { CheckBox, defaultStateIndicators } from '~/qa-review/ink-checkbox';
import { RenderRec, RenderAnyTruncated, RenderQualifiedPath } from '~/qa-review/ink-records';
import { toQualifiedPaths, toObjectPath } from '~/qa-review/to-pairs-deep';

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

  }, []);

  const sampleRec2: Record<string, any> = {
    quux: [
      {
        alpha: {
          omega: 1
        },
        crux: null,
        crax: undefined,
        gamma: {
          romeo: 'capulet',
          houses: 2,
        },
        baz: [
          {
            alpha: 'alpha',
            beta: 33,
          },
          'alpha',
          false,
        ]
      }
    ],
    bar: "some bar value",
  };


  const [cbInfo, setCBInfo] = useState<[number, number]>([0, 0])

  const cbStateCallback = (cbIndex: number) => (cbState: number) => {
    setCBInfo([cbIndex, cbState]);
  };

  const qualifiedPaths = toQualifiedPaths(sampleRec2);

  const qpathRenders = _.map(qualifiedPaths, (qpath, index) => {
    const opath = toObjectPath(qpath);
    const [kpath, value] = qpath;
    const localKey = kpath.slice(0, index).map(p => p.key).join(".");

    let leftMarginControls = (<Row></Row>);

    const shouldHaveCheckbox = /alpha/.test(localKey);

    if (shouldHaveCheckbox) {
      const checkbox = (
        <CheckBox
          key={`cb.${localKey}#${index}`}
          label={`${index} -`}
          initialState={0}
          stateCallback={cbStateCallback(index)}
          stateIndicators={defaultStateIndicators(3)}
        />);

      leftMarginControls = checkbox;
    }

    const qpathRender = <RenderQualifiedPath key={`rqp.${localKey}#${index}`} qpath={qpath}></RenderQualifiedPath>;

    return (
      <Row key={`row.${localKey}#${index}`}>
        <Row width="20%">
          {leftMarginControls}
        </Row>
        <Row>
          {qpathRender}
        </Row>
      </Row>
    );
  });

  return (
    <Col marginLeft={1} >

      <Row marginLeft={1} marginRight={3} width="80%" >

        <Col>
          {text('Record Display')}
          <Newline />

          <RenderRec
            rec={sampleRec2}
            renderOverrides={[
              ['overlong', RenderAnyTruncated],
              ['priest', RenderAnyTruncated],
            ]}
          />
        </Col>

        <Col>
          {text('Updated Ver.')}
          <Newline />
          {qpathRenders}
        </Col>

      </Row>

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
