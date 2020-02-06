import _ from "lodash";

import fs from "fs-extra";
import path from "path";

import {Argv, Arguments} from "yargs";
import {prettyPrint} from "~/util/pretty-print";

type ArgvApp = (ya: Argv) => Argv;

export function yall(ya: Argv, fs: ArgvApp[]): Argv {
  return _.reduce(fs, (acc, f) => f(acc), ya);
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
  argv[pathkey] = pathvalue;
  return pathvalue;
}

export const setCwd = (ya: Argv) =>
  ya.option("cwd", {
    describe: "set working directory",
    normalize: true,
    type: "string",
    requiresArg: true,
  });

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
    console.log(`option ${pathname} specified non-existent file ${p}`);
    return ya.check(() => {
      return false;
    });
  }, true);

  return ya;
};

export const existingDir = (dirAndDesc: string) => {
  return existingPath(dirAndDesc);
};

export const existingFile = (fileAndDesc: string) => {
  return existingPath(fileAndDesc);
};

export const config = (ya: Argv) => {
  ya.option("config", {
    describe: "optional path to configuration file",
    type: "string",
    requiresArg: true,
  });

  ya.middleware((argv: Arguments) => {
    console.log("running middleware config");
    if (typeof argv.config === "string") {
      const configFile = resolveArgPath(argv, "config");
      console.log(`resolved config to ${configFile}`);
      if (!configFile) {
        throw new Error(`Non-existent config file specified`);
      }
      // Set working directory to config file dir if not already set
      if (!argv["cwd"]) {
        argv["cwd"] = path.dirname(configFile);
        console.log(`resolved cwd in config to ${argv.cwd}`);
      }
      const buf = fs.readFileSync(configFile);
      const conf = JSON.parse(buf.toString());
      prettyPrint({msg: "config file", conf});
      const confKVs = _.toPairs(conf);
      _.each(confKVs, ([k, v]) => {
        argv[k] = v;
      });
      return argv;
    }
    return argv;
  }, true);

  return ya;
};

export const setOpt = (ya: Argv) => {
  ya.option;
};

export const opt = {
  setCwd,
  config,
  existingDir,
  existingFile,
  obj: setOpt,
};

// const configPath = findUp.sync(configFile, {
//   cwd: process.cwd(),
//   type: 'file',
//   allowSymlinks: true
// });

/**
   Options:
   alias                     // string or array of strings, alias(es) for the canonical option key, see alias()
   array                     // boolean, interpret option as an array, see array()
   boolean                   // boolean, interpret option as a boolean flag, see boolean()
   choices                   // value or array of values, limit valid option arguments to a predefined set, see choices()
   coerce                    // function, coerce or transform parsed command line values into another value, see coerce()
   config                    // boolean, interpret option as a path to a JSON config file, see config()
   configParser              // function, provide a custom config parsing function, see config()
   conflicts                 // string or array of strings, require certain keys not to be set, see conflicts()
   count                     // boolean, interpret option as a count of boolean flags, see count()
   default                   // value, set a default value for the option, see default()
   defaultDescription        // string, use this description for the default value in help content, see default()
   demandOption              // boolean or string, demand the option be given, with optional error message, see demandOption()
   desc/describe/description // string, the option description for help content, see describe()
   global                    // boolean, indicate that this key should not be reset when a command is invoked, see global()
   group                     // string, when displaying usage instructions place the option under an alternative group heading, see group()
   hidden                    // don’t display option in help output.
   implies                   // string or array of strings, require certain keys to be set, see implies()
   nargs                     // number, specify how many arguments should be consumed for the option, see nargs()
   normalize: true,                 // boolean, apply path.normalize() to the option, see normalize()
   number                    // boolean, interpret option as a number, number()
   requiresArg               // boolean, require the option be specified with a value, see requiresArg()
   skipValidation: false,    // boolean, skips validation if the option is present, see skipValidation()
   string: true,             // boolean, interpret option as a string, see string()
   type: 'array'             // | 'boolean' | 'count'| 'number' |'string'
*/
