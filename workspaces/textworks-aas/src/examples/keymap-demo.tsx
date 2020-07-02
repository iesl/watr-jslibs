
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useApp, useFocusManager, Text, Newline } from "ink";
import * as ink from "ink";
import ansiEscapes from 'ansi-escapes';
import { useKeymap } from '~/qa-review/keymaps';
import { text, Col, Row } from '~/qa-review/ink-widgets';
import { CheckBox, defaultStateIndicators } from '~/qa-review/ink-checkbox';
import { RenderQualifiedPath } from '~/qa-review/ink-records';
import { toQualifiedPaths } from '~/qa-review/to-pairs-deep';
import fs from "fs-extra";
import path from "path";

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


const sampleRec4 = {
  evidence: null,
  value1: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  value2: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo ",
};




const switchRecord = (): any => {
  const testDirPath = './test/resources/extraction-records';
  const recFile = path.resolve(testDirPath, 'extraction-records.0.json');
  const content = fs.readJsonSync(recFile);
  return content;
}

const KeymapDemo: React.FC<{}> = ({ }) => {
  const { exit } = useApp();

  const [addKeymapping, keymapElem] = useKeymap();
  const focusManager = useFocusManager();

  const currentRecord = sampleRec4; // switchRecord();

  const [cbInfo, setCBInfo] = useState<[number, number]>([0, 0])

  const cbStateCallback = (cbIndex: number) => (cbState: number) => {
    setCBInfo([cbIndex, cbState]);
  };

  const qualifiedPaths = toQualifiedPaths(currentRecord);

  const qpathKeys = _.map(qualifiedPaths, (qpath, index) => {
    const [kpath] = qpath;
    const localKey = kpath.slice(0, index).map(p => p.key).join(".");
    /* console.log('qualifiedPaths', qpath); */
    return localKey;
  });

  const qpathRenders = _.map(qualifiedPaths, (qpath, index) => {
    const [kpath] = qpath;
    const localKey = kpath.slice(0, index).map(p => p.key).join(".");

    let leftMarginControls = (<Row></Row>);
    const shouldHaveCheckbox = /(count|exists|value)/.test(localKey);

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
        {/* <Row width={12}>{leftMarginControls}</Row> */}
        <Row>
          {qpathRender}
        </Row>
      </Row>
    );
  });

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


  return (
    <Col marginLeft={0} >

      <Row marginLeft={0} marginRight={0} width="80%" >

        <Col>
          {text('Updated Ver.')}
          {qpathRenders}
        </Col>

      </Row>

      <Text>CheckBox #{cbInfo[0]} updated to {cbInfo[1]}</Text>

      <Newline />

      <Text>Keys</Text>
      <Text>{qpathKeys}</Text>

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
