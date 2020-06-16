//
import _ from "lodash";
import React, { useState, useEffect } from "react";
import { Text, Box, Color, useApp } from "ink";
import * as ink from "ink";
import { BufferedLogger, ExpandedDir } from "commons";
import ansiEscapes from 'ansi-escapes';
import path from "path";

//@ts-ignore
import Divider from 'ink-divider';
import { loadExtractionLog } from '~/extract/field-extract-abstract';
import { getLogEntries } from './qa-logging';
import { openFileWithLess, openFileWithBrowser } from '~/extract/tidy-html';
import { useKeymap2, useMnemonicKeydefs } from './keymaps';
import { Field } from '~/extract/field-extract';
import { CleaningRuleResult } from '~/extract/qa-review-abstracts';

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
interface KeyValBoxArgs {
  keyname: string;
  val?: string;
}
const KeyValBox: React.FC<KeyValBoxArgs> = ({ keyname, val }) => {
  return (
    <Box marginLeft={2} marginBottom={0} width="80%" height={1} >
      <Color bold red> <Text>{keyname}: </Text> </Color>
      <Color bold blue> <Text>{val ? val : '<none>'}</Text> </Color>
    </Box>
  );
};


interface AppArgs {
  entryPath: ExpandedDir;
  logger: BufferedLogger;
}

const App: React.FC<AppArgs> = ({ entryPath, logger }) => {
  const { exit } = useApp();

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

  const [extractionLog,] = useState(loadExtractionLog(entryPath.dir));
  const getEntry = _.curry(getLogEntries)(extractionLog);

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
        addKeys("(l)abel (g)olden", () => undefined);
        addKeys("(l)abel (w)rong", () => undefined);
        addKeys("(l)abel (i)nvestigate later", () => undefined);

      });

    /* _.each(getEntry('field.abstract.extract'), (errors: string) => {
     *   addKeys("(l)abel (e)xtraction (r)esult (w)rong", () => undefined);
     * });
     */
    _.each(getEntry('field.abstract.extract.errors'), (errors: string) => {
      addKeys("(l)abel (e)xtraction (e)rror (w)rong", () => undefined);
    });

    _.each(getEntry('field'), (fields: Field[]) => {
      _.each(fields, (field, fieldNum) => {
        const { name, evidence, value, cleaning, error } = field;
        if (value) {
          addKeys("(l)abel (f)ield (v)alue, (w)rong", () => undefined);
        }
        if (cleaning) {
          _.each(cleaning, (cleaningResult: CleaningRuleResult, index: number) => {
            addKeys(`(l)abel (c)leaning rule (${index}) (w)rong`, () => undefined);
          });
        }
      });
    });

  }, []);


  const entryDisplay = getEntry('entry.dir')
    .map((dir: string, index: number) => {
      const basename = path.basename(dir);
      return <KeyValBox key={`entry.dir.${index}`} keyname={'Path'} val={basename} />
    });

  const extractResult = getEntry('field.abstract.extract')
    .map((res: boolean, index: number) => {
      return <KeyValBox key={`field.abstract.extract.${index}`} keyname={'Found Abstract'} val={`${res}`} />
    });

  const extractErrors = getEntry('field.abstract.extract.errors')
    .map((error: string, index: number) => {
      return <KeyValBox key={`field.abstract.extract.error.${index}`} keyname={'Extraction Error'} val={error} />
    });

  const fieldView = getEntry('fields')
    .flatMap((fields: Field[]) => {
      return _.map(fields, field => {
        const { name, evidence, value, cleaning, error } = field;
        const fieldValue = value ? value : '';
        const fieldDisplayHeight = Math.round(fieldValue.length / 140) + 2;


        let cleaningDisplay: JSX.Element[] = [];

        if (cleaning) {
          cleaningDisplay = _.map(cleaning, (cleaningResult: CleaningRuleResult, index: number) => {
            const { input, output, rule } = cleaningResult;
            return (
              <Box marginBottom={1} flexDirection="column" key={`cleaning.rule.${index}`} >
                <KeyValBox keyname={'Cleaning Rule'} val={`#${index}`} />
                <Box marginLeft={2} flexDirection="column">
                  <KeyValBox key={`cleaning.rule.i.${index}`} keyname={'Input'} val={input} />
                  <KeyValBox key={`cleaning.rule.o.${index}`} keyname={'Output'} val={output} />
                  <KeyValBox key={`cleaning.rule.r.${index}`} keyname={'Rule'} val={rule} />
                </Box>
              </Box>
            );
          });
        }

        return (
          <Box key="fields" flexDirection="column">
            <Divider title={name} />

            <KeyValBox keyname={'Evidence'} val={evidence} />
            <KeyValBox keyname={'Error'} val={error} />
            {cleaningDisplay}

            <Box textWrap="wrap" marginLeft={4} marginBottom={1} width="80%" height={fieldDisplayHeight} >
              <Color bold blue>
                <Text>{fieldValue}</Text>
              </Color>
            </Box>
          </Box>
        );
      })
    });


  const textLog = JSON.stringify(extractionLog);

  return (
    <Box flexDirection="column">

    <Divider title={'Entry'} />

    {entryDisplay}
    {extractResult}
    {extractErrors}
    {fieldView}

    <Divider title={'Keymap'} />

    {keymapElem}

    <Divider title={'Log Entry'} />

    <Box textWrap="wrap" marginLeft={4} marginBottom={1} width="80%" height={15} >
      <Color bold blue>
        <Text>{textLog}</Text>
      </Color>
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
