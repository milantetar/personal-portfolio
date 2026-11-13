# Neon agent setup

Following [Neon's official setup instructions](https://neon.com/prompts/agent-setup.md),
Neon CLI 9.4.0 was installed, browser authentication completed using the Windows
credential keyring, and the official `neon-postgres` plugin was installed in the
Codex user scope with:

```powershell
npm install -g neon@latest
neon login --keyring
neon plugins --global --agent codex -y
```

Restart the Codex agent to load the new plugin, skills, and MCP tools. Complete
any separate MCP browser authorization requested by the agent. Installation is
machine-specific, so another developer must repeat setup in their own account.
No account credentials or agent configuration belong in this repository.

This configures your development agent. It does not create a Neon project,
copy portfolio data, or connect Laravel to a database. For the application's
deployment connection and content transfer, follow [deployment.md](deployment.md).
Use a separate Neon branch for local experiments and inspect the selected
project and branch before allowing migrations or data writes. Never paste
connection passwords or API keys into prompts, source code, or Docker images.
