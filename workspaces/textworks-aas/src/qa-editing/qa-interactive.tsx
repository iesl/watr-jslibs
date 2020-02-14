//
import _ from "lodash";
import React, {useState} from "react";
import {Text, Box, Color, useInput, useApp} from "ink";
import * as ink from "ink";
export type KeyDef = [string, () => void];
import MultiSelect, { ListedItem } from "ink-multi-select";
import { CleaningRule } from './qa-edits';
import { BufferedLogger } from "~/util/logging";
import ansiEscapes from 'ansi-escapes';

//@ts-ignore
import Divider from 'ink-divider';
import { clipParagraph } from '~/util/string-utils';

interface CleaningRulesArgs {
  abstractStr: string;
  setAbstract: (s: string) => void;
  cleaningRules: CleaningRule[];
  logger: BufferedLogger;
}

interface RuleSelection extends ListedItem {
  rule: CleaningRule;
  ruleDidMatch: boolean;
  label: string;
  value: string;
}


const CleaningRules: React.FC<CleaningRulesArgs> = ({ cleaningRules, abstractStr }: CleaningRulesArgs) => {

  const items  = _.map(cleaningRules, (rule, i) => {
    const ruleDidMatch = rule.precondition(abstractStr);
    const label = `${rule.name} matches=${ruleDidMatch}`
    let rgb: [number, number, number] = [255, 255, 255];
    if (ruleDidMatch) {
      rgb = [255, 0, 0];
    }

    return (
      <Color key={i} rgb={rgb}>
        <Text >{label}</Text>
      </Color>
    );
  });

  return (
    <Box flexDirection="column"> { items } </Box>
  );
};


interface RunInteractive {
  abstractStr: string;
  cleaningRules: CleaningRule[];
  logger: BufferedLogger;
}

const App: React.FC<RunInteractive> = ({ abstractStr, cleaningRules, logger }: RunInteractive) => {
  const {exit} = useApp();

  const okAndNext = () => {
    logger.append('field.abstract.clean=true');
    exit();
  };

  const notOkAndNext = () => {
    logger.append('field.abstract.clean=false');
    exit();
  };
  const previousNotOkAndNext = () => {
    logger.append('field.abstract.prev.clean=false');
    exit();
  };

  const keymap: KeyDef[] = [
    ["n", okAndNext],
    ["x", notOkAndNext],
    ["p", previousNotOkAndNext],
    ["(", () => { process.exit(); }],
  ];

  const [currAbstract, setAbstract] = useState(abstractStr);

  const [cleanedAbstract] = useState(() => {
    let cleanedAbs = abstractStr;

    _.map(cleaningRules, rule => {
      if (rule.precondition(cleanedAbs)) {
        cleanedAbs = rule.run(cleanedAbs);
      }
    });

    return cleanedAbs;
  });

  useInput((input, _key) => {
    const whichKey = _.find(keymap, ([k]) => k === input);
    if (whichKey) {
      whichKey[1]();
    }
  });
  const viewWidth = 200;
  const rawAbsViewHeight = 15;
  const cleanAbsViewHeight = 10;

  let clippedAbs = clipParagraph(viewWidth, rawAbsViewHeight, currAbstract);
  clippedAbs = clippedAbs.length === 0 ? "<empty>" : clippedAbs;

  let clippedCleanAbs = clipParagraph(viewWidth, cleanAbsViewHeight, cleanedAbstract);
  clippedCleanAbs = clippedCleanAbs.length === 0 ? "<empty>" : clippedCleanAbs;

  let title = "Abstract (cleaned)";

  if (currAbstract === cleanedAbstract) {
    title = "Abstract (cleaned == raw)";
  }

  return (
    <Box flexDirection="column">
      <Divider title={title} />

      <Box textWrap="wrap" marginLeft={4} marginBottom={1} width="80%" height={cleanAbsViewHeight} >
        <Color bold blue>
          <Text>{ clippedCleanAbs }</Text>
        </Color>
      </Box>

      <Divider title={'Abstract (raw)'} />

      <Box textWrap="wrap" marginLeft={4} marginBottom={1} width="80%" height={rawAbsViewHeight} >
        <Color bold blue>
          <Text>{ clippedAbs }</Text>
        </Color>
      </Box>

      <Divider title={'Rule Selection'} />

      <Box padding={3}>
        <CleaningRules
          abstractStr={currAbstract}
          setAbstract={setAbstract}
          cleaningRules={cleaningRules}
          logger={logger}
        />
      </Box>
    </Box>
  );
};


export function runInteractive({ abstractStr, cleaningRules, logger }: RunInteractive): Promise<void> {
  process.stdout.write(ansiEscapes.clearTerminal);
  process.stdout.write(ansiEscapes.clearScreen);
  process.stdout.write(ansiEscapes.cursorDown(1));
  /* prettyPrint({ abstractStr, cleaningRules, }); */


  const app = ink.render(
    <App
      abstractStr={abstractStr}
      cleaningRules={cleaningRules}
      logger={logger}
    />
  );
  return app.waitUntilExit();
}
