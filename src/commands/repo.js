import { saveConfig } from '../lib/config.js';
import chalk from 'chalk';

export async function setRepo(url) {
  // Validate and sanitize input
  const cleanInput = url.trim();
  
  // Validate GitHub URL
  const githubRegex = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
  
  if (!githubRegex.test(cleanInput)) {
    console.log(chalk.red('❌ Invalid GitHub repository URL'));
    console.log(chalk.yellow('Format: https://github.com/username/repository'));
    console.log(chalk.gray('Example: https://github.com/allannapier/claudeprofiles'));
    return;
  }

  // Clean up URL (remove trailing slash)
  const cleanUrl = cleanInput.replace(/\/$/, '');

  try {
    await saveConfig({ repository: cleanUrl });
    console.log(chalk.green(`✅ Repository set to: ${cleanUrl}`));
    console.log(chalk.gray('\nYou can now use:'));
    console.log(chalk.cyan('  claude-profile list    # List available profiles'));
    console.log(chalk.cyan('  claude-profile load <name>  # Load a profile'));
  } catch (error) {
    console.error(chalk.red(`Failed to save repository: ${error.message}`));
    process.exit(1);
  }
}