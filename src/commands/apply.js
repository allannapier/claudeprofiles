import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import inquirer from 'inquirer';
import { fileExists, commitToGit } from '../utils/helpers.js';
import { Glob } from 'glob';

export async function applyProfile(profileName) {
  if (!profileName) {
    // If no profile name provided, show available profiles
    const profiles = await findLocalProfiles();
    
    if (profiles.length === 0) {
      console.log(chalk.yellow('❌ No profiles found in current directory'));
      console.log(chalk.gray('Generate a profile first:'));
      console.log(chalk.cyan('  claude-profile generate'));
      return;
    }
    
    const { selectedProfile } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedProfile',
      message: 'Which profile would you like to apply?',
      choices: profiles.map(p => ({
        name: `${p.name} (${p.path})`,
        value: p.name
      }))
    }]);
    
    profileName = selectedProfile;
  }
  
  // Find the profile file
  const profilePath = await findProfileFile(profileName);
  
  if (!profilePath) {
    console.log(chalk.red(`❌ Profile "${profileName}" not found`));
    console.log(chalk.gray('Available profiles:'));
    const profiles = await findLocalProfiles();
    profiles.forEach(p => {
      console.log(chalk.cyan(`  ${p.name}`));
    });
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
      console.log(chalk.yellow('Apply cancelled.'));
      return;
    }
  }
  
  try {
    // Copy profile to claude.md
    const content = await fs.readFile(profilePath, 'utf8');
    await fs.writeFile(claudePath, content);
    
    console.log(chalk.green(`✅ Applied profile "${profileName}" to claude.md`));
    
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
    console.error(chalk.red(`Error applying profile: ${error.message}`));
    process.exit(1);
  }
}

async function findLocalProfiles() {
  const glob = new Glob('*.md', { cwd: process.cwd() });
  const files = await glob.walk();
  
  return files
    .filter(file => file !== 'claude.md' && file !== 'README.md' && file !== 'readme.md')
    .map(file => ({
      name: path.basename(file, '.md'),
      path: file
    }));
}

async function findProfileFile(profileName) {
  const possiblePaths = [
    `${profileName}.md`,
    `${profileName.toLowerCase()}.md`,
    `${profileName.replace(/\s+/g, '_')}.md`,
    `${profileName.replace(/\s+/g, '-')}.md`
  ];
  
  for (const filePath of possiblePaths) {
    const fullPath = path.join(process.cwd(), filePath);
    if (await fileExists(fullPath)) {
      return fullPath;
    }
  }
  
  return null;
}