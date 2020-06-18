//
import _ from 'lodash';
import { useInput } from 'ink';
import React, { useState, useEffect } from "react";
import { radix } from 'commons';


export type KeyDef = [string, () => void];

export function useKeymap(keys: KeyDef[]): void {
  useInput((input, _key) => {
    const whichKey = _.find(keys, ([k]) => k === input);
    if (whichKey) {
      whichKey[1]();
    }
  });
}

