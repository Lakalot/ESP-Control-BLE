import { Command } from 'commander';
import { pathToFileURL } from 'node:url';
import { compileCmd } from './compile.js';
import { inspectCmd } from './inspect.js';
import { validateCmd } from './validate.js';

export interface CliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export async function runCli(argv: readonly string[]): Promise<CliResult> {
  let result: CliResult = { exitCode: 0, stdout: '', stderr: '' };

  const program = new Command().name('manifest-v5').exitOverride();

  program
    .command('validate')
    .requiredOption('--source <path>', 'path to the TS/JS manifest source')
    .action(async (options: { source: string }) => {
      result = await validateCmd(options.source);
    });

  program
    .command('compile')
    .requiredOption('--source <path>', 'path to the TS/JS manifest source')
    .requiredOption('--out <path>', 'path to the output protobuf file')
    .action(async (options: { source: string; out: string }) => {
      result = await compileCmd(options.source, options.out);
    });

  program
    .command('inspect')
    .requiredOption('--source <path>', 'path to the TS/JS manifest source')
    .option('--ids', 'print runtime id tables')
    .action(async (options: { source: string }) => {
      result = await inspectCmd(options.source, argv.includes('--ids'));
    });

  try {
    await program.parseAsync(['node', 'manifest-v5', ...argv]);
  } catch (error) {
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
