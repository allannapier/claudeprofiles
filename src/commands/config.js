import chalk from 'chalk';
import { getConfig } from '../lib/config.js';

export async function showConfig() {
  try {
    const config = await getConfig();
    
    console.log(chalk.cyan('\n📋 Current Configuration:\n'));
    
    if (config.repository) {
      console.log(chalk.green('✅ Repository:'), config.repository);
    } else {
      console.log(chalk.yellow('⚠️  Repository:'), 'Not configured');
      console.log(chalk.gray('   Use: claude-profile repo <github-url>'));
    }
    
    if (config.lastUpdated) {
      const date = new Date(config.lastUpdated).toLocaleString();
      console.log(chalk.blue('🕒 Last Updated:'), date);
    }
    
    if (process.env.GEMINI_API_KEY) {
      const keyPreview = process.env.GEMINI_API_KEY.substring(0, 8) + '...';
      console.log(chalk.green('🔑 Gemini API Key:'), keyPreview);
    } else {
      console.log(chalk.red('❌ Gemini API Key:'), 'Not set');
      console.log(chalk.gray('   Set with: export GEMINI_API_KEY="your-key"'));
    }
    
    console.log();
    
  } catch (error) {
    console.error(chalk.red(`Error reading configuration: ${error.message}`));
    process.exit(1);
  }
}