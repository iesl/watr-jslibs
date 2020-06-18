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
import { useKeymap2, useMnemonicKeydefs } from './keymaps';
import { loadExtractionLog } from '~/extract/abstracts/extract-abstracts';
import { RenderRec } from './ink-widgets';
import { openFileWithLess, openFileWithBrowser } from './view-files';
import { CleaningRuleResult, Field } from '~/extract/core/extraction-process';


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

  const [extractionLog,] = useState(loadExtractionLog(entryPath.dir));

  const getEntry = (k: string) => {
    const value = extractionLog[k];
    if (!value) return [];
    return [value];
  };

  const [addKeymapping, keymapElem] = useKeymap2();
  const addKeys = useMnemonicKeydefs(addKeymapping);

  useEffect(() => {
    // Add keymappings
    addKeys("(n)ext", () => exit());
    getEntry('entry.dir')
      .forEach((dir: string) => {
        const cssNormPath = path.resolve(dir, 'normalized-css-normal');
        const htmlTidyPath = path.resolve(dir, 'normalized-html-tidy');
        const responseBodyPath = path.resolve(dir, 'response_body');

        addKeys("(v)iew (c)ss-norms", openWithLess(cssNormPath));
        addKeys("(v)iew (h)tml-tidy", openWithLess(htmlTidyPath));
        addKeys("(v)iew in (b)rowser", openWithBrowser(responseBodyPath));

        addKeys("(m)ark (c)orrect", () => undefined);
        addKeys("(m)ark (i)ncorrect", () => undefined);

        addKeys("(l)abel (i)nvestigate later", () => undefined);

      });

    // addLabelOption({ key='field',  })

    _.each(getEntry('field.extract.errors'), () => {
      addKeys("(l)abel (e)xtraction (e)rror (w)rong", () => undefined);
    });

    _.each(getEntry('field.list'), (fields: Field[]) => {
      _.each(fields, (field) => {
        const { value, cleaning } = field;
        if (value) {
          addKeys("(l)abel (f)ield (v)alue, (w)rong", () => undefined);
        }
        if (cleaning) {
          _.each(cleaning, (_cleaningResult: CleaningRuleResult, index: number) => {
            addKeys(`(l)abel (c)leaning rule (${index}) (w)rong`, () => undefined);
          });
        }
      });
    });

  }, []);


  return (
    <Box flexDirection="column">
      <Box flexDirection="column" marginBottom={2} >
        <Divider title={'Entry'} />
        <RenderRec rec={extractionLog} />
      </Box>

      <Box flexDirection="column" marginLeft={4} marginBottom={1} marginTop={2} >
        <Divider title={'Menu'} />
        {keymapElem}
      </Box>

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
