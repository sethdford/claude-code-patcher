# Feature Gates Reference

> Patchable feature gates in Claude Code and how to control them with `claude-patcher gates`.

## Overview

Claude Code uses [Statsig](https://statsig.com/) feature gates to control the rollout of
new functionality. Gates are identified by `tengu_*` flags embedded in the minified JS
bundle. Most flags are telemetry event names, but a subset of "codename-style" gates
(opaque, randomly-named) control actual feature availability.

The patcher can detect these gates in the binary and, for gates whose function bodies have
been reverse-engineered, patch them to force-enable the feature.

## Patchable Gates

| Codename | Flag | Env Override | What It Controls |
|----------|------|-------------|-----------------|
| `swarm-mode` | `tengu_brass_pebble` | `CLAUDE_CODE_AGENT_SWARMS` | Swarm/TeammateTool/delegate — multi-agent coordination |
| `team-mode` | `tengu_brass_pebble` | `CLAUDE_CODE_TEAM_MODE` | Team mode — TodoWrite-adjacent task/team features |

## Detection-Only Gates

These codename-style gates are detected in the binary but their gate functions haven't been
reverse-engineered yet. They appear in `gates` output but cannot be patched.

| Codename | Flag | Category |
|----------|------|----------|
| `marble-anvil` | `tengu_marble_anvil` | feature |
| `marble-kite` | `tengu_marble_kite` | feature |
| `coral-fern` | `tengu_coral_fern` | feature |
| `quiet-fern` | `tengu_quiet_fern` | feature |
| `plank-river-frost` | `tengu_plank_river_frost` | feature |
| `quartz-lantern` | `tengu_quartz_lantern` | feature |
| `scarf-coffee` | `tengu_scarf_coffee` | feature |
| `cache-plum-violet` | `tengu_cache_plum_violet` | feature |
| `flicker` | `tengu_flicker` | feature |
| `tool-pear` | `tengu_tool_pear` | feature |
| `cork-m4q` | `tengu_cork_m4q` | feature |
| `tst-kx7` | `tengu_tst_kx7` | experiment |
| `plum-vx3` | `tengu_plum_vx3` | feature |
| `kv7-prompt-sort` | `tengu_kv7_prompt_sort` | feature |
| `workout` | `tengu_workout` | feature |

## How Gate Detection Works

1. The patcher locates the Claude Code JS bundle (via `cli-finder.ts`)
2. Each gate has a `detectRegex` that matches its pattern in the minified code
3. For patchable gates, the regex captures the gate function — e.g., for swarm mode:

   ```
   function X(){if(Y(process.env.CLAUDE_CODE_AGENT_SWARMS))return!1;return Z("tengu_brass_pebble",!1)}
   ```

4. The `patchFn` replaces the function body to force `return!0` (always enabled)
5. A marker comment (`CLAUDE-CODE-PATCHER FEATURE GATES:codename`) identifies patched gates

## Environment Variable Overrides

Some gates check environment variables before the Statsig gate. Setting these can
enable the feature without binary patching:

| Variable | Gate | Effect |
|----------|------|--------|
| `CLAUDE_CODE_AGENT_SWARMS` | swarm-mode | Checked first; if truthy, gate returns `false` (disabled) — the binary patch bypasses this |
| `CLAUDE_CODE_TEAM_MODE` | team-mode | Experimental; behavior varies by version |

## CLI Commands

```bash
# List all detected gates with status
claude-patcher gates

# Enable a specific gate
claude-patcher gates enable swarm
claude-patcher gates enable team

# Enable all patchable gates at once
claude-patcher gates enable --all

# Disable a gate (restores from backup)
claude-patcher gates disable swarm

# Reset all gates to original state
claude-patcher gates reset

# Scan binary for all tengu_* flags (including unknown)
claude-patcher gates scan
```

## How Patching Works

1. **Backup** — A timestamped copy of the JS bundle is created (e.g., `cli.js.backup.1706800000000`)
2. **Detect** — The gate's regex is matched against the bundle
3. **Patch** — The `patchFn` replaces the matched code with a force-enabled version
4. **Mark** — A comment marker is injected for identification

Disabling a gate restores from the most recent backup. If no backup exists, the gate's
`unpatchFn` attempts to reverse the patch (less reliable).

## Discovering New Gates

When Claude Code updates, new codename gates may appear. Use:

```bash
# Scan for all tengu_* flags and compare against known registry
claude-patcher gates scan

# Use the flag monitor script (compares against baseline)
./scripts/flag-monitor.sh
```

Unknown flags (marked with `?` in scan output) may be new feature gates worth
investigating.

## See Also

- [TENGU-FLAGS.md](TENGU-FLAGS.md) — Complete 572-flag reference
- [NATIVE-INTEGRATION.md](../claude-fleet/docs/NATIVE-INTEGRATION.md) — Native multi-agent integration
