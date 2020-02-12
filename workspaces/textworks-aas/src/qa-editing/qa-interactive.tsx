//
import _ from "lodash";
import React, {useState} from "react";
import {Text, Box, Color, useInput, useApp} from "ink";
import * as ink from "ink";
export type KeyDef = [string, () => void];
import MultiSelect, { ListedItem } from "ink-multi-select";
import { CleaningRule } from './qa-edits';
import ansiEscapes from 'ansi-escapes';

interface CleaningRulesArgs {
  abstractStr: string;
  setAbstract: (s: string) => void;
  cleaningRules: CleaningRule[];
}

interface RuleSelection extends ListedItem {
  rule: CleaningRule;
  label: string;
  value: string;
}


const CleaningRules: React.FC<CleaningRulesArgs> = ({ cleaningRules, abstractStr, setAbstract }: CleaningRulesArgs) => {
  const items: ListedItem[] = _.map(cleaningRules, (rule, i) => {
    const ruleMatches = rule.precondition(abstractStr);
    return {
      rule,
      label: `${rule.name} matches=${ruleMatches}`,
      value: `rule#${i}`,
      key: `rule#${i}`
    };
  });

  function onSelect(this: MultiSelect, item: ListedItem) {
    const ruleSel = item as any as RuleSelection;
    const rule = ruleSel.rule;
    if (rule.precondition(abstractStr)) {
      const newAbs = rule.run(abstractStr);
      setAbstract(newAbs);
    }
    return this;
  };

  return (
    <Box>
      <MultiSelect
        onSelect={onSelect}
        items={items}
      />
    </Box>
  );
};


interface RunInteractive {
  abstractStr: string;
  cleaningRules: CleaningRule[];
}


const App: React.FC<RunInteractive> = ({ abstractStr, cleaningRules }: RunInteractive) => {
  const {exit} = useApp();

  const keymap: KeyDef[] = [
    ["x", () => 0],
    ["y", () => 0],
    ["z", () => 0],
    ["q", () => exit()],
  ];
  const [currAbstract, setAbstract] = useState(abstractStr);

  useInput((input, _key) => {
    const whichKey = _.find(keymap, ([k]) => k === input);
    if (whichKey) {
      whichKey[1]();
    }
  });

  return (
    <Box flexDirection="column">
      <Box paddingTop={1} paddingBottom={2} >
        <Color bold blue>
          <Text>{ currAbstract }</Text>
        </Color>
      </Box>

      <Box padding={3}>
        <CleaningRules
          abstractStr={currAbstract}
          setAbstract={setAbstract}
          cleaningRules={cleaningRules}
        />
      </Box>
    </Box>
  );
};


export function runInteractive({ abstractStr, cleaningRules }: RunInteractive): Promise<void> {
  process.stdout.write(ansiEscapes.clearScreen);

  const app = ink.render(
    <App
      abstractStr={abstractStr}
      cleaningRules={cleaningRules}
    />
  );
  return app.waitUntilExit();
}
