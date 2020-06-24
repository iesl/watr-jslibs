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


interface AppArgs {
  entryPath: ExpandedDir;
  logger: BufferedLogger;
}

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

  const [extractionLog,] = useState(() => {
    const maybeLog = readExtractionLog(entryPath.dir);
    if (!maybeLog) {
      return {
        'Error': 'No extraction log found'
      };
    }
    return maybeLog;
  });

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

    addKeys("(m)ark (c)orrect", () => undefined);
    addKeys("(m)ark (i)ncorrect", () => undefined);
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
