import { Command, CommanderError } from 'commander';
import { pathToFileURL } from 'node:url';
import { compileCmd } from './compile.js';
import { inspectCmd } from './inspect.js';
import { symbolsCmd } from './symbols.js';
import { validateCmd } from './validate.js';

export interface CliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export async function runCli(argv: readonly string[]): Promise<CliResult> {
  let result: CliResult = { exitCode: 0, stdout: '', stderr: '' };

  const program = new Command()
    .name('manifest')
    .exitOverride()
    .configureOutput({
      writeOut: (str) => {
        result.stdout += str;
      },
      writeErr: (str) => {
        result.stderr += str;
      },
    });

  const sourceDescription = 'path to the YAML authoring or canonical JSON/TS/JS manifest source';

  program
    .command('validate')
    .requiredOption('--source <path>', sourceDescription)
    .action(async (options: { source: string }) => {
      result = await validateCmd(options.source);
    });

  program
    .command('compile')
    .requiredOption('--source <path>', sourceDescription)
    .requiredOption('--out <path>', 'path to the output protobuf file')
    .action(async (options: { source: string; out: string }) => {
      result = await compileCmd(options.source, options.out);
    });

  program
    .command('inspect')
    .requiredOption('--source <path>', sourceDescription)
    .option('--ids', 'print runtime id tables')
    .action(async (options: { source: string; ids?: boolean }) => {
      result = await inspectCmd(options.source, options.ids ?? false);
    });

  program
    .command('symbols')
    .requiredOption('--source <path>', sourceDescription)
    .requiredOption('--header-out <path>', 'path to the generated header file')
    .requiredOption('--source-out <path>', 'path to the generated source file')
    .action(async (options: { source: string; headerOut: string; sourceOut: string }) => {
      result = await symbolsCmd(options.source, options.headerOut, options.sourceOut);
    });

  try {
    await program.parseAsync(['node', 'manifest', ...argv]);
  } catch (error) {
    if (error instanceof CommanderError) {
      return {
        exitCode: error.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
      };
    }

    const message = error instanceof Error ? error.message : String(error);
    return {
      exitCode: 1,
      stdout: result.stdout,
      stderr: (result.stderr + message + '\n').trim() + '\n',
    };
  }

  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli(process.argv.slice(2)).then((result) => {
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exit(result.exitCode);
  });
}
