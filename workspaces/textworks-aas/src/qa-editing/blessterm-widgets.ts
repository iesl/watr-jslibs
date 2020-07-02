// @ts-nocheck

/**
  * Note: Type checking is turned off in this file because neo-blessed/neo-blessed-contrib don't have
  * typescript .d.ts files available. When they do, the ts-nocheck should be turned off.
 */
import B from 'blessed';
import blessed from 'neo-blessed';
import NB from 'neo-blessed';
import nbc from 'neo-blessed-contrib';


export type NBCTree = any;

export function treeDemo(): NBCTree {
  const tree = nbc.tree({ fg: 'green' })


  tree.on('select', function(node) {
    if (node.myCustomProperty) {
      console.log(node.myCustomProperty);
    }
    console.log(node.name);
  });

  // you can specify a name property at root level to display root
  tree.setData({
    extended: true
    , children:
    {
      'Fruit':
      {
        children:
        {
          'Banana': {}
          , 'Apple': {}
          , 'Cherry': {}
          , 'Exotics': {
            children:
            {
              'Mango': {}
              , 'Papaya': {}
              , 'Kiwi': { name: 'Kiwi (not the bird!)', myCustomProperty: "hairy fruit" }
            }
          }
          , 'Pear': {}
        }
      }
      , 'Vegetables':
      {
        children:
        {
          'Peas': {}
          , 'Lettuce': {}
          , 'Pepper': {}
        }
      }
    }
  });

  return tree;
}

export function appFrame(): B.Widgets.BoxElement {
  const box = blessed.box({
    // top: 'center',
    // left: 'center',
    width: '100%',
    height: '100%',
    // border: {
    //   type: 'line'
    // },
    style: {
      fg: 'white',
      border: {
        fg: '#f0f0f0'
      },
      hover: {
        bg: 'green'
      }
    }
  });
  return box;
}

export function boxDemo(): B.Widgets.BoxElement {
  const box = blessed.box({
    top: 'center',
    left: 'center',
    width: '50%',
    height: '50%',
    content: 'Hello {bold}world{/bold}!',
    tags: true,
    border: {
      type: 'line'
    },
    style: {
      fg: 'white',
      bg: 'magenta',
      border: {
        fg: '#f0f0f0'
      },
      hover: {
        bg: 'green'
      }
    }
  });

  // If our box is clicked, change the content.
  box.on('click', function(data) {
    box.setContent('{center}Some different {red-fg}content{/red-fg}.{/center}');
    screen.render();
  });

  // If box is focused, handle `enter`/`return` and give us some more content.
  box.key('enter', function(ch, key) {
    box.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
    box.setLine(1, 'bar');
    box.insertLine(1, 'foo');
    screen.render();
  });
  return box;
}

export function createScreen(): B.Widgets.Screen {
  // Create a screen object.
  const screen = blessed.screen({
    smartCSR: true
  });
  return screen;
}


export function createListTable(opts: B.Widgets.ListTableOptions): B.Widgets.ListTableElement {
  const table = blessed.listtable(opts);
  return table;
}

export function text(str: string): B.Widgets.BoxElement {
  const box = blessed.box({
    content: str,
  });
  box
  return box;
}
