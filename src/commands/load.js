import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import inquirer from 'inquirer';
import { getConfig } from '../lib/config.js';
import { fetchFromGitHub } from '../lib/github.js';
import { fileExists, commitToGit } from '../utils/helpers.js';

export async function loadProfile(profileName) {
  const config = await getConfig();
  
  if (!config.repository) {
    console.log(chalk.red('❌ No repository configured'));
    console.log(chalk.yellow('Run: claude-profile repo <github-url>'));
    return;
  }

  // Check if claude.md already exists
  const claudePath = path.join(process.cwd(), 'claude.md');
  if (await fileExists(claudePath)) {
    const { overwrite } = await inquirer.prompt([{
      type: 'confirm',
      name: 'overwrite',
      message: 'claude.md already exists. Overwrite?',
      default: false
    }]);
    
    if (!overwrite) {
      console.log(chalk.yellow('Load cancelled.'));
      return;
    }
  }

  const spinner = ora(`Loading profile: ${profileName}...`).start();
  
  try {
    const content = await fetchFromGitHub(config.repository, profileName);
    
    await fs.writeFile(claudePath, content);
    spinner.succeed(`Profile loaded: ${profileName}`);
    
    console.log(chalk.green(`✅ Profile "${profileName}" saved to claude.md`));
    
    // Show preview
    const preview = content.split('\n').slice(0, 5).join('\n');
    console.log(chalk.cyan('\n📄 Preview:\n'));
    console.log(preview.split('\n').map(line => `  ${line}`).join('\n'));
    if (content.split('\n').length > 5) {
      console.log(chalk.gray('  ... (truncated for preview)'));
    }
    
    // Ask about Git
    const { commit } = await inquirer.prompt([{
      type: 'confirm',
      name: 'commit',
      message: 'Would you like to commit to Git?',
      default: true
    }]);

    if (commit) {
      await commitToGit(claudePath);
    }
    
  } catch (error) {
    spinner.fail('Failed to load profile');
    console.error(chalk.red(`Error: ${error.message}`));
    
    if (error.message.includes('not found')) {
      console.log(chalk.yellow('\nTips:'));
      console.log(chalk.gray('• Check the profile name spelling'));
      console.log(chalk.gray('• Use: claude-profile list (to see available profiles)'));
      console.log(chalk.gray('• Profile names are case-sensitive'));
    }
    
    process.exit(1);
  }
}