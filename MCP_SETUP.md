# MCP (Model Context Protocol) Setup for Victory Center

This guide explains how to set up the Model Context Protocol (MCP) for both Claude Code and GitHub Copilot in the Victory Center project.

## What is MCP?

**Model Context Protocol (MCP)** is an open standard that enables AI assistants to connect to external tools, databases, and APIs. It allows Claude Code and GitHub Copilot to:
- Access GitHub repositories
- Manage issues and pull requests
- Search code across the project
- Query databases
- Integrate with external services

## Prerequisites

- **Claude Code CLI** installed (for Claude setup)
- **VS Code** with GitHub Copilot extension (for Copilot setup)
- **GitHub Personal Access Token** or OAuth authentication
- **Node.js** (for MCP servers)

---

## Setup of Github MCP for Claude Code

### Method 1: Quick CLI Setup (Recommended)

```bash
# Add GitHub MCP server
claude mcp add github --scope user

# Verify installation
claude mcp list

# Restart Claude Code
# Then run: /mcp
# Select GitHub → Authenticate
```

### Method 2: Manual Configuration

1. **Locate your config file**:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. **Add your GitHub token**:
   - Create a token at https://github.com/settings/tokens
   - Permissions needed: `repo`, `read:org`, `read:user`
   - Add to config file (see template below)

4. **Restart Claude Code**

### Configuration Template

Use the template from [`claude-mcp-config.example.json`](claude-mcp-config.example.json). The configuration differs by platform:

#### Linux / macOS Configuration

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "github-mcp", "stdio"],
      "env": {
        "GITHUB_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

**Quick setup for macOS**:
```bash
# Create config directory if it doesn't exist
mkdir -p ~/Library/Application\ Support/Claude

# Create config file (then edit to add your token)
cat > ~/Library/Application\ Support/Claude/claude_desktop_config.json << 'EOF'
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "github-mcp", "stdio"],
      "env": {
        "GITHUB_ACCESS_TOKEN": "ghp_YOUR_TOKEN_HERE"
      }
    }
  }
}
EOF
```

**Quick setup for Linux**:
```bash
# Create config directory if it doesn't exist
mkdir -p ~/.config/Claude

# Create config file (then edit to add your token)
cat > ~/.config/Claude/claude_desktop_config.json << 'EOF'
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "github-mcp", "stdio"],
      "env": {
        "GITHUB_ACCESS_TOKEN": "ghp_YOUR_TOKEN_HERE"
      }
    }
  }
}
EOF
```

#### Windows Configuration

**Option 1: Using cmd wrapper**
```json
{
  "mcpServers": {
    "github": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "github-mcp", "stdio"],
      "env": {
        "GITHUB_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

**Option 2: Using full path (RECOMMENDED for Windows)**
```json
{
  "mcpServers": {
    "github": {
      "command": "C:\\Program Files\\nodejs\\npx.cmd",
      "args": ["-y", "github-mcp", "stdio"],
      "env": {
        "GITHUB_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

**Windows setup via PowerShell**:
```powershell
# Navigate to Claude config directory
cd $env:APPDATA\Claude

# Create/edit claude_desktop_config.json
# Use Option 2 (full path) for best reliability on Windows
notepad claude_desktop_config.json
```

> **Important for Windows users**: Windows cannot directly execute `npx` commands in MCP configurations. You MUST use either the `cmd /c` wrapper or the full path to `npx.cmd`. The full path approach is more reliable.

### Testing Claude MCP

In Claude Code, try:
```
/mcp

List recent issues in the Victory Center repository
```

Or:
```
Show me the latest commits in this repository
```

---

## Setup for GitHub Copilot

### Method 1: Remote MCP Server (No Setup Required)

GitHub Copilot in VS Code has **built-in access** to the GitHub MCP server remotely. No configuration needed!

**Usage**:
```
# In Copilot Chat (Ctrl+Alt+I or Cmd+Alt+I)
@github list recent pull requests

@github create an issue titled "Add MCP documentation"

@github search for authentication code in this repository
```

### Testing Copilot MCP

In VS Code Copilot Chat:
```
@github show me open issues in this repository

@github what are the latest commits on the main branch?
```

---

## Available MCP Capabilities

### GitHub Operations

| Operation | Example Command (Claude) | Example Command (Copilot) |
|-----------|--------------------------|---------------------------|
| **List Issues** | `/mcp list open issues` | `@github list open issues` |
| **Create Issue** | `/mcp create issue titled "Bug fix"` | `@github create issue "Bug fix"` |
| **Search Code** | `/mcp search for "authentication"` | `@github search "authentication"` |
| **List PRs** | `/mcp list pull requests` | `@github list pull requests` |
| **Get File** | `/mcp get contents of CLAUDE.md` | `@github show CLAUDE.md` |
| **List Commits** | `/mcp show recent commits` | `@github list recent commits` |

### Repository Operations

- **Clone/Fork**: Create repository copies
- **Branches**: List, create, switch branches
- **Files**: Read, create, update file contents
- **Commits**: View history, create commits
- **Search**: Code search across repository

### Issue Management

- **Create**: New issues with labels, assignees
- **Update**: Modify issue details
- **Comment**: Add comments to issues
- **Close/Reopen**: Change issue status
- **Search**: Find issues by query

### Pull Request Management

- **Create**: New PRs with description
- **Update**: Modify PR details
- **Review**: Add review comments
- **Merge**: Merge pull requests
- **Status**: Check CI/CD status

---

## Authentication

### Option 1: OAuth (Recommended)

**For Claude Code**:
1. Run `/mcp` in Claude Code
2. Select "GitHub" → "Authenticate"
3. Follow browser OAuth flow
4. Grant permissions

**For Copilot**:
- Already authenticated via GitHub account in VS Code
- No additional setup needed

### Option 2: Personal Access Token

**Create Token**:
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:org` (Read org data)
   - ✅ `read:user` (Read user profile)
   - ✅ `workflow` (Update GitHub Action workflows) - optional
4. Generate token
5. Copy token (you won't see it again!)

**Add to Claude Config**:
```json
{
  "mcpServers": {
    "github": {
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

---

## Platform Comparison

| Platform | Config Location | Command | Args | Notes |
|----------|----------------|---------|------|-------|
| **macOS** | `~/Library/Application Support/Claude/claude_desktop_config.json` | `"npx"` | `["-y", "github-mcp", "stdio"]` | Direct npx works ✅ |
| **Linux** | `~/.config/Claude/claude_desktop_config.json` | `"npx"` | `["-y", "github-mcp", "stdio"]` | Direct npx works ✅ |
| **Windows** (Option 1) | `%APPDATA%\Claude\claude_desktop_config.json` | `"cmd"` | `["/c", "npx", "-y", "github-mcp", "stdio"]` | Requires cmd wrapper ⚠️ |
| **Windows** (Option 2) | `%APPDATA%\Claude\claude_desktop_config.json` | `"C:\\Program Files\\nodejs\\npx.cmd"` | `["-y", "github-mcp", "stdio"]` | Full path - RECOMMENDED ✅ |

### Why Windows is Different

Windows requires special handling because:
- The Windows shell cannot directly execute `npx` commands in subprocess contexts
- MCP servers need either the `cmd /c` wrapper or the full path to `npx.cmd`
- Using the full path (`C:\\Program Files\\nodejs\\npx.cmd`) is more reliable and faster
- The `stdio` transport argument is required for proper communication

### Quick Platform Detection

**Are you on Windows?**
- If yes → Use full path to `npx.cmd` (Option 2 recommended)
- If no (macOS/Linux) → Use direct `npx` command

---

## Troubleshooting

### Claude Code

**Issue**: MCP server not found
```bash
# Check if server is installed
claude mcp list

# Reinstall server
claude mcp remove github
claude mcp add github --scope user
```

**Issue**: Authentication failed
- Check token permissions
- Regenerate token if expired
- Verify token in config file

**Issue**: Commands not working
- Restart Claude Code
- Check MCP server status with `/mcp`
- View logs: `claude mcp logs github`

**Issue (Windows)**: "No MCP servers configured" or "Connection closed"
- **Cause**: Windows cannot execute `npx` directly without wrapper
- **Solution**: Update your config to use either:
  - Full path: `"command": "C:\\Program Files\\nodejs\\npx.cmd"`
  - Or cmd wrapper: `"command": "cmd", "args": ["/c", "npx", ...]`
- **Verify**: Run `claude mcp list` to see if server shows as "✓ Connected"

**Issue (Windows)**: "server-github not found" or deprecated package warning
- **Cause**: Old package name `@modelcontextprotocol/server-github` is deprecated
- **Solution**: Use new package name `github-mcp` in args
- **Update**: Change args from `["-y", "@modelcontextprotocol/server-github"]` to `["-y", "github-mcp", "stdio"]`

**Issue**: npx.cmd location different from default
- **Find your npx location**: Run `where npx` in Command Prompt
- **Update config**: Use the actual path shown (e.g., `C:\\custom\\path\\npx.cmd`)

### GitHub Copilot

**Issue**: @github not recognized
- Ensure Copilot extension is up to date
- Reload VS Code window (Ctrl+R)
- Check Copilot subscription is active

**Issue**: Permission denied
- Re-authenticate GitHub in VS Code
- Check GitHub account has repo access
- Verify organization permissions

---

## Security Best Practices

### Token Security

❌ **DON'T**:
- Commit tokens to git
- Share tokens with others
- Use tokens with excessive permissions
- Store tokens in plain text files in project

✅ **DO**:
- Use environment variables
- Rotate tokens regularly (every 90 days)
- Use minimal required scopes
- Revoke unused tokens
- Use OAuth when possible

### Config File Security

**Use environment variables**:
```bash
# In your shell profile (~/.bashrc, ~/.zshrc)
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_your_token"

# Reference in config
"env": {
  "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
}
```

---

## Useful MCP Commands

### Claude Code

```bash
# List all MCP servers
claude mcp list

# Add a server
claude mcp add <name> [options]

# Remove a server
claude mcp remove <name>

# View server logs
claude mcp logs <name>

# Test server
claude mcp test <name>
```

### In Claude Code Chat

```
/mcp                          # Open MCP manager
/mcp list                     # List available servers
/mcp help                     # Show MCP help
```

---

## Resources

### Official Documentation
- [MCP Introduction - Anthropic](https://www.anthropic.com/news/model-context-protocol)
- [Claude Code MCP Docs](https://code.claude.com/docs/en/mcp)
- [GitHub Copilot MCP Docs](https://docs.github.com/en/copilot/concepts/context/mcp)
- [Model Context Protocol Spec](https://github.com/modelcontextprotocol)

### GitHub MCP Server
- [Official GitHub MCP Server](https://github.com/github/github-mcp-server)
- [Installation Guide for Claude](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-claude.md)
- [GitHub MCP npm package](https://www.npmjs.com/package/github-mcp)

### Platform-Specific Guides
- [Windows MCP Setup Guide](https://github.com/BunPrinceton/claude-mcp-windows-guide)
- [MCP Configuration Guide](https://mcpcat.io/guides/adding-an-mcp-server-to-claude-code/)
- [Configuring MCP Tools in Claude Code](https://scottspence.com/posts/configuring-mcp-tools-in-claude-code)

### Community Resources
- [MCP Servers Collection](https://github.com/modelcontextprotocol/servers)
- [Awesome MCP](https://github.com/punkpeye/awesome-mcp)
- [MCPcat - MCP Server Registry](https://mcpcat.io/)
- [Connect to Local MCP Servers](https://modelcontextprotocol.io/docs/develop/connect-local-servers)

---

## Next Steps

1. ✅ Choose authentication method (OAuth or Token)
2. ✅ Configure Claude Code MCP
3. ✅ Test GitHub operations in Claude
4. ✅ Use Copilot's built-in @github
5. ✅ Explore advanced MCP capabilities
6. 📚 Read [MCP Best Practices](https://code.claude.com/docs/en/mcp-best-practices)

---

**Questions?** See the [FAQ](#faq) or ask in [GitHub Discussions](https://github.com/ita-social-projects/VictoryCenter-Client/discussions).

**Last Updated**: 2026-02-07
**Maintainer**: Victory Center Development Team
