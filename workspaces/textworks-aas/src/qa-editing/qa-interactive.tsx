//
import _ from "lodash";
import React, { useState } from "react";
import { Text, Box, Color, useApp } from "ink";
import * as ink from "ink";
import { BufferedLogger, ExpandedDir } from "commons";
import ansiEscapes from 'ansi-escapes';
import path from "path";

//@ts-ignore
import Divider from 'ink-divider';
/* import { CleaningRule } from '~/extract/qa-review-abstracts'; */
import { KeyDef, useKeymap, Keymap, keymapEntry, KeymapEntry } from './qa-interactive-utils';
import { loadExtractionLog } from '~/extract/field-extract-abstract';
import { getLogEntries } from './qa-logging';
import { openFileWithLess, openFileWithBrowser } from '~/extract/tidy-html';

interface KeymapUIArgs {
  keymap: Keymap;
}
const KeymapUI: React.FC<KeymapUIArgs> = ({ keymap }) => {
  const display = _.map(keymap.keymapEntries, (entry) => {
    <Box>
      <Color bold white>
        <Text>{entry.desc}</Text>
        <Text>{entry.keys}</Text>
      </Color>
    </Box>
  });

  return (
    <Box flexDirection="column">
      {display}
    </Box>
  );
}

interface TitledBoxArgs {
  title: string;
  body: string;
}
const TitledBox: React.FC<TitledBoxArgs> = ({ title, body }) => {
  return (
    <Box flexDirection="column">
      <Divider title={title} />

      <Box textWrap="wrap" marginLeft={4} marginBottom={1} width="80%" height={15} >
        <Color bold blue>
          <Text>{body}</Text>
        </Color>
      </Box>

    </Box>
  );
};


interface AppArgs {
  entryPath: ExpandedDir;
  logger: BufferedLogger;
}

const App: React.FC<AppArgs> = ({ entryPath, logger }) => {
  const { exit } = useApp();

  const okAndNext = () => {
    exit();
  };
  const [, setRedraws] = useState<number>(0);

  const openWithLess = (filename: string) => () => {
    openFileWithLess(filename).then(() => {
      setRedraws(i => i + 1);
    });
  };
  const openWithBrowser = (filename: string) => () => {
    openFileWithBrowser(filename).then(() => {
      setRedraws(i => i + 1);
    });
  };

  const keymapEntries: KeymapEntry[] = [];

  const keymap: KeyDef[] = [
    ["n", okAndNext],
    ["q", () => { process.exit(); }],
  ];

  const [extractionLog,] = useState(loadExtractionLog(entryPath.dir));

  const getEntry = _.curry(getLogEntries)(extractionLog);
  const entryDisplay = getEntry('entry.dir')
    .map((dir: string) => (<TitledBox title="Entry" body={dir} />));

  getEntry('entry.dir')
    .forEach((dir: string) => {
      const cssNormPath = path.resolve(dir, 'normalized-css-normal');
      const htmlTidyPath = path.resolve(dir, 'normalized-html-tidy');
      const responseBodyPath = path.resolve(dir, 'response_body');
      keymapEntries.push(
        keymapEntry("vc", "(v)iew (c)ss-norms", openWithLess(cssNormPath)),
        keymapEntry("vh", "(v)iew (h)tml-tidy", openWithLess(htmlTidyPath)),
        keymapEntry("vb", "(v)iew in (b)rowser", openWithLess(htmlTidyPath))
      );
      keymap.push(["1", openWithLess(cssNormPath)])
      keymap.push(["2", openWithLess(htmlTidyPath)])
      keymap.push(["3", openWithBrowser(responseBodyPath)])
    });


  // getValue('field.abstract.extract.errors')
  //    .map(value => appendShowBox(value))
  //    .map(() => appendUserAction('v', assertGoldValue))

  // getValue('fields')
  //    .map(value => appendShowBox(value))
  //    .map(() => appendUserAction('v', assertGoldValue))




  useKeymap(keymap);

  /* const viewWidth = 200; */
  const rawAbsViewHeight = 15;
  /* const cleanAbsViewHeight = 10; */

  let title = "Abstract (cleaned)";

  const textLog = JSON.stringify(extractionLog);

  return (
    <Box flexDirection="column">
      <Divider title={title} />

      <Box textWrap="wrap" marginLeft={4} marginBottom={1} width="80%" height={rawAbsViewHeight} >
        <Color bold blue>
          <Text>{textLog}</Text>
        </Color>
      </Box>
      {[entryDisplay]}


      <KeymapUI keymap={({ keymapEntries })} />

    </Box>
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
