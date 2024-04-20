import { spawn } from "child_process";

export async function execute (command: string, ...args: Array<string>): Promise<void> {
  const proc = spawn(command, args);
  proc.stderr.pipe(process.stderr);
  await new Promise<void>((resolve, reject) => {
    proc.on("close", code => {
      if (code == null || code === 0) {
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}
