import chalk from 'chalk';
import ora from 'ora';
import { getConfig } from '../lib/config.js';
import { listGitHubProfiles } from '../lib/github.js';

export async function listProfiles() {
  const config = await getConfig();
  
  if (!config.repository) {
    console.log(chalk.red('❌ No repository configured'));
    console.log(chalk.yellow('Set a repository first:'));
    console.log(chalk.cyan('  claude-profile repo https://github.com/username/repository'));
    return;
  }
  
  const spinner = ora('Fetching profiles from repository...').start();
  
  try {
    const profiles = await listGitHubProfiles(config.repository);
    spinner.stop();
    
    if (profiles.length === 0) {
      console.log(chalk.yellow('\n📂 No profiles found in repository'));
      console.log(chalk.gray('Repository:'), config.repository);
      return;
    }
    
    console.log(chalk.cyan(`\n📂 Available Profiles (${profiles.length}):\n`));
    
    profiles.forEach(profile => {
      const icon = profile.type === 'file' ? '📄' : '📁';
      console.log(chalk.green(`${icon} ${profile.name}`));
      console.log(chalk.gray(`   Path: ${profile.path}`));
      console.log();
    });
    
    console.log(chalk.gray('Repository:'), config.repository);
    console.log(chalk.gray('\nTo load a profile:'));
    console.log(chalk.cyan('  claude-profile load <profile-name>'));
    
  } catch (error) {
    spinner.fail('Failed to fetch profiles');
    console.error(chalk.red(`Error: ${error.message}`));
    
    if (error.message.includes('not found')) {
      console.log(chalk.yellow('\nTips:'));
      console.log(chalk.gray('• Make sure the repository URL is correct'));
      console.log(chalk.gray('• Check that the repository is public'));
      console.log(chalk.gray('• Verify the repository exists'));
    }
    
    process.exit(1);
  }
}