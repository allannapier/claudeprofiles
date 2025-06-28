# Claude Profile CLI

Generate and manage Claude AI agent profiles using Google's Gemini 2.0 Flash model.

## Features

- 🤖 **AI-Powered Generation**: Uses Gemini 2.0 Flash for iterative rule creation
- 📁 **Profile Management**: Load and save profiles from GitHub repositories  
- 🔄 **Iterative Refinement**: 4-stage AI process for comprehensive rules
- 🎯 **Custom Agent Types**: Generate rules for any type of AI agent
- 📝 **Git Integration**: Automatic commit support
- ⚙️ **Configuration**: Persistent settings and repository management

## Quick Start

### Installation

```bash
npm install -g claude-profile-cli
```

### Setup

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Set your API key:
```bash
export GEMINI_API_KEY="your-key-here"
```

### Generate Your First Profile

```bash
cd your-project
claude-profile generate
```

Follow the prompts to create a custom Claude profile for your project!

## Commands

### Generate a New Profile
```bash
claude-profile generate
```
Creates a new profile file (e.g., `templates/frontend_developer.md`) based on the agent type using AI.

### Apply a Profile
```bash
# Apply a specific profile to claude.md
claude-profile apply frontend_developer

# Interactive selection from available profiles
claude-profile apply
```
Copies a profile to `claude.md` for use with Claude.

### Repository Management
```bash
# Set repository for shared profiles
claude-profile repo https://github.com/username/profiles

# List available profiles
claude-profile list

# Load a specific profile
claude-profile load customer-service
```

### Configuration
```bash
# Show current configuration
claude-profile config
```

## How It Works

The CLI uses a 4-stage AI refinement process:

1. **Initial Generation**: Creates base rules for your agent type
2. **Evaluation**: AI reviews rules for gaps and issues  
3. **Enhancement**: Improves rules based on evaluation
4. **Finalization**: Final polish and formatting

This iterative approach ensures comprehensive, high-quality agent profiles.

## Configuration

Settings are stored in `~/.claude-profile/config.json`:

```json
{
  "repository": "https://github.com/username/profiles",
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

## Profile Repository Structure

For shared profiles, organize your GitHub repository with a `templates` folder:

```
profiles-repo/
├── README.md
└── templates/
    ├── customer-service.md
    ├── code-reviewer.md
    ├── data-analyst/
    │   └── claude.md
    └── writing-assistant/
        └── claude.md
```

The CLI will automatically find profiles in these formats:
- `templates/{name}.md`
- `templates/{name}/claude.md`
- `{name}.md` (fallback for backward compatibility)
- `{name}/claude.md` (fallback for backward compatibility)

## Environment Variables

- `GEMINI_API_KEY` - Required for AI generation

## Examples

### Generate a Frontend Developer Profile
```bash
claude-profile generate
# Enter: "frontend developer"
# Creates: templates/frontend_developer.md

# Apply it to your project
claude-profile apply frontend_developer
# Creates: claude.md
```

### Set Up a Team Repository
```bash
claude-profile repo https://github.com/company/ai-profiles
claude-profile list
claude-profile load support-agent
```

### Check Your Setup
```bash
claude-profile config
```

## Troubleshooting

### Common Issues

**"GEMINI_API_KEY not found"**
- Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Set it: `export GEMINI_API_KEY="your-key"`

**"Repository not found"**
- Ensure the GitHub URL is correct and public
- Format: `https://github.com/username/repository`

**"Profile not found"**
- Check available profiles: `claude-profile list`
- Profile names are case-sensitive

## Development

```bash
# Clone and install
git clone https://github.com/your-username/claude-profile-cli
cd claude-profile-cli
npm install

# Link for local development
npm link

# Run locally
./bin/claude-profile.js generate
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Related Projects

- [Claude Code](https://claude.ai/code) - The official Claude coding interface
- [Claude API](https://docs.anthropic.com/) - Claude's official API documentation

---

*Built with ❤️ for the Claude AI community*