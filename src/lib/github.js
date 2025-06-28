import fetch from 'node-fetch';

export async function fetchFromGitHub(repoUrl, profileName) {
  // Extract owner and repo from URL
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub repository URL');
  }
  
  const [, owner, repo] = match;
  
  // Try different possible file extensions and paths in templates folder
  const possiblePaths = [
    `templates/${profileName}.md`,
    `templates/${profileName}/claude.md`,
    `templates/${profileName.toLowerCase()}.md`,
    `templates/${profileName.toLowerCase()}/claude.md`,
    // Fallback to root for backward compatibility
    `${profileName}.md`,
    `${profileName}/claude.md`
  ];
  
  for (const filePath of possiblePaths) {
    try {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/${filePath}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const content = await response.text();
        if (content.trim()) {
          return content;
        }
      }
    } catch (error) {
      // Continue to next path
    }
  }
  
  throw new Error(`Profile "${profileName}" not found in repository`);
}

export async function listGitHubProfiles(repoUrl) {
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub repository URL');
  }
  
  const [, owner, repo] = match;
  
  try {
    // Get templates folder contents first
    const templatesUrl = `https://api.github.com/repos/${owner}/${repo}/contents/templates`;
    const templatesResponse = await fetch(templatesUrl);
    const profiles = [];
    
    if (templatesResponse.ok) {
      const templatesContents = await templatesResponse.json();
      
      // Look for .md files and directories in templates folder
      for (const item of templatesContents) {
        if (item.type === 'file' && item.name.endsWith('.md')) {
          const profileName = item.name.replace('.md', '');
          if (profileName !== 'README' && profileName !== 'readme') {
            profiles.push({
              name: profileName,
              type: 'file',
              path: `templates/${item.name}`
            });
          }
        } else if (item.type === 'dir') {
          // Check if directory contains claude.md
          try {
            const dirUrl = `https://api.github.com/repos/${owner}/${repo}/contents/templates/${item.name}`;
            const dirResponse = await fetch(dirUrl);
            if (dirResponse.ok) {
              const dirContents = await dirResponse.json();
              const hasClaudeMd = dirContents.some(file => 
                file.name === 'claude.md' && file.type === 'file'
              );
              if (hasClaudeMd) {
                profiles.push({
                  name: item.name,
                  type: 'directory',
                  path: `templates/${item.name}/claude.md`
                });
              }
            }
          } catch (error) {
            // Skip this directory
          }
        }
      }
    }
    
    // If no templates folder or no profiles found, fallback to root
    if (profiles.length === 0) {
      const rootUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
      const rootResponse = await fetch(rootUrl);
      
      if (!rootResponse.ok) {
        if (rootResponse.status === 404) {
          throw new Error('Repository not found or not accessible');
        }
        throw new Error(`GitHub API error: ${rootResponse.status}`);
      }
      
      const rootContents = await rootResponse.json();
      
      // Look for .md files and directories in root
      for (const item of rootContents) {
        if (item.type === 'file' && item.name.endsWith('.md')) {
          const profileName = item.name.replace('.md', '');
          if (profileName !== 'README' && profileName !== 'readme') {
            profiles.push({
              name: profileName,
              type: 'file',
              path: item.name
            });
          }
        } else if (item.type === 'dir' && item.name !== 'templates') {
          // Check if directory contains claude.md
          try {
            const dirUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${item.name}`;
            const dirResponse = await fetch(dirUrl);
            if (dirResponse.ok) {
              const dirContents = await dirResponse.json();
              const hasClaudeMd = dirContents.some(file => 
                file.name === 'claude.md' && file.type === 'file'
              );
              if (hasClaudeMd) {
                profiles.push({
                  name: item.name,
                  type: 'directory',
                  path: `${item.name}/claude.md`
                });
              }
            }
          } catch (error) {
            // Skip this directory
          }
        }
      }
    }
    
    return profiles;
    
  } catch (error) {
    if (error.message.includes('GitHub API')) {
      throw error;
    }
    throw new Error(`Failed to list profiles: ${error.message}`);
  }
}