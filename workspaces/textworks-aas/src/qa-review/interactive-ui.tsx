//
import _ from "lodash";
import React, { useState, useEffect } from "react";
import { useApp, Text, useFocusManager } from "ink";
import * as ink from "ink";
import { ExpandedDir } from "commons";
import ansiEscapes from 'ansi-escapes';
import path from "path";

//@ts-ignore
import { useMnemonicKeydefs, useKeymap } from './keymaps';
import { text, blue, bold, Row, red, Col } from './ink-widgets';
import { openFileWithLess, openFileWithBrowser } from './view-files';
import { readExtractionRecord } from '~/extract/abstracts/extract-abstracts';
import { resolveCachedNormalFile } from '~/extract/core/field-extract';
import { updateCorpusJsonFile, readCorpusJsonFile, listCorpusArtifacts } from '~/corpora/corpus-file-walkers';
import { initGroundTruthEntry, GroundTruthLog, initGroundTruthLog } from '~/extract/core/ground-truth-records';
import { toQualifiedPaths, toObjectPath } from './to-pairs-deep';
import { CheckBox, defaultStateIndicators } from './ink-checkbox';
import { RenderQualifiedPath } from './ink-records';


interface AppArgs {
  entryPath: ExpandedDir;
}

const abstractGroundTruthFilename = 'abstracts-ground-truth.json';

const App: React.FC<AppArgs> = ({ entryPath }) => {
  const { exit } = useApp();

  const [, setRedraws] = useState<number>(0);

  const openWithLess = (filename: string) => () => {
    openFileWithLess(filename)
      .then(() => setRedraws(i => i + 1));
  };
  const openWithBrowser = (filename: string) => () => {
    openFileWithBrowser(filename)
      .then(() => setRedraws(i => i + 1));
  };

  const [groundTruthLogs,] = useState(() => {
    const groundTruthDirs = listCorpusArtifacts(entryPath.dir, 'ground-truth');
    const allLogs = groundTruthDirs
      .files
      .map(gtfile => readCorpusJsonFile<GroundTruthLog>(entryPath.dir, 'ground-truth', gtfile))
      .filter(f => f !== undefined)
    return _.filter(allLogs, a => !_.isNil(a));
  });

  const [extractionRecord,] = useState(() => {
    return readExtractionRecord(entryPath.dir);
  });

  const labelGroundTruth = (tag: string) => () => {
    if (extractionRecord) {
      updateCorpusJsonFile<GroundTruthLog>(
        entryPath.dir, 'ground-truth',
        abstractGroundTruthFilename,
        (prevGrTruth) => {
          const gtLog = prevGrTruth || initGroundTruthLog();
          const entry = initGroundTruthEntry(extractionRecord, tag)
          gtLog.entries.push(entry)
          return gtLog;
        }
      )
    }
  };

  const [cbInfo, setCBInfo] = useState<[number, number]>([0, 0])

  const cbStateCallback = (cbIndex: number) => (cbState: number) => {
    setCBInfo([cbIndex, cbState]);
  };

  const extractionRecordRows = toQualifiedPaths(extractionRecord);

  const extractionRecordStrata = _.map(extractionRecordRows, (qpath, index) => {
    const [kpath] = qpath;
    const localKey = kpath.slice(0, index).map(p => p.key).join(".");

    let leftMarginControls = (<Row></Row>);

    const shouldHaveCheckbox = /(value|count|exists)/.test(localKey);

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
        <Row width={10}>
          {leftMarginControls}
        </Row>
        <Row>
          {qpathRender}
        </Row>
      </Row>
    );
  });


  const [addKeymapping, keymapElem] = useKeymap();
  const focusManager = useFocusManager();
  const addKeys = useMnemonicKeydefs(addKeymapping);

  useEffect(() => {
    // Add keymappings
    addKeys("(n)ext", () => exit());
    addKeys("(q)uit", () => process.exit());
    const { dir } = entryPath;

    const cssNormPath = resolveCachedNormalFile(dir, 'css-normal');
    const htmlTidyPath = resolveCachedNormalFile(dir, 'html-tidy');
    const responseBodyPath = path.resolve(dir, 'response_body');

    addKeys("(v)iew (c)ss-norms", openWithLess(cssNormPath));
    addKeys("(v)iew (h)tml-tidy", openWithLess(htmlTidyPath));
    addKeys("(v)iew in (b)rowser", openWithBrowser(responseBodyPath));

    addKeys("(m)ark (c)orrect", labelGroundTruth('correct'));
    addKeys("(m)ark (i)ncorrect", () => labelGroundTruth('incorrect'));
    addKeys("(u)n (m)ark", () => undefined);

    addKeymapping({ keys: "j", desc: "focus next", action: () => { focusManager.focusNext(); } });
    addKeymapping({ keys: "k", desc: "focus prev", action: () => { focusManager.focusPrevious(); } });

  }, []);


  // create a callback for each path in the rendered rec that creates a checkbox for it

  return (
    <Col>
      <Col width="75%" marginBottom={2} >
        <Text>---- Entry ------</Text>
        <Row margin={1} >
          {bold(red(text('Path: ')))}
          {bold(blue(text(path.basename(entryPath.dir))))}
        </Row>

        {extractionRecordStrata}
      </Col>

      <Text>CheckBox #{cbInfo[0]} updated to {cbInfo[1]}</Text>

      <Col marginLeft={4} marginBottom={1} marginTop={2} >
        <Text>--- Menu -----</Text>
        {keymapElem}
      </Col>

    </Col>
  );
};

export function runInteractiveReviewUI({ entryPath }: AppArgs): Promise<void> {
  process.stdout.write(ansiEscapes.clearTerminal);
  process.stdout.write(ansiEscapes.clearScreen);
  process.stdout.write(ansiEscapes.cursorDown(1));

  const app = ink.render(
    <App
      entryPath={entryPath}
    />
  );
  return app.waitUntilExit();
}
