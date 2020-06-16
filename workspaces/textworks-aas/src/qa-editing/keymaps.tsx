//
import _ from 'lodash';
import { Text, Box, Color, useInput } from "ink";
import React, { useState, useEffect } from "react";
import { radix, prettyPrint } from 'commons';

export interface KeymapPath {
  descriptions: string[];
}
export interface KeymapEntry {
  keys: string;
  desc: string;
  action: () => void;
}

type KeymapRadixNode = KeymapPath | KeymapEntry;

export interface Keymap {
  keymapEntries: KeymapEntry[];
}


export function keymapEntry(desc: string, keys: string, action: () => void): KeymapEntry {
  return {
    keys, action, desc
  };
}

interface KeymapElemArgs {
  currKeys: string;
  currDescs: JSX.Element[];
}
const KeymapElem: React.FC<KeymapElemArgs> = ({ currKeys, currDescs }) => {
  return (
    <Box flexDirection="column">
      <Box>
        <Color bold blue>
          <Text>{'Input: '}</Text>
          <Text>{currKeys}</Text>
        </Color>
      </Box>
      <Box flexDirection="column">
        {currDescs}
      </Box>
    </Box>
  );
};

export function useKeymap2(): [(k: KeymapEntry) => void, JSX.Element] {

  // Current list of keymappings
  const [currKeymapEntries, setKeymapEntries] =
    useState<KeymapEntry[]>([]);

  const [keymapRadix, setKeymapRadix] =
    useState<radix.Radix<KeymapRadixNode>>(() => {
      return radix.createRadix<KeymapRadixNode>();
    });

  useEffect(() => {
    // Update the keymap radix whenever a new keymapping is added
    const radTree = radix.createRadix<KeymapRadixNode>();
    /* console.log('Updating Radix Tree'); */

    _.each(currKeymapEntries, entry => {
      const keys = entry.keys.split('');
      const leadingKeyPath = keys.slice(0, keys.length - 1);
      /* prettyPrint({ keys, leadingKeyPath }); */
      _.each(_.range(leadingKeyPath.length+1), (n: number) => {
        const path = leadingKeyPath.slice(0, n);
        radix.radUpsert(radTree, path, (prev) => {
          if (prev === undefined) {
            return { descriptions: [entry.desc] };
          }
          if ('descriptions' in prev) {
            return { descriptions: [...prev.descriptions, entry.desc] };
          }
          return prev;
        });
        /* prettyPrint({ msg: '_.each(leading)', path, radTree }); */
      })
      radix.radInsert(radTree, keys, entry);
    });
    /* prettyPrint({ radTree }); */
    setKeymapRadix(radTree);
  }, [currKeymapEntries]);

  // User input tracking

  const [currInput, setCurrInput] = useState<string>("");

  const [currKeymapElem, setKeymapElem] = useState(<KeymapElem currKeys={''} currDescs={[]} />);

  useEffect(() => {
    // Render the keymappings into the provided container
    const keys = currInput.split('');
    const node = radix.radGet(keymapRadix, keys);

    if (node && 'descriptions' in node) {
      const currDescs = _.map(node.descriptions, desc => {
        return (
          <Box key={desc}>
            <Text>{desc}</Text>
          </Box>
        );

      });
      setKeymapElem(<KeymapElem currKeys={currInput} currDescs={currDescs} />)
      return;
    }
    if (node) {
      node.action();
      setCurrInput('');
    }
    setKeymapElem(<KeymapElem currKeys={currInput} currDescs={[]} />)

  }, [currInput, keymapRadix]);

  useInput((input, mods) => {

    if (input === 'q') {
      process.exit();
    }

    const isReset = mods.escape || (input === 'g' && mods.ctrl);
    if (isReset) {
      setCurrInput('');
      return;
    }

    const delOne = ['\b', '\x7f'].includes(input);
    if (delOne) {
      setCurrInput(prev => prev.substring(0, prev.length - 1));
      return;
    }

    setCurrInput(prev => prev + input);
  });

  const addKeymapEntry = (entry: KeymapEntry) => {
    setKeymapEntries(prev => _.concat(prev, [entry]));

  }
  return [addKeymapEntry, currKeymapElem];
}
