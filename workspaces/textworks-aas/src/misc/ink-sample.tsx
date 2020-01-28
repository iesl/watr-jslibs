
import React, { Component, useContext, useState, useEffect } from "react";
import { render, useApp, useInput, Box, Color, AppContext } from "ink";



interface CounterState {
    i: number;
    intervalRan: number;
}

let j = 0;
const Run: React.FC = () => {
    /* console.log(`entering run: ${j}`); */
    const { exit } = useApp();

    const init: CounterState = {
        i: 0,
        intervalRan: 0,
    };

    const [state, setStep] = useState(init);

    useInput((input, _key) => {
        console.log(`input> ${input}: k> ${_key}`);

        switch(input) {
            case 'q':
			          exit();
                break;
        }
    });

    useEffect(() => {
        j += 1;
        console.log(`effect run: ${j}`);
        /* const ns = { ...state };
         * ns.intervalRan += 1;
         * setStep(ns); */
        const interval = setInterval(() => {
            const ns = { ...state };
            ns.i += 1;
            setStep(ns);
        }, 400);

        return () => clearInterval(interval);
    });

    const layout = <Box>
        <Color rgb={[128, 255, 72]} bgKeyword="red">
            <Box paddingTop={2}>Interval Ran: #{state.intervalRan}</Box>
            <Box paddingBottom={2}>Bottom</Box>
            <Box paddingLeft={2}>Left</Box>
            <Box paddingRight={2}>Right</Box>
        </Color>
        <Box paddingX={2}>Left and right</Box>
        <Box paddingY={2}>Top and bottom</Box>
        <Color rgb={[255, 255, 255]} bgKeyword="magenta">
            <Box padding={2}>Top, bottom, left and right</Box>
        </Color>
        <Box>Iteration #{state.i}</Box>;
    </Box>

    return layout;

}




import { progressLogger } from '~/util/logging';

export async function runInkDemo() {
    const spiderLog = progressLogger('spider.log');

    spiderLog('my first log');
    spiderLog('my second log');
    spiderLog('my third log');
    spiderLog({ foo: 'msg1', bar: 'msg2'});

    /* const app = render(<Run />); */
}
