//
import _ from "lodash";
import React, { useState, useEffect } from "react";
import { Box, useApp } from "ink";
import * as ink from "ink";
import { BufferedLogger, ExpandedDir } from "commons";
import ansiEscapes from 'ansi-escapes';
import path from "path";

//@ts-ignore
import Divider from 'ink-divider';
import { useMnemonicKeydefs, useKeymap } from './keymaps';
import { RenderRec, RenderAnyTruncated, text, blue, bold, Row, red, Col } from './ink-widgets';
import { openFileWithLess, openFileWithBrowser } from './view-files';
import { readExtractionLog } from '~/extract/abstracts/extract-abstracts';
import { resolveCachedNormalFile } from '~/extract/core/field-extract';
import { updateCorpusJsonFile, readCorpusJsonFile, listCorpusArtifacts } from '~/corpora/corpus-file-walkers';
import { initGroundTruthEntry, GroundTruthLog, initGroundTruthLog } from '~/extract/core/ground-truth-logs';
import { ExtractionLog } from '~/extract/core/extraction-records';


interface AppArgs {
  entryPath: ExpandedDir;
  logger: BufferedLogger;
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

  const MissingLogRec = ({ NoExtractionLog: true });

  const [extractionLog,] = useState(() => {
    const log = readExtractionLog(entryPath.dir);
    if (!log) {
      return MissingLogRec;
    }
    return log;
  });

  const haveExtractionLog = () => !_.isEqual(extractionLog, MissingLogRec);;

  const labelGroundTruth = (tag: string) => () => {
    if (haveExtractionLog()) {
      updateCorpusJsonFile<GroundTruthLog>(
        entryPath.dir, 'ground-truth',
        abstractGroundTruthFilename,
        (prevGrTruth) => {
          const gtLog = prevGrTruth || initGroundTruthLog();
          const entry = initGroundTruthEntry(extractionLog, tag)
          gtLog.entries.push(entry)
          return gtLog;
        }
      )
    }
  };

  const [addKeymapping, keymapElem] = useKeymap();
  const addKeys = useMnemonicKeydefs(addKeymapping);

  useEffect(() => {
    // Add keymappings
    addKeys("(n)ext", () => exit());
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

  }, []);

  return (
    <Col>
      <Col marginBottom={2} >
        <Divider title={'Entry'} />
        <Row margin={1} >
          {bold(red(text('Path: ')))}
          {bold(blue(text(path.basename(entryPath.dir))))}
        </Row>
        <RenderRec
          rec={extractionLog}
          renderOverrides={[
            ['changes', RenderAnyTruncated]
          ]}
        />
      </Col>

      <Col marginLeft={4} marginBottom={1} marginTop={2} >
        <Divider title={'Menu'} />
        {keymapElem}
      </Col>

    </Col>
  );
};

export function runInteractiveReviewUI({ entryPath, logger }: AppArgs): Promise<void> {
  process.stdout.write(ansiEscapes.clearTerminal);
  process.stdout.write(ansiEscapes.clearScreen);
  process.stdout.write(ansiEscapes.cursorDown(1));

  const app = ink.render(
    <App
      logger={logger}
      entryPath={entryPath}
    />
  );
  return app.waitUntilExit();
}
