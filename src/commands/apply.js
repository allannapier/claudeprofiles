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
      console.log(chalk.yellow('❌ No profiles found in templates/ directory'));
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
  const profiles = [];
  
  // Check templates folder first
  const templatesDir = path.join(process.cwd(), 'templates');
  try {
    const templatesGlob = new Glob('*.md', { cwd: templatesDir });
    const templateFiles = await templatesGlob.walk();
    
    templateFiles.forEach(file => {
      if (file !== 'README.md' && file !== 'readme.md') {
        profiles.push({
          name: path.basename(file, '.md'),
          path: `templates/${file}`
        });
      }
    });
  } catch (error) {
    // Templates folder doesn't exist
  }
  
  // Fallback to root directory if no templates found
  if (profiles.length === 0) {
    const glob = new Glob('*.md', { cwd: process.cwd() });
    const files = await glob.walk();
    
    files
      .filter(file => file !== 'claude.md' && file !== 'README.md' && file !== 'readme.md')
      .forEach(file => {
        profiles.push({
          name: path.basename(file, '.md'),
          path: file
        });
      });
  }
  
  return profiles;
}

async function findProfileFile(profileName) {
  const possiblePaths = [
    // Templates folder first
    `templates/${profileName}.md`,
    `templates/${profileName.toLowerCase()}.md`,
    `templates/${profileName.replace(/\s+/g, '_')}.md`,
    `templates/${profileName.replace(/\s+/g, '-')}.md`,
    // Fallback to root
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