import "chai/register-should";

import _ from "lodash";

import {prettyPrint} from "~/util/pretty-print";
import yoga, {Node} from "yoga-layout-prebuilt";
import prompts from "prompts";

describe("Q/A Editing", () => {
  it("", async (done) => {
    const root = Node.create();
    root.setWidth(500);
    root.setHeight(300);
    root.setJustifyContent(yoga.JUSTIFY_CENTER);

    const node1 = Node.create();
    node1.setWidth(100);
    node1.setHeight(100);

    const node2 = Node.create();
    node2.setWidth(100);
    node2.setHeight(100);

    root.insertChild(node1, 0);
    root.insertChild(node2, 1);

    root.calculateLayout(500, 300, yoga.DIRECTION_LTR);
    console.log(root.getComputedLayout());
    // {left: 0, top: 0, width: 500, height: 300}
    console.log(node1.getComputedLayout());
    // {left: 150, top: 0, width: 100, height: 100}
    console.log(node2.getComputedLayout());
    // {left: 250, top: 0, width: 100, height: 100}

    const res = await prompts({
      type: "select",
      name: "value",
      message: `What to do?`,
      choices: [
        {title: "Download", value: "download"},
        {title: "Skip", value: "skip"},
        {title: "Mark", value: "mark"},
        {title: "Filter", value: "filter"},
        {title: "Continue non-interactive", value: "all"},
        {title: "Quit", value: "quit"},
      ],
      initial: 0,
    });

  });
});
