export function validateGitHubUrl(url) {
  // More restrictive and comprehensive GitHub URL validation
  const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/?$/;
  
  if (!githubRegex.test(url)) {
    return false;
  }
  
  // Additional validation for edge cases
  const parts = url.replace('https://github.com/', '').replace(/\/$/, '').split('/');
  if (parts.length !== 2) {
    return false;
  }
  
  const [owner, repo] = parts;
  
  // GitHub username/org name validation
  if (owner.length < 1 || owner.length > 39 || owner.startsWith('.') || owner.endsWith('.') || owner.includes('..')) {
    return false;
  }
  
  // GitHub repository name validation
  if (repo.length < 1 || repo.length > 100 || repo.startsWith('.') || repo.endsWith('.') || repo.includes('..')) {
    return false;
  }
  
  return true;
}

export function validateAgentType(input) {
  const trimmed = input.trim();
  if (!trimmed) {
    return 'Please enter an agent type';
  }
  if (trimmed.length < 3) {
    return 'Agent type must be at least 3 characters';
  }
  if (trimmed.length > 100) {
    return 'Agent type must be less than 100 characters';
  }
  return true;
}

export function validateProfileName(name) {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Please enter a profile name';
  }
  if (!/^[a-zA-Z0-9-_]+$/.test(trimmed)) {
    return 'Profile name can only contain letters, numbers, hyphens, and underscores';
  }
  return true;
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    // Remove HTML/XML tags and potentially dangerous characters
    .replace(/<[^>]*>/g, '')
    // Remove script-related patterns
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Remove control characters and other potentially dangerous sequences
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    // Remove null bytes and other dangerous characters
    .replace(/\0/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}