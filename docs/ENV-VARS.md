# Environment Variables — Complete Reference

> All 398 `process.env.*` references extracted from Claude Code v2.1.37, organized by function.
>
> Last scan: 2026-02-07

## Feature Toggle Variables (CLAUDE_CODE_*)

These 114 variables control Claude Code behavior directly.

### Feature Enables/Disables

| Variable | Effect |
|----------|--------|
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | Disable auto memory (oboe gate) |
| `CLAUDE_CODE_DISABLE_ATTACHMENTS` | Disable file attachments |
| `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` | Disable background tasks |
| `CLAUDE_CODE_DISABLE_CLAUDE_MDS` | Disable CLAUDE.md loading |
| `CLAUDE_CODE_DISABLE_COMMAND_INJECTION_CHECK` | Disable bash command injection safety checks |
| `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` | Disable experimental beta features |
| `CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY` | Disable feedback survey prompts |
| `CLAUDE_CODE_DISABLE_FILE_CHECKPOINTING` | Disable file checkpointing |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | Disable non-essential network requests |
| `CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL` | Disable official marketplace auto-install |
| `CLAUDE_CODE_DISABLE_TERMINAL_TITLE` | Disable terminal title updates |
| `CLAUDE_CODE_ENABLE_CFC` | Enable CFC (unknown feature) |
| `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION` | Enable prompt suggestions (chomp-inflection gate) |
| `CLAUDE_CODE_ENABLE_SDK_FILE_CHECKPOINTING` | Enable SDK file checkpointing |
| `CLAUDE_CODE_ENABLE_TASKS` | Enable task management tools |
| `CLAUDE_CODE_ENABLE_TELEMETRY` | Enable telemetry |
| `CLAUDE_CODE_ENABLE_TOKEN_USAGE_ATTACHMENT` | Enable token usage attachment |
| `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA` | Enhanced telemetry beta |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | Agent teams (amber-flint gate) |
| `CLAUDE_CODE_FORCE_GLOBAL_CACHE` | Force global system prompt cache |
| `CLAUDE_CODE_SIMPLE` | Simplified system prompt (vinteuil-phrase gate) |

### API & Authentication

| Variable | Effect |
|----------|--------|
| `CLAUDE_CODE_API_BASE_URL` | Custom API base URL |
| `CLAUDE_CODE_API_KEY_FILE_DESCRIPTOR` | API key via file descriptor |
| `CLAUDE_CODE_API_KEY_HELPER_TTL_MS` | API key helper cache TTL |
| `CLAUDE_CODE_ATTRIBUTION_HEADER` | Custom attribution header |
| `CLAUDE_CODE_CUSTOM_OAUTH_URL` | Custom OAuth URL |
| `CLAUDE_CODE_OAUTH_CLIENT_ID` | OAuth client ID |
| `CLAUDE_CODE_OAUTH_TOKEN` | Direct OAuth token |
| `CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR` | OAuth token via file descriptor |
| `CLAUDE_CODE_SESSION_ACCESS_TOKEN` | Session access token |
| `CLAUDE_CODE_SKIP_BEDROCK_AUTH` | Skip Bedrock authentication |
| `CLAUDE_CODE_SKIP_FOUNDRY_AUTH` | Skip Foundry authentication |
| `CLAUDE_CODE_SKIP_VERTEX_AUTH` | Skip Vertex authentication |
| `CLAUDE_CODE_USE_BEDROCK` | Use AWS Bedrock backend |
| `CLAUDE_CODE_USE_FOUNDRY` | Use Foundry backend |
| `CLAUDE_CODE_USE_VERTEX` | Use Google Vertex backend |
| `CLAUDE_CODE_WEBSOCKET_AUTH_FILE_DESCRIPTOR` | WebSocket auth via file descriptor |

### Model & Output

| Variable | Effect |
|----------|--------|
| `CLAUDE_CODE_EFFORT_LEVEL` | Set reasoning effort level |
| `CLAUDE_CODE_EXTRA_BODY` | Extra body parameters for API requests |
| `CLAUDE_CODE_FILE_READ_MAX_OUTPUT_TOKENS` | Max tokens for file reads |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | Max output tokens per response |
| `CLAUDE_CODE_MAX_RETRIES` | Max API retries |
| `CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY` | Max concurrent tool executions |
| `CLAUDE_CODE_SUBAGENT_MODEL` | Model for subagents |
| `CLAUDE_CODE_INCLUDE_PARTIAL_MESSAGES` | Include partial messages |

### Agent & Team

| Variable | Effect |
|----------|--------|
| `CLAUDE_CODE_AGENT_NAME` | Agent name (for teams) |
| `CLAUDE_CODE_AGENT_RULE_DISABLED` | Disable agent rules |
| `CLAUDE_CODE_IS_COWORK` | Running in cowork mode |
| `CLAUDE_CODE_PLAN_MODE_INTERVIEW_PHASE` | Plan mode interview phase |
| `CLAUDE_CODE_PLAN_MODE_REQUIRED` | Require plan mode |
| `CLAUDE_CODE_PLAN_V` | Plan version |
| `CLAUDE_CODE_TASK_LIST_ID` | Task list ID |
| `CLAUDE_CODE_TEAM_NAME` | Team name |
| `CLAUDE_CODE_TEAMMATE_COMMAND` | Teammate command |
| `CLAUDE_CODE_USE_COWORK_PLUGINS` | Use cowork plugins |

### Session & Remote

| Variable | Effect |
|----------|--------|
| `CLAUDE_CODE_REMOTE` | Running in remote mode |
| `CLAUDE_CODE_REMOTE_ENVIRONMENT_TYPE` | Remote environment type |
| `CLAUDE_CODE_REMOTE_SESSION_ID` | Remote session ID |
| `CLAUDE_CODE_SESSION_ID` | Session ID |
| `CLAUDE_CODE_SSE_PORT` | SSE server port |
| `CLAUDE_CODE_POST_FOR_SESSION_INGRESS_V` | Session ingress version |

### Shell & IDE

| Variable | Effect |
|----------|--------|
| `CLAUDE_CODE_SHELL` | Override shell |
| `CLAUDE_CODE_SHELL_PREFIX` | Shell command prefix |
| `CLAUDE_CODE_BASH_SANDBOX_SHOW_INDICATOR` | Show sandbox indicator |
| `CLAUDE_CODE_AUTO_CONNECT_IDE` | Auto-connect to IDE |
| `CLAUDE_CODE_IDE_HOST_OVERRIDE` | IDE host override |
| `CLAUDE_CODE_IDE_SKIP_AUTO_INSTALL` | Skip IDE extension auto-install |
| `CLAUDE_CODE_IDE_SKIP_VALID_CHECK` | Skip IDE validation check |

### Proxy & Network

| Variable | Effect |
|----------|--------|
| `CLAUDE_CODE_CLIENT_CERT` | Client certificate path |
| `CLAUDE_CODE_CLIENT_KEY` | Client key path |
| `CLAUDE_CODE_CLIENT_KEY_PASSPHRASE` | Client key passphrase |
| `CLAUDE_CODE_HOST_HTTP_PROXY_PORT` | HTTP proxy port |
| `CLAUDE_CODE_HOST_SOCKS_PROXY_PORT` | SOCKS proxy port |
| `CLAUDE_CODE_PROXY_RESOLVES_HOSTS` | Proxy resolves hostnames |

### Telemetry & Debug

| Variable | Effect |
|----------|--------|
| `CLAUDE_CODE_DATADOG_FLUSH_INTERVAL_MS` | Datadog flush interval |
| `CLAUDE_CODE_DEBUG_LOGS_DIR` | Debug logs directory |
| `CLAUDE_CODE_DIAGNOSTICS_FILE` | Diagnostics output file |
| `CLAUDE_CODE_EMIT_TOOL_USE_SUMMARIES` | Emit tool use summaries |
| `CLAUDE_CODE_OTEL_FLUSH_TIMEOUT_MS` | OpenTelemetry flush timeout |
| `CLAUDE_CODE_OTEL_HEADERS_HELPER_DEBOUNCE_MS` | OTEL headers debounce |
| `CLAUDE_CODE_OTEL_SHUTDOWN_TIMEOUT_MS` | OTEL shutdown timeout |
| `CLAUDE_CODE_PERFETTO_TRACE` | Perfetto trace output |
| `CLAUDE_CODE_PROFILE_QUERY` | Profile query execution |
| `CLAUDE_CODE_PROFILE_STARTUP` | Profile startup |

### Misc

| Variable | Effect |
|----------|--------|
| `CLAUDE_CODE_ACCESSIBILITY` | Accessibility mode |
| `CLAUDE_CODE_ACTION` | Action override |
| `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD` | Additional CLAUDE.md directories |
| `CLAUDE_CODE_ADDITIONAL_PROTECTION` | Additional protection mode |
| `CLAUDE_CODE_BASE_REF` | Git base ref override |
| `CLAUDE_CODE_BLOCKING_LIMIT_OVERRIDE` | Blocking limit override |
| `CLAUDE_CODE_BUBBLEWRAP` | Bubblewrap sandbox |
| `CLAUDE_CODE_CONTAINER_ID` | Container ID |
| `CLAUDE_CODE_DONT_INHERIT_ENV` | Don't inherit parent environment |
| `CLAUDE_CODE_EAGER_FLUSH` | Eager output flush |
| `CLAUDE_CODE_ENTRYPOINT` | Entrypoint override |
| `CLAUDE_CODE_ENVIRONMENT_RUNNER_VERSION` | Runner version |
| `CLAUDE_CODE_EXIT_AFTER_FIRST_RENDER` | Exit after first render |
| `CLAUDE_CODE_EXIT_AFTER_STOP_DELAY` | Exit after stop delay |
| `CLAUDE_CODE_FORCE_FULL_LOGO` | Force full logo display |
| `CLAUDE_CODE_GIT_BASH_PATH` | Git bash path (Windows) |
| `CLAUDE_CODE_GLOB_HIDDEN` | Glob hidden files |
| `CLAUDE_CODE_GLOB_NO_IGNORE` | Glob without gitignore |
| `CLAUDE_CODE_GLOB_TIMEOUT_SECONDS` | Glob timeout |
| `CLAUDE_CODE_SKIP_PROMPT_HISTORY` | Skip prompt history |
| `CLAUDE_CODE_SM_COMPACT` | Session memory compact |
| `CLAUDE_CODE_SYNTAX_HIGHLIGHT` | Syntax highlighting |
| `CLAUDE_CODE_TAGS` | Session tags |
| `CLAUDE_CODE_TEST_FIXTURES_ROOT` | Test fixtures root |
| `CLAUDE_CODE_TMPDIR` | Temp directory override |
| `CLAUDE_CODE_TMUX_PREFIX` | Tmux prefix key |
| `CLAUDE_CODE_TMUX_PREFIX_CONFLICTS` | Tmux prefix conflicts |
| `CLAUDE_CODE_TMUX_SESSION` | Tmux session name |
| `CLAUDE_CODE_TST_NAMES_IN_MESSAGES` | Test names in messages |

## DISABLE_* Toggles (23)

These process-level toggles disable specific features.

| Variable | Effect |
|----------|--------|
| `DISABLE_AUTO_COMPACT` | Disable automatic context compaction |
| `DISABLE_AUTO_MIGRATE_TO_NATIVE` | Disable auto-migration to native binary |
| `DISABLE_AUTOUPDATER` | Disable auto-updater |
| `DISABLE_BUG_COMMAND` | Disable /bug command |
| `DISABLE_CLAUDE_CODE_SM_COMPACT` | Disable session memory compaction |
| `DISABLE_COMPACT` | Disable all compaction |
| `DISABLE_COST_WARNINGS` | Disable cost threshold warnings |
| `DISABLE_DOCTOR_COMMAND` | Disable /doctor command |
| `DISABLE_ERROR_REPORTING` | Disable error reporting |
| `DISABLE_EXTRA_USAGE_COMMAND` | Disable /extra-usage command |
| `DISABLE_FEEDBACK_COMMAND` | Disable /feedback command |
| `DISABLE_INSTALL_GITHUB_APP_COMMAND` | Disable GitHub App install command |
| `DISABLE_INSTALLATION_CHECKS` | Disable installation checks |
| `DISABLE_INTERLEAVED_THINKING` | Disable interleaved thinking |
| `DISABLE_LOGIN_COMMAND` | Disable /login command |
| `DISABLE_LOGOUT_COMMAND` | Disable /logout command |
| `DISABLE_MICROCOMPACT` | Disable micro-compaction |
| `DISABLE_PROMPT_CACHING` | Disable all prompt caching |
| `DISABLE_PROMPT_CACHING_HAIKU` | Disable prompt caching for Haiku |
| `DISABLE_PROMPT_CACHING_OPUS` | Disable prompt caching for Opus |
| `DISABLE_PROMPT_CACHING_SONNET` | Disable prompt caching for Sonnet |
| `DISABLE_TELEMETRY` | Disable all telemetry |
| `DISABLE_UPGRADE_COMMAND` | Disable /upgrade command |

## ENABLE_* Toggles (12)

These process-level toggles enable experimental or optional features.

| Variable | Effect |
|----------|--------|
| `ENABLE_BETA_TRACING_DETAILED` | Enable detailed beta tracing |
| `ENABLE_BTW` | Enable "by the way" suggestions |
| `ENABLE_CLAUDE_CODE_SM_COMPACT` | Enable session memory compaction |
| `ENABLE_CLAUDEAI_MCP_SERVERS` | Enable Claude.ai MCP servers |
| `ENABLE_ENHANCED_TELEMETRY_BETA` | Enable enhanced telemetry beta |
| `ENABLE_EXPERIMENTAL_MCP_CLI` | Enable experimental MCP CLI |
| `ENABLE_LSP_TOOL` | Enable LSP tool |
| `ENABLE_MCP_CLI` | Enable MCP CLI |
| `ENABLE_MCP_CLI_ENDPOINT` | Enable MCP CLI endpoint |
| `ENABLE_MCP_LARGE_OUTPUT_FILES` | Enable MCP large output files |
| `ENABLE_SESSION_BACKGROUNDING` | Enable session backgrounding |
| `ENABLE_TOOL_SEARCH` | Enable tool search |

## CLAUDE_* (non-CODE) Variables (13)

| Variable | Effect |
|----------|--------|
| `CLAUDE_AGENT_SDK_DISABLE_BUILTIN_AGENTS` | Disable built-in SDK agents |
| `CLAUDE_AGENT_SDK_MCP_NO_PREFIX` | No MCP prefix in Agent SDK |
| `CLAUDE_AGENT_SDK_VERSION` | Agent SDK version |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | Override autocompact percentage threshold |
| `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` | Maintain project working directory |
| `CLAUDE_BASH_NO_LOGIN` | No login shell for bash |
| `CLAUDE_CHROME_PERMISSION_MODE` | Chrome extension permission mode |
| `CLAUDE_CONFIG_DIR` | Config directory override |
| `CLAUDE_DEBUG` | Debug mode |
| `CLAUDE_ENV_FILE` | Custom env file path |
| `CLAUDE_FORCE_DISPLAY_SURVEY` | Force display feedback survey |
| `CLAUDE_REPL_MODE` | REPL mode |
| `CLAUDE_TMPDIR` | Temp directory |

## ANTHROPIC_* Variables (18)

API configuration for Anthropic, Bedrock, Foundry, and Vertex backends.

| Variable | Effect |
|----------|--------|
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `ANTHROPIC_AUTH_TOKEN` | Anthropic auth token |
| `ANTHROPIC_BASE_URL` | Anthropic base URL |
| `ANTHROPIC_BEDROCK_BASE_URL` | Bedrock base URL |
| `ANTHROPIC_BETAS` | Beta feature flags |
| `ANTHROPIC_CUSTOM_HEADERS` | Custom headers |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | Default Haiku model |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | Default Opus model |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | Default Sonnet model |
| `ANTHROPIC_FOUNDRY_API_KEY` | Foundry API key |
| `ANTHROPIC_FOUNDRY_BASE_URL` | Foundry base URL |
| `ANTHROPIC_FOUNDRY_RESOURCE` | Foundry resource |
| `ANTHROPIC_MODEL` | Model override |
| `ANTHROPIC_SMALL_FAST_MODEL` | Small fast model override |
| `ANTHROPIC_SMALL_FAST_MODEL_AWS_REGION` | Small fast model AWS region |
| `ANTHROPIC_VERTEX_PROJECT_ID` | Vertex project ID |
| `VERTEX_BASE_URL` | Vertex base URL |
| `VERTEX_REGION_CLAUDE_*` | Vertex region per model |

## See Also

- [TENGU-FLAGS.md](TENGU-FLAGS.md) — Complete 605-flag reference
- [FEATURE-GATES.md](FEATURE-GATES.md) — Patchable feature gates reference
