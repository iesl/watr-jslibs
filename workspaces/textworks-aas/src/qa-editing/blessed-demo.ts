import _ from "lodash";
import B from 'blessed';
import { createScreen, appFrame } from './blessterm-widgets';
import { renderQualifiedPaths } from './records-bterm';

const sampleRec2: Record<string, any> = {
  quux: [
    {
      alpha: {
        omega: 1,
        juliet: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
      },
      crux: null,
      crax: undefined,
      gamma: {
        romeo: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
        houses: 2,
      },
      baz: [
        {
          alpha: 'alpha',
          beta: 33,
        },
        'alpha',
        false,
      ]
    }
  ],
  bar: "some bar value",
};


const sampleRec4 = {
  evidence: null,
  value1: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  value2: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo ",
};


// export function runInteractiveReviewUI({ entryPath }: AppArgs): void {
export function runMainUI(): void {
  const screen = createScreen();

  screen.title = 'Q/A Interactive Review';
  const frame = appFrame();
  screen.append(frame);

  const listTable = renderQualifiedPaths(sampleRec2);

  // Append our box to the screen.
  frame.append(listTable);
  listTable.focus();

  // Quit on Escape, q, or Control-C.
  screen.key(
    ['escape', 'q', 'C-c'],
    (_ch: string, _key: B.Widgets.Events.IKeyEventArg) => {
      screen.destroy();
      process.exit();
    });

  // Render the screen.
  screen.render();
}


runMainUI();
