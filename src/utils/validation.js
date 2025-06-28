export function validateGitHubUrl(url) {
  const githubRegex = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
  return githubRegex.test(url);
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
  return input.trim().replace(/[<>]/g, '');
}