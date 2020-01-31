import _ from 'lodash';
import path from "path";
import fs, {} from 'fs-extra';
import stream, { Readable, Transform }  from 'stream';
import through from 'through2';


interface DirStackEntry {
  fullpath: string;
  expanded: boolean;
}

export function dirsteam(root: string): Readable {
  const stack: DirStackEntry[] = [{ fullpath: root, expanded: false }];

  function expand(): DirStackEntry | undefined {
    let top = _.last(stack)
    while ( top && !top.expanded ) {
      const topPath = top.fullpath;
      const dirEntries = fs.readdirSync(top.fullpath, {withFileTypes: true});
      const dirNames = _(dirEntries)
        .filter(e => e.isDirectory())
        .map(e => e.name)
        .sort()
        .reverse()
        .map(e => {
          const fullpath = path.join(topPath, e);
          return {
            fullpath,
            expanded: false
          }
        })
        .value();

      top.expanded = true;
      stack.push(...dirNames);
      top = _.last(stack)
    }
    const next = stack.pop();
    return next;
  }

  const streamOut = new stream.Readable({
    objectMode: true,
    read() {
      const data = expand();
      if (data) {
        this.push(data.fullpath);
        return;
      }
      this.push(null)
    }
  });

  return streamOut;
}

export function stringStreamFilter(test: (p: string) => boolean): Transform {
  return through.obj(
    (chunk: string, _enc: string, next: (err: any, v: string|null) => void) => {
      if (test(chunk)) {
        return next(null, chunk);
      }
      return next(null, null);
    }
  );
}
