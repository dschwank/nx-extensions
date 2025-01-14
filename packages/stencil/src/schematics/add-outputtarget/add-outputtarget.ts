import { chain, noop, Rule, Tree } from '@angular-devkit/schematics';
import { formatFiles, getWorkspacePath, readJsonInTree } from '@nrwl/workspace';
import { prepareVueLibrary } from './lib/vue';
import { prepareReactLibrary } from './lib/react';
import { prepareAngularLibrary } from './lib/angular';
import { addToOutputTargetToConfig, OutputTargetType } from './lib/add-outputtarget-to-config';
import { stripIndents } from '@angular-devkit/core/src/utils/literals';
import { wrapAngularDevkitSchematic } from '@nrwl/devkit/ngcli-adapter';
import { logger } from '@nrwl/devkit';

export interface AddOutputtargetSchematicSchema {
  projectName: string;
  outputType: OutputTargetType;
  publishable: boolean;
}

export function isStencilProjectBuilder(
  project: any,
  builderCommand: string
): boolean {
  const buildArchitect =
    project.architect && project.architect[builderCommand]
      ? project.architect[builderCommand]
      : {};
  return (
    buildArchitect &&
    buildArchitect.builder === `@nxext/stencil:${builderCommand}`
  );
}

function checkBuildable(options: AddOutputtargetSchematicSchema): Rule {
  return (tree: Tree) => {
    const workspaceJson = readJsonInTree(tree, getWorkspacePath(tree));
    const project = workspaceJson.projects[options.projectName];

    if (isStencilProjectBuilder(project, 'build')) {
      return chain([
        options.outputType === 'react' ? prepareReactLibrary(options) : noop(),
        options.outputType === 'angular'
          ? prepareAngularLibrary(options)
          : noop(),
        options.outputType === 'vue' ? prepareVueLibrary(options) : noop(),
        addToOutputTargetToConfig(options.projectName, options.outputType),
        formatFiles(),
      ]);
    } else {
      logger.info(stripIndents`
          Please use a buildable library for custom outputtargets

          You could make this library buildable with:

          nx generate @nxext/stencil:make-lib-buildable ${options.projectName}
          or
          ng generate @nxext/stencil:make-lib-buildable ${options.projectName}
        `);
      return noop();
    }
  };
}

export function outputtargetSchematic(options: AddOutputtargetSchematicSchema): Rule {
  return checkBuildable(options);
}

export default outputtargetSchematic;
export const outputtargetGenerator = wrapAngularDevkitSchematic(
  '@nxext/stencil',
  'add-outputtarget'
);
