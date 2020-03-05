import _ from "lodash";

import fs from "fs-extra";
import path from "path";

import { Argv, Arguments, Options } from "yargs";

export type ArgvApp = (ya: Argv) => Argv;

export function config(...fs: ArgvApp[]): ArgvApp {
  return ya => _.reduce(fs, (acc, f) => f(acc), ya);
}

function resolveArgPath(argv: Arguments, pathkey: string): string | undefined {
  if (typeof argv[pathkey] !== "string") {
    return;
  }

  let pathvalue = argv[pathkey] as string;

  if (!path.isAbsolute(pathvalue)) {
    const wd = argv.cwd;
    if (typeof wd === "string") {
      pathvalue = path.resolve(wd, pathvalue);
    } else {
      pathvalue = path.resolve(pathvalue);
    }
  }
  pathvalue = path.normalize(pathvalue);
  const ccKey = _.camelCase(pathkey);

  argv[pathkey] = pathvalue;
  argv[ccKey] = pathvalue;

  return pathvalue;
}

export const setCwd = (ya: Argv) =>
  ya.option("cwd", {
    describe: "set working directory",
    normalize: true,
    type: "string",
    requiresArg: true,
  });

const optAndDesc = (optAndDesc: string, ext?: Options) => (ya: Argv) => {
  const [optname, desc] = optAndDesc.includes(":")
    ? optAndDesc.split(":").map(o => o.trim())
    : [optAndDesc, ""];

  const opts = ext || {};
  if (desc.length > 0) {
    opts.description = desc;
  }

  return ya.option(optname, opts);
};

const existingPath = (pathAndDesc: string) => (ya: Argv) => {
  let [pathname, desc] = pathAndDesc.includes(":")
    ? pathAndDesc.split(":")
    : [pathAndDesc, `directory ${pathAndDesc}`];

  pathname = pathname.trim();
  desc = desc.trim();
  ya.option(pathname, {
    describe: desc,
    type: "string",
    requiresArg: true,
  });

  ya.middleware((argv: Arguments) => {
    const p = resolveArgPath(argv, pathname);
    if (p && fs.existsSync(p)) {
      return argv;
    }
    _.update(argv, ['errors'], (prev: string[]|undefined|null) => {
      const newval = prev || [];
      return _.concat(newval, [`--${pathname}: ${p} doesn't exist`]);
    });
    return argv;
  }, /* applyBeforeValidation= */ true);

  return ya;
};

export const existingDir = (dirAndDesc: string) => {
  return existingPath(dirAndDesc);
};

export const existingFile = (fileAndDesc: string) => {
  return existingPath(fileAndDesc);
};

export const configFile = (ya: Argv) => {
  ya.option("config", {
    describe: "optional path to configuration file",
    type: "string",
    requiresArg: true,
  });

  ya.middleware((argv: Arguments) => {
    if (typeof argv.config === "string") {
      const configFile = resolveArgPath(argv, "config");
      if (!configFile) {
        throw new Error(`Non-existent config file specified`);
      }
      // Set working directory to config file dir if not already set
      if (!argv["cwd"]) {
        argv["cwd"] = path.dirname(configFile);
      }
      const buf = fs.readFileSync(configFile);
      const conf = JSON.parse(buf.toString());
      const confKVs = _.toPairs(conf);
      _.each(confKVs, ([k, v]) => {
        argv[k] = v;
      });
      return argv;
    }
    return argv;
  }, /* applyBeforeValidation= */ true);

  return ya;
};

export const setOpt = (ya: Argv) => {
  return ya.option;
};

// opt.dir.(exists|parentExists|ancestorExists)
export const opt = {
  config: configFile,
  existingDir,
  existingFile,
  obj: setOpt,
  dir: existingDir,
  file: existingFile,
  cwd: setCwd,
  ion: optAndDesc,
};