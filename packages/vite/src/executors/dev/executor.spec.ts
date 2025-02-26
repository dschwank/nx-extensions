import { DevExecutorSchema } from './schema';
import executor from './executor';
import { ExecutorContext } from '@nrwl/devkit';

const options: DevExecutorSchema = {};

describe('Dev Executor', () => {
  let context: ExecutorContext;

  beforeEach(async () => {
    const projectName = 'example';
    context = {
      root: '/root',
      cwd: '/root',
      workspace: {
        version: 2,
        projects: {
          [projectName]: {
            root: "/",
            targets: {}
          }
        },
      },
      isVerbose: false,
      projectName: projectName,
      targetName: 'build',
    };
  });

  xit('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
