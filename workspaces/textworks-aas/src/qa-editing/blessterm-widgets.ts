// @ts-nocheck

/**
  * Note: Type checking is turned off in this file because neo-blessed/neo-blessed-contrib don't have
  * typescript .d.ts files available. When they do, the ts-nocheck should be turned off.
 */
import _ from "lodash";
import B from 'blessed';
import blessed from 'neo-blessed';
// import NB from 'neo-blessed';
// import nbc from 'neo-blessed-contrib';

export function textDivBox(content: string | StyledText): B.Widgets.BoxElement {
  const c = _.isString(content) ? content : content.render();
  const b = blessed.box({
    tags: true,
    width: '100%',
    height: 1,
  });
  b.setContent(c);
  return b;
}

export function appFrame(): B.Widgets.BoxElement {
  const box = blessed.box({
    width: '100%',
    height: '100%',
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

export function createCheckBox(opts: B.Widgets.CheckboxOptions): B.Widgets.CheckboxElement {
  return blessed.checkbox(opts);
}

export function createLayout(opts: B.Widgets.LayoutOptions): B.Widgets.LayoutElement {
  return blessed.layout(opts);
}

const defaultIndicators = [
  '○',
  '✓',
  '✗',
  '⚑',
  '●',
];

export function createRadios(
  setOpts: B.Widgets.RadioSetOptions,
  buttonOpts: B.Widgets.RadioButtonOptions[]
): [B.Widgets.RadioSetElement, B.Widgets.RadioButtonElement[]] {
  const radioSet = blessed.radioset(setOpts);

  let currLeft = 0;
  const buttons = _.map(buttonOpts, (o, bi) => {
    const radio = blessed.radiobutton(o);
    radio.left = currLeft;
    const isFirst = bi === 0;
    const prefix = " ";
    const suffix = " ";

    currLeft += prefix.length + suffix.length + 1;

    if (isFirst) {
      radio.checked = true;
    }

    // Override the default rendering
    radio.render = function() {
      this.clearPos(true);
      // const indicator = this.checked? defaultIndicators[bi] : ' ';
      const indicator = defaultIndicators[bi];
      const content = `${prefix}${indicator}${suffix}`;
      const isChecked = this.checked;

      this.style.fg =  isChecked? '#ffffff' : '#343434';
      this.style.bg =  isChecked? '#0000ff' : '#442222';
      this.style.bold = isChecked;

      this.setContent(content, /* no-clear= */false, /* no-tags= */true);
      return this._render();
    }

    radioSet.append(radio);
    return radio;
  });




  return [radioSet, buttons];
}

export function createForm(opts: B.Widgets.FormOptions): B.Widgets.FormElement {
  // submit.on('press', function() {
  //   form.submit();
  // });

  // cancel.on('press', function() {
  //   form.reset();
  // });

  // form.on('submit', function(data) {
  //   form.setContent('Submitted.');
  //   screen.render();
  // });

  // form.on('reset', function(data) {
  //   form.setContent('Canceled.');
  //   screen.render();
  // });

  return blessed.form(opts);
}
