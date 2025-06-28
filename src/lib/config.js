import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.claude-profile');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG = {
  repository: null,
  lastUpdated: null
};

async function ensureConfigDir() {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists or other error
  }
}

export async function getConfig() {
  try {
    await ensureConfigDir();
    const configData = await fs.readFile(CONFIG_FILE, 'utf8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(configData) };
  } catch (error) {
    // Config file doesn't exist, return defaults
    return DEFAULT_CONFIG;
  }
}

export async function saveConfig(updates) {
  try {
    await ensureConfigDir();
    const currentConfig = await getConfig();
    const newConfig = {
      ...currentConfig,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    await fs.writeFile(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
    return newConfig;
  } catch (error) {
    throw new Error(`Failed to save configuration: ${error.message}`);
  }
}

export async function clearConfig() {
  try {
    await fs.unlink(CONFIG_FILE);
  } catch (error) {
    // File doesn't exist, nothing to clear
  }
}