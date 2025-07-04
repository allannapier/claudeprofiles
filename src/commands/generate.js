import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import { generateInitialRules, evaluateRules, enhanceRules, finalizeRules } from '../lib/gemini.js';
import { formatOutput, fileExists, commitToGit } from '../utils/helpers.js';

export async function generate() {
  // Check for API key
  if (!process.env.GEMINI_API_KEY) {
    console.log(chalk.red('❌ GEMINI_API_KEY not found!'));
    console.log(chalk.yellow('\nTo get an API key:'));
    console.log(chalk.cyan('1. Visit: https://aistudio.google.com/app/apikey'));
    console.log(chalk.cyan('2. Create a new API key'));
    console.log(chalk.cyan('3. Export it: export GEMINI_API_KEY="your-key-here"'));
    process.exit(1);
  }

  // Get agent type from user
  const { agentType } = await inquirer.prompt([{
    type: 'input',
    name: 'agentType',
    message: 'What type of agent do you want rules for?',
    validate: (input) => {
      const trimmed = input.trim();
      if (!trimmed) return 'Please enter an agent type';
      if (trimmed.length < 3) return 'Agent type must be at least 3 characters';
      if (trimmed.length > 100) return 'Agent type must be less than 100 characters';
      return true;
    },
    filter: (input) => input.trim()
  }]);

  // Create filename from agent type
  const profileName = agentType.toLowerCase()
    .replace(/\s+/g, '_')           // Replace spaces with underscores
    .replace(/[^a-z0-9_-]/g, '')    // Remove special characters
    .replace(/_+/g, '_')            // Replace multiple underscores with single
    .replace(/^_|_$/g, '');         // Remove leading/trailing underscores
  
  // Ensure templates directory exists
  const templatesDir = path.join(process.cwd(), 'templates');
  try {
    await fs.mkdir(templatesDir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error(`Warning: Failed to create templates directory: ${error.message}`);
    }
  }
  
  const profilePath = path.join(templatesDir, `${profileName}.md`);
  
  // Check if profile already exists
  if (await fileExists(profilePath)) {
    const { overwrite } = await inquirer.prompt([{
      type: 'confirm',
      name: 'overwrite',
      message: `${profileName}.md already exists. Overwrite?`,
      default: false
    }]);
    
    if (!overwrite) {
      console.log(chalk.yellow('Generation cancelled.'));
      return;
    }
  }

  console.log(chalk.cyan('\n🤖 Generating rules with AI...\n'));

  // Iterative generation process
  const spinner = ora();
  
  try {
    // Step 1: Initial Generation
    spinner.start('Generating initial rules...');
    const initialRules = await generateInitialRules(agentType.trim());
    spinner.succeed('Initial rules generated');
    
    // Step 2: Self-Evaluation
    spinner.start('AI evaluating rules for gaps...');
    const evaluation = await evaluateRules(initialRules);
    spinner.succeed('Evaluation complete');
    
    // Step 3: Enhancement
    spinner.start('Enhancing rules based on evaluation...');
    const enhancedRules = await enhanceRules(initialRules, evaluation);
    spinner.succeed('Rules enhanced');
    
    // Step 4: Final Polish
    spinner.start('Final polish and meta-rules...');
    const finalRules = await finalizeRules(enhancedRules);
    spinner.succeed('Rules finalized');

    // Display final rules preview
    console.log(chalk.green('\n✨ Generated Rules Preview:\n'));
    const preview = finalRules.split('\n').slice(0, 10).join('\n');
    console.log(formatOutput(preview));
    if (finalRules.split('\n').length > 10) {
      console.log(chalk.gray('  ... (truncated for preview)\n'));
    }

    // Ask to save
    const { save } = await inquirer.prompt([{
      type: 'confirm',
      name: 'save',
      message: `Save these rules to templates/${profileName}.md?`,
      default: true
    }]);

    if (save) {
      await fs.writeFile(profilePath, finalRules);
      console.log(chalk.green(`\n✅ Rules saved to ${profilePath}`));
      
      // Ask about Git
      const { commit } = await inquirer.prompt([{
        type: 'confirm',
        name: 'commit',
        message: 'Would you like to commit to Git?',
        default: true
      }]);

      if (commit) {
        await commitToGit(profilePath);
      }
    }

  } catch (error) {
    spinner.fail('Generation failed');
    console.error(chalk.red(`Error: ${error.message}`));
    
    if (error.message.includes('API_KEY')) {
      console.log(chalk.yellow('\nPlease check your GEMINI_API_KEY is valid.'));
    }
    
    process.exit(1);
  }
}