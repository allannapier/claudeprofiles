#!/usr/bin/env node

import { Command } from 'commander';
import { generate } from '../src/commands/generate.js';
import { setRepo } from '../src/commands/repo.js';
import { listProfiles } from '../src/commands/list.js';
import { loadProfile } from '../src/commands/load.js';
import { showConfig } from '../src/commands/config.js';
import { applyProfile } from '../src/commands/apply.js';

const program = new Command();

program
  .name('claude-profile')
  .description('Generate and manage Claude AI agent profiles')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate a new Claude profile for current directory')
  .action(generate);

program
  .command('repo <url>')
  .description('Set GitHub repository for loading profiles')
  .action(setRepo);

program
  .command('list')
  .description('List available profiles from repository')
  .action(listProfiles);

program
  .command('load <profile>')
  .description('Load a profile from repository')
  .action(loadProfile);

program
  .command('config')
  .description('Show current configuration')
  .action(showConfig);

program
  .command('apply [profile]')
  .description('Apply a profile to claude.md (interactive if no profile specified)')
  .action(applyProfile);

program.parse();