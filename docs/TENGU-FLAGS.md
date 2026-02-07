# Tengu Flags — Complete Reference

> All 605 `tengu_*` flags extracted from Claude Code v2.1.37 (Mach-O ARM64 binary), organized by category.
>
> Last scan: 2026-02-07 | Previous: 572 flags | Delta: +39 added, -5 removed

Tengu flags are [Statsig](https://statsig.com/) identifiers used for feature gating,
telemetry, and experimentation in Claude Code. Most are telemetry event names;
a small subset (the "codename-style" gates) control feature availability.

## Feature Gates (Codename-style)

These opaque, randomly-named flags are Statsig feature gates that enable or disable
functionality. Their names reveal nothing about purpose — they must be
reverse-engineered from the binary.

### Patchable Gates (9)

| Flag | Codename | Tier | Env Override | Purpose |
|------|----------|------|-------------|---------|
| `tengu_brass_pebble` | swarm-mode | 2 | `CLAUDE_CODE_AGENT_SWARMS` | Swarm/TeammateTool/delegate gate |
| `tengu_brass_pebble` | team-mode | 3 | `CLAUDE_CODE_TEAM_MODE` | Team mode task/team features |
| `tengu_workout2` | workout-v2 | 1 | | Workout v2 feature iteration |
| `tengu_keybinding_customization_release` | keybinding-customization | 1 | | Custom keyboard shortcut configuration |
| `tengu_session_memory` | session-memory | 1 | | Persistent memory across sessions |
| `tengu_oboe` | oboe | 2 | `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | Auto Memory (~/.claude/memory/MEMORY.md) |
| `tengu_amber_flint` | amber-flint | 2 | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | Agent Teams feature gate |
| `tengu_silver_lantern` | silver-lantern | 3 | | Promo mode selector (subscription-based) |
| `tengu_copper_lantern` | copper-lantern | 3 | | Pro/Max subscription promo banner |

### Detection-Only Gates (20)

| Flag | Codename | Tier | Purpose |
|------|----------|------|---------|
| `tengu_chomp_inflection` | chomp-inflection | 4 | Prompt suggestions. Env: `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION` |
| `tengu_vinteuil_phrase` | vinteuil-phrase | 4 | Simplified system prompt. Env: `CLAUDE_CODE_SIMPLE` |
| `tengu_speculation` | speculation | 5 | Speculative pre-execution of likely tool calls |
| `tengu_structured_output_enabled` | structured-output | 5 | Structured/typed model responses |
| `tengu_streaming_tool_execution2` | streaming-tool-exec-v2 | 5 | Execute tools while model still streaming |
| `tengu_thinkback` | thinkback | 5 | Year-in-review animation skill |
| `tengu_system_prompt_global_cache` | system-prompt-global-cache | 5 | Global prompt cache. Env: `CLAUDE_CODE_FORCE_GLOBAL_CACHE` |
| `tengu_marble_anvil` | marble-anvil | ? | Unknown feature gate |
| `tengu_marble_kite` | marble-kite | ? | Unknown feature gate (18 occurrences — high for a gate) |
| `tengu_coral_fern` | coral-fern | ? | Unknown feature gate |
| `tengu_quiet_fern` | quiet-fern | ? | Unknown feature gate |
| `tengu_plank_river_frost` | plank-river-frost | ? | Unknown feature gate |
| `tengu_quartz_lantern` | quartz-lantern | ? | Lantern family — related to copper/silver lantern |
| `tengu_scarf_coffee` | scarf-coffee | ? | Unknown feature gate |
| `tengu_cache_plum_violet` | cache-plum-violet | ? | Cache-related feature |
| `tengu_flicker` | flicker | ? | Unknown feature gate |
| `tengu_tool_pear` | tool-pear | ? | Tool-related feature gate |
| `tengu_cork_m4q` | cork-m4q | ? | Unknown feature gate |
| `tengu_tst_kx7` | tst-kx7 | ? | Test/experiment gate (9 occurrences) |
| `tengu_plum_vx3` | plum-vx3 | ? | Unknown feature gate |
| `tengu_kv7_prompt_sort` | kv7-prompt-sort | ? | Prompt sorting for cache efficiency |
| `tengu_workout` | workout | ? | Superseded by workout2 |

### Gate Tier Definitions

- **Tier 1** — Simple wrappers: `function X(){return checkGate("tengu_flag",!1)}`
- **Tier 2** — Env-guarded: env var check, then Statsig check
- **Tier 3** — Complex: multi-branch returns, subscription checks
- **Tier 4** — Too complex: env var override preferred (detection-only)
- **Tier 5** — Inline checks: no wrapper function (detection-only)
- **?** — Tier not yet determined

## Version Delta (v2.1.34 → v2.1.37)

### New Flags (+39)

| Flag | Category | Notes |
|------|----------|-------|
| `tengu_agent_flag` | agent | New agent flag system |
| `tengu_agent_memory_loaded` | agent | Agent memory loading event |
| `tengu_amber_flint` | feature gate | Agent Teams gate (promoted to patchable) |
| `tengu_auto_compact_succeeded` | compact | Auto-compact success tracking |
| `tengu_bash_command_interrupt_backgrounded` | bash | Background command interruption |
| `tengu_chain_parent_cycle` | agent | Agent chain parent cycle detection |
| `tengu_chomp_inflection` | feature gate | Prompt suggestions gate |
| `tengu_copper_lantern` | feature gate | Pro/Max subscription promo |
| `tengu_copper_lantern_config` | config | Copper lantern config data |
| `tengu_fast_mode_fallback_triggered` | api | Fast mode fallback event |
| `tengu_fast_mode_overage_rejected` | api | Fast mode overage rejection |
| `tengu_fast_mode_prefetch_timeout` | api | Fast mode prefetch timeout |
| `tengu_filtered_whitespace_only_assistant` | message | Whitespace-only assistant filter |
| `tengu_marble_lantern_disabled` | feature gate | Marble lantern disabled event |
| `tengu_memdir_accessed` | memory | Memory directory accessed |
| `tengu_memdir_file_edit` | memory | Memory directory file edited |
| `tengu_memdir_file_read` | memory | Memory directory file read |
| `tengu_memdir_file_write` | memory | Memory directory file written |
| `tengu_memdir_loaded` | memory | Memory directory loaded |
| `tengu_model_whitespace_response` | model | Model whitespace-only response |
| `tengu_oboe` | feature gate | Auto Memory gate |
| `tengu_opus_46_notice_shown` | notice | Opus 4.6 notice shown |
| `tengu_opus46_feed_shown` | notice | Opus 4.6 feed shown |
| `tengu_opus46_upgrade_nudge_shown` | notice | Opus 4.6 upgrade nudge |
| `tengu_org_penguin_mode_fetch_failed` | org | Org penguin mode fetch failure |
| `tengu_partial_compact` | compact | Partial compaction event |
| `tengu_partial_compact_failed` | compact | Partial compaction failure |
| `tengu_pdf_reference_attachment` | attachment | PDF reference attachment |
| `tengu_penguin_mode_promo` | subscription | Penguin mode promo |
| `tengu_penguins_enabled` | subscription | Penguins feature enabled |
| `tengu_penguins_off` | subscription | Penguins feature off |
| `tengu_reduce_motion_setting_changed` | config | Reduce motion accessibility setting |
| `tengu_session_memory_file_read` | session | Session memory file read |
| `tengu_session_memory_loaded` | session | Session memory loaded event |
| `tengu_silver_lantern` | feature gate | Promo mode selector gate |
| `tengu_transcript_parent_cycle` | transcript | Transcript parent cycle |
| `tengu_tst_names_in_messages` | experiment | Test names in messages |
| `tengu_vinteuil_phrase` | feature gate | Simplified system prompt gate |
| `tengu_workout2` | feature gate | Workout v2 gate |

### Removed Flags (-5)

| Flag | Notes |
|------|-------|
| `tengu_brass_pebble` | Swarm gate — may have been renamed or refactored |
| `tengu_empty_model_response` | Replaced by `tengu_model_whitespace_response` |
| `tengu_opus_45_notice_shown` | Replaced by `tengu_opus_46_notice_shown` |
| `tengu_opus45_upgrade_nudge_shown` | Replaced by `tengu_opus46_upgrade_nudge_shown` |
| `tengu_workout` | Still in detection-only registry, may be vestigial |

## Telemetry Flags by Category

### API & Networking (17)

| Flag | Purpose |
|------|---------|
| `tengu_api` | API call event |
| `tengu_api_after_normalize` | Post-normalization API event |
| `tengu_api_before_normalize` | Pre-normalization API event |
| `tengu_api_cache_breakpoints` | Cache breakpoint tracking |
| `tengu_api_custom_529_overloaded_error` | Custom overloaded error handling |
| `tengu_api_error` | API error event |
| `tengu_api_key_keychain_error` | API key keychain read error |
| `tengu_api_key_saved_to_config` | API key saved to config |
| `tengu_api_key_saved_to_keychain` | API key saved to keychain |
| `tengu_api_opus_fallback_triggered` | Opus model fallback |
| `tengu_api_query` | API query event |
| `tengu_api_retry` | API retry event |
| `tengu_api_success` | Successful API call |
| `tengu_attribution_header` | Attribution header event |
| `tengu_fast_mode_fallback_triggered` | Fast mode fallback event |
| `tengu_fast_mode_overage_rejected` | Fast mode overage rejection |
| `tengu_fast_mode_prefetch_timeout` | Fast mode prefetch timeout |

### OAuth & Authentication (39)

| Flag | Purpose |
|------|---------|
| `tengu_aws` | AWS authentication event |
| `tengu_grove_oauth_401_received` | Grove OAuth 401 received |
| `tengu_oauth_401_recovered_from_keychain` | OAuth 401 keychain recovery |
| `tengu_oauth_api_key` | OAuth API key event |
| `tengu_oauth_api_key_error` | OAuth API key error |
| `tengu_oauth_auth_code_received` | OAuth auth code received |
| `tengu_oauth_automatic_redirect` | OAuth auto redirect |
| `tengu_oauth_automatic_redirect_error` | OAuth redirect error |
| `tengu_oauth_claudeai_forced` | Claude.ai OAuth forced |
| `tengu_oauth_claudeai_selected` | Claude.ai OAuth selected |
| `tengu_oauth_console_forced` | Console OAuth forced |
| `tengu_oauth_console_selected` | Console OAuth selected |
| `tengu_oauth_error` | OAuth error |
| `tengu_oauth_flow_start` | OAuth flow start |
| `tengu_oauth_manual_entry` | OAuth manual entry |
| `tengu_oauth_platform_selected` | OAuth platform selected |
| `tengu_oauth_profile_fetch_success` | OAuth profile fetch success |
| `tengu_oauth_roles_stored` | OAuth roles stored |
| `tengu_oauth_storage_warning` | OAuth storage warning |
| `tengu_oauth_success` | OAuth success |
| `tengu_oauth_token_exchange_error` | Token exchange error |
| `tengu_oauth_token_exchange_success` | Token exchange success |
| `tengu_oauth_token_refresh_completed` | Token refresh completed |
| `tengu_oauth_token_refresh_failure` | Token refresh failure |
| `tengu_oauth_token_refresh_lock_acquired` | Refresh lock acquired |
| `tengu_oauth_token_refresh_lock_acquiring` | Refresh lock acquiring |
| `tengu_oauth_token_refresh_lock_error` | Refresh lock error |
| `tengu_oauth_token_refresh_lock_released` | Refresh lock released |
| `tengu_oauth_token_refresh_lock_releasing` | Refresh lock releasing |
| `tengu_oauth_token_refresh_lock_retry` | Refresh lock retry |
| `tengu_oauth_token_refresh_lock_retry_limit_reached` | Retry limit reached |
| `tengu_oauth_token_refresh_race_recovered` | Race condition recovered |
| `tengu_oauth_token_refresh_race_resolved` | Race condition resolved |
| `tengu_oauth_token_refresh_starting` | Token refresh starting |
| `tengu_oauth_token_refresh_success` | Token refresh success |
| `tengu_oauth_tokens_inference_only` | Inference-only tokens |
| `tengu_oauth_tokens_not_claude_ai` | Non-Claude.ai tokens |
| `tengu_oauth_tokens_save_exception` | Token save exception |
| `tengu_oauth_tokens_save_failed` | Token save failed |
| `tengu_oauth_tokens_saved` | Tokens saved |
| `tengu_oauth_user_roles_error` | User roles error |

### Tool Usage (22)

| Flag | Purpose |
|------|---------|
| `tengu_tool_prompt_changed` | Tool prompt changed |
| `tengu_tool_result_pairing_repaired` | Tool result pairing repaired |
| `tengu_tool_result_persisted` | Tool result persisted |
| `tengu_tool_search_mode_decision` | Tool search mode decision |
| `tengu_tool_search_outcome` | Tool search outcome |
| `tengu_tool_search_unsupported_models` | Unsupported models for tool search |
| `tengu_tool_use_can_use_tool_allowed` | Tool use allowed |
| `tengu_tool_use_can_use_tool_rejected` | Tool use rejected |
| `tengu_tool_use_cancelled` | Tool use cancelled |
| `tengu_tool_use_denied_in_config` | Tool denied in config |
| `tengu_tool_use_diff_computed` | Tool diff computed |
| `tengu_tool_use_error` | Tool use error |
| `tengu_tool_use_granted_by_permission_hook` | Granted by permission hook |
| `tengu_tool_use_granted_in_config` | Granted in config |
| `tengu_tool_use_granted_in_prompt_permanent` | Granted permanently in prompt |
| `tengu_tool_use_granted_in_prompt_temporary` | Granted temporarily in prompt |
| `tengu_tool_use_progress` | Tool use progress |
| `tengu_tool_use_rejected_in_prompt` | Rejected in prompt |
| `tengu_tool_use_show_permission_request` | Show permission request |
| `tengu_tool_use_success` | Tool use success |
| `tengu_tool_use_tool_result_mismatch_error` | Result mismatch error |
| `tengu_unexpected_tool_result` | Unexpected tool result |

### MCP (Model Context Protocol) (26)

| Flag | Purpose |
|------|---------|
| `tengu_mcp_add` | MCP server added |
| `tengu_mcp_auth_config_authenticate` | MCP auth config authenticate |
| `tengu_mcp_auth_config_clear` | MCP auth config clear |
| `tengu_mcp_cli_command_executed` | MCP CLI command executed |
| `tengu_mcp_cli_status` | MCP CLI status |
| `tengu_mcp_delete` | MCP server deleted |
| `tengu_mcp_dialog_choice` | MCP dialog choice |
| `tengu_mcp_get` | MCP server get |
| `tengu_mcp_headers` | MCP headers event |
| `tengu_mcp_ide_server_connection_failed` | IDE MCP connection failed |
| `tengu_mcp_ide_server_connection_succeeded` | IDE MCP connection succeeded |
| `tengu_mcp_list` | MCP server list |
| `tengu_mcp_list_changed` | MCP list changed |
| `tengu_mcp_multidialog_choice` | MCP multi-dialog choice |
| `tengu_mcp_oauth_flow_error` | MCP OAuth flow error |
| `tengu_mcp_oauth_flow_start` | MCP OAuth flow start |
| `tengu_mcp_oauth_flow_success` | MCP OAuth flow success |
| `tengu_mcp_reset_mcpjson_choices` | Reset MCP JSON choices |
| `tengu_mcp_server_connection_failed` | MCP server connection failed |
| `tengu_mcp_server_connection_succeeded` | MCP server connection succeeded |
| `tengu_mcp_server_needs_auth` | MCP server needs auth |
| `tengu_mcp_servers` | MCP servers event |
| `tengu_mcp_start` | MCP start |
| `tengu_mcp_tool_call_auth_error` | MCP tool call auth error |
| `tengu_mcp_tool_search` | MCP tool search |
| `tengu_mcp_tools_commands_loaded` | MCP tools/commands loaded |

### Session & Persistence (21)

| Flag | Purpose |
|------|---------|
| `tengu_session_all_projects_toggled` | All projects toggled |
| `tengu_session_branch_filter_toggled` | Branch filter toggled |
| `tengu_session_file_read` | Session file read |
| `tengu_session_forked_branches_fetched` | Forked branches fetched |
| `tengu_session_group_expanded` | Session group expanded |
| `tengu_session_linked_to_pr` | Session linked to PR |
| `tengu_session_memory` | Session memory flag |
| `tengu_session_memory_accessed` | Session memory accessed |
| `tengu_session_memory_extraction` | Session memory extraction |
| `tengu_session_memory_file_read` | Session memory file read |
| `tengu_session_memory_loaded` | Session memory loaded |
| `tengu_session_persistence_failed` | Session persistence failed |
| `tengu_session_preview_opened` | Session preview opened |
| `tengu_session_quality_classification` | Session quality classification |
| `tengu_session_rename_started` | Session rename started |
| `tengu_session_renamed` | Session renamed |
| `tengu_session_resumed` | Session resumed |
| `tengu_session_search_toggled` | Session search toggled |
| `tengu_session_tag_filter_changed` | Tag filter changed |
| `tengu_session_tagged` | Session tagged |
| `tengu_session_worktree_filter_toggled` | Worktree filter toggled |

### Memory Directory (5) — NEW

| Flag | Purpose |
|------|---------|
| `tengu_memdir_accessed` | Memory directory accessed |
| `tengu_memdir_file_edit` | Memory directory file edited |
| `tengu_memdir_file_read` | Memory directory file read |
| `tengu_memdir_file_write` | Memory directory file written |
| `tengu_memdir_loaded` | Memory directory loaded |

### File Operations (17)

| Flag | Purpose |
|------|---------|
| `tengu_file_changed` | File changed event |
| `tengu_file_history_backup_deleted_file` | File history backup — deleted file |
| `tengu_file_history_backup_file_created` | File history backup created |
| `tengu_file_history_backup_file_failed` | File history backup failed |
| `tengu_file_history_resume_copy_failed` | Resume copy failed |
| `tengu_file_history_rewind_failed` | Rewind failed |
| `tengu_file_history_rewind_restore_file_failed` | Rewind restore failed |
| `tengu_file_history_rewind_success` | Rewind success |
| `tengu_file_history_snapshot_failed` | Snapshot failed |
| `tengu_file_history_snapshot_success` | Snapshot success |
| `tengu_file_history_snapshots_setting_changed` | Snapshots setting changed |
| `tengu_file_history_track_edit_failed` | Track edit failed |
| `tengu_file_history_track_edit_success` | Track edit success |
| `tengu_file_operation` | File operation event |
| `tengu_file_suggestions_git_ls_files` | File suggestions via git ls-files |
| `tengu_file_suggestions_ripgrep` | File suggestions via ripgrep |
| `tengu_file_write_optimization` | File write optimization |

### Compact/Summarization (20)

| Flag | Purpose |
|------|---------|
| `tengu_compact` | Compact event |
| `tengu_compact_cache_prefix` | Compact cache prefix |
| `tengu_compact_cache_sharing_fallback` | Cache sharing fallback |
| `tengu_compact_cache_sharing_success` | Cache sharing success |
| `tengu_compact_failed` | Compact failed |
| `tengu_compact_streaming_retry` | Compact streaming retry |
| `tengu_microcompact` | Micro-compaction event |
| `tengu_partial_compact` | Partial compaction event |
| `tengu_partial_compact_failed` | Partial compaction failure |
| `tengu_post_autocompact_turn` | Post auto-compact turn |
| `tengu_post_compact_file_restore_error` | Post-compact file restore error |
| `tengu_post_compact_file_restore_success` | Post-compact file restore success |
| `tengu_post_compact_survey` | Post-compact survey |
| `tengu_post_compact_survey_event` | Post-compact survey event |
| `tengu_sm_compact` | Session memory compact |
| `tengu_sm_compact_config` | SM compact config |
| `tengu_sm_compact_empty_template` | SM compact empty template |
| `tengu_sm_compact_error` | SM compact error |
| `tengu_sm_compact_no_session_memory` | SM compact no session memory |
| `tengu_sm_compact_resumed_session` | SM compact resumed session |
| `tengu_sm_compact_summarized_id_not_found` | SM compact summarized ID not found |
| `tengu_sm_compact_threshold_exceeded` | SM compact threshold exceeded |

### Native Binary & Updates (22)

| Flag | Purpose |
|------|---------|
| `tengu_auto_migrate_to_native_attempt` | Auto-migrate attempt |
| `tengu_auto_migrate_to_native_failure` | Auto-migrate failure |
| `tengu_auto_migrate_to_native_partial` | Auto-migrate partial |
| `tengu_auto_migrate_to_native_success` | Auto-migrate success |
| `tengu_auto_migrate_to_native_ui_error` | Auto-migrate UI error |
| `tengu_auto_migrate_to_native_ui_shown` | Auto-migrate UI shown |
| `tengu_auto_migrate_to_native_ui_success` | Auto-migrate UI success |
| `tengu_auto_updater_fail` | Auto-updater fail |
| `tengu_auto_updater_lock_contention` | Auto-updater lock contention |
| `tengu_auto_updater_success` | Auto-updater success |
| `tengu_auto_updater_windows_npm_in_wsl` | Auto-updater Windows npm in WSL |
| `tengu_autoupdate_channel_changed` | Auto-update channel changed |
| `tengu_autoupdate_enabled` | Auto-update enabled |
| `tengu_binary_download_attempt` | Binary download attempt |
| `tengu_binary_download_failure` | Binary download failure |
| `tengu_binary_download_success` | Binary download success |
| `tengu_binary_manifest_fetch_failure` | Binary manifest fetch failure |
| `tengu_binary_platform_not_found` | Binary platform not found |
| `tengu_native_auto_updater_fail` | Native auto-updater fail |
| `tengu_native_auto_updater_lock_contention` | Native auto-updater lock contention |
| `tengu_native_auto_updater_start` | Native auto-updater start |
| `tengu_native_auto_updater_success` | Native auto-updater success |
| `tengu_native_auto_updater_up_to_date` | Native auto-updater up-to-date |
| `tengu_native_install_binary_failure` | Native install binary failure |
| `tengu_native_install_binary_success` | Native install binary success |
| `tengu_native_install_package_failure` | Native install package failure |
| `tengu_native_install_package_success` | Native install package success |
| `tengu_native_staging_cleanup` | Native staging cleanup |
| `tengu_native_stale_locks_cleanup` | Native stale locks cleanup |
| `tengu_native_temp_files_cleanup` | Native temp files cleanup |
| `tengu_native_update_complete` | Native update complete |
| `tengu_native_update_skipped_minimum_version` | Native update skipped (min version) |
| `tengu_native_version_cleanup` | Native version cleanup |

### Agent & Swarm (14)

| Flag | Purpose |
|------|---------|
| `tengu_agent_color_set` | Agent color set |
| `tengu_agent_created` | Agent created |
| `tengu_agent_definition_generated` | Agent definition generated |
| `tengu_agent_flag` | Agent flag system event |
| `tengu_agent_memory_loaded` | Agent memory loaded |
| `tengu_agent_name_set` | Agent name set |
| `tengu_agent_parse_error` | Agent parse error |
| `tengu_agent_stop_hook_error` | Agent stop hook error |
| `tengu_agent_stop_hook_max_turns` | Agent stop hook max turns |
| `tengu_agent_stop_hook_success` | Agent stop hook success |
| `tengu_agent_tool_completed` | Agent tool completed |
| `tengu_agent_tool_selected` | Agent tool selected |
| `tengu_agentic_search_cancelled` | Agentic search cancelled |
| `tengu_fork_agent_query` | Fork agent query |
| `tengu_subagent_at_mention` | Subagent at-mention |
| `tengu_teammate_mode_changed` | Teammate mode changed |

### IDE/Extensions (14)

| Flag | Purpose |
|------|---------|
| `tengu_chrome_auto_enable` | Chrome auto-enable |
| `tengu_claude_in_chrome_onboarding_shown` | Claude in Chrome onboarding shown |
| `tengu_claude_in_chrome_setting_changed` | Claude in Chrome setting changed |
| `tengu_claude_in_chrome_setup` | Claude in Chrome setup |
| `tengu_claude_in_chrome_setup_failed` | Claude in Chrome setup failed |
| `tengu_ext_at_mentioned` | Extension at-mentioned |
| `tengu_ext_diff_accepted` | Extension diff accepted |
| `tengu_ext_diff_rejected` | Extension diff rejected |
| `tengu_ext_ide_command` | Extension IDE command |
| `tengu_ext_install_error` | Extension install error |
| `tengu_ext_installed` | Extension installed |
| `tengu_ext_will_show_diff` | Extension will show diff |
| `tengu_external_editor_hint_shown` | External editor hint shown |
| `tengu_external_editor_used` | External editor used |
| `tengu_ide_` | IDE event (partial prefix) |
| `tengu_vscode_` | VS Code event (partial prefix) |
| `tengu_vscode_onboarding` | VS Code onboarding |
| `tengu_vscode_review_upsell` | VS Code review upsell |

### Permissions & Security (11)

| Flag | Purpose |
|------|---------|
| `tengu_bash_security_check_triggered` | Bash security check (63 occurrences — highest) |
| `tengu_bypass_permissions_mode_dialog_accept` | Bypass permissions accept |
| `tengu_bypass_permissions_mode_dialog_shown` | Bypass permissions shown |
| `tengu_disable_bypass_permissions_mode` | Disable bypass permissions mode |
| `tengu_permission_explainer` | Permission explainer event |
| `tengu_permission_explainer_error` | Permission explainer error |
| `tengu_permission_explainer_generated` | Permission explainer generated |
| `tengu_permission_explainer_shortcut_used` | Permission shortcut used |
| `tengu_permission_request_escape` | Permission request escape |
| `tengu_permission_request_option_selected` | Permission option selected |
| `tengu_trust_dialog_accept` | Trust dialog accept |
| `tengu_trust_dialog_shown` | Trust dialog shown |

### Subscription & Penguin Mode (8) — NEW

| Flag | Purpose |
|------|---------|
| `tengu_c4w_usage_limit_notifications_enabled` | C4W usage limit notifications |
| `tengu_claudeai_limits_status_changed` | Claude.ai limits status changed |
| `tengu_marble_lantern_disabled` | Marble lantern disabled event |
| `tengu_org_penguin_mode_fetch_failed` | Org penguin mode fetch failure |
| `tengu_penguin_mode_promo` | Penguin mode promo display |
| `tengu_penguins_enabled` | Penguins feature enabled |
| `tengu_penguins_off` | Penguins feature off |
| `tengu_switch_to_subscription_notice_shown` | Switch to subscription notice |

### Streaming (8)

| Flag | Purpose |
|------|---------|
| `tengu_stream_no_events` | Stream no events |
| `tengu_streaming_error` | Streaming error |
| `tengu_streaming_fallback_to_non_streaming` | Streaming fallback |
| `tengu_streaming_stall` | Streaming stall |
| `tengu_streaming_stall_summary` | Streaming stall summary |
| `tengu_streaming_tool_execution_not_used` | Streaming tool exec not used |
| `tengu_streaming_tool_execution_used` | Streaming tool exec used |

### Teleport (15)

| Flag | Purpose |
|------|---------|
| `tengu_teleport_cancelled` | Teleport cancelled |
| `tengu_teleport_error_branch_checkout_failed` | Teleport branch checkout failed |
| `tengu_teleport_error_git_not_clean` | Teleport git not clean |
| `tengu_teleport_error_repo_mismatch_sessions_api` | Teleport repo mismatch |
| `tengu_teleport_error_repo_not_in_git_dir_sessions_api` | Teleport not in git dir |
| `tengu_teleport_error_session_not_found_404` | Teleport session not found |
| `tengu_teleport_errors_detected` | Teleport errors detected |
| `tengu_teleport_errors_resolved` | Teleport errors resolved |
| `tengu_teleport_first_message_error` | Teleport first message error |
| `tengu_teleport_first_message_success` | Teleport first message success |
| `tengu_teleport_interactive_mode` | Teleport interactive mode |
| `tengu_teleport_print` | Teleport print |
| `tengu_teleport_resume_error` | Teleport resume error |
| `tengu_teleport_resume_session` | Teleport resume session |
| `tengu_teleport_started` | Teleport started |

### Hooks (13)

| Flag | Purpose |
|------|---------|
| `tengu_hook_created` | Hook created |
| `tengu_hook_deleted` | Hook deleted |
| `tengu_hooks_command` | Hooks command |
| `tengu_post_tool_failure_hook_error` | Post-tool failure hook error |
| `tengu_post_tool_failure_hooks_cancelled` | Post-tool failure hooks cancelled |
| `tengu_post_tool_hook_error` | Post-tool hook error |
| `tengu_post_tool_hooks_cancelled` | Post-tool hooks cancelled |
| `tengu_pre_stop_hooks_cancelled` | Pre-stop hooks cancelled |
| `tengu_pre_tool_hook_error` | Pre-tool hook error |
| `tengu_pre_tool_hooks_cancelled` | Pre-tool hooks cancelled |
| `tengu_repl_hook_finished` | REPL hook finished |
| `tengu_run_hook` | Run hook event |
| `tengu_stop_hook_error` | Stop hook error |

### Plugins & Skills (20)

| Flag | Purpose |
|------|---------|
| `tengu_dynamic_skills_changed` | Dynamic skills changed |
| `tengu_marketplace_added` | Marketplace item added |
| `tengu_marketplace_removed` | Marketplace item removed |
| `tengu_marketplace_updated` | Marketplace item updated |
| `tengu_marketplace_updated_all` | All marketplace items updated |
| `tengu_official_marketplace_auto_install` | Official marketplace auto-install |
| `tengu_plugin_disable_command` | Plugin disable command |
| `tengu_plugin_disabled_all_cli` | All plugins disabled via CLI |
| `tengu_plugin_disabled_cli` | Plugin disabled via CLI |
| `tengu_plugin_enable_command` | Plugin enable command |
| `tengu_plugin_enabled_cli` | Plugin enabled via CLI |
| `tengu_plugin_install_command` | Plugin install command |
| `tengu_plugin_installed` | Plugin installed |
| `tengu_plugin_installed_cli` | Plugin installed via CLI |
| `tengu_plugin_list_command` | Plugin list command |
| `tengu_plugin_uninstall_command` | Plugin uninstall command |
| `tengu_plugin_uninstalled_cli` | Plugin uninstalled via CLI |
| `tengu_plugin_update_command` | Plugin update command |
| `tengu_plugin_updated_cli` | Plugin updated via CLI |
| `tengu_skill_file_changed` | Skill file changed |
| `tengu_skill_loaded` | Skill loaded |
| `tengu_skill_tool_invocation` | Skill tool invocation |
| `tengu_skill_tool_slash_prefix` | Skill tool slash prefix |

### Remaining Flags

Configuration, feedback, CLI, and miscellaneous telemetry. See the binary scan output
for the complete list of all 605 flags.

| Flag | Purpose |
|------|---------|
| `tengu_auto_compact_setting_changed` | Auto-compact setting changed |
| `tengu_auto_connect_ide_changed` | Auto-connect IDE changed |
| `tengu_auto_install_ide_extension_changed` | Auto-install IDE extension changed |
| `tengu_chain_parent_cycle` | Agent chain parent cycle detection |
| `tengu_config_cache_stats` | Config cache stats |
| `tengu_config_changed` | Config changed |
| `tengu_config_lock_contention` | Config lock contention |
| `tengu_config_model_changed` | Config model changed |
| `tengu_config_parse_error` | Config parse error |
| `tengu_config_stale_write` | Config stale write |
| `tengu_headless_latency` | Headless mode latency tracking |
| `tengu_model_response_keyword_detected` | Response keyword detection |
| `tengu_model_whitespace_response` | Model whitespace-only response |
| `tengu_opus_46_notice_shown` | Opus 4.6 notice shown |
| `tengu_opus46_feed_shown` | Opus 4.6 feed shown |
| `tengu_opus46_upgrade_nudge_shown` | Opus 4.6 upgrade nudge |
| `tengu_reduce_motion_setting_changed` | Reduce motion accessibility setting |
| `tengu_sonnet_1m_notice_shown` | Sonnet 1M notice shown |
| `tengu_tst_names_in_messages` | Test names in messages |
| `tengu_transcript_parent_cycle` | Transcript parent cycle |
| `tengu_watched_file_compression_failed` | Watched file compression failed |
| `tengu_watched_file_stat_error` | Watched file stat error |

---

## Flag Occurrence Analysis

Flags with high occurrence counts (many references in the binary) are typically telemetry
events logged from multiple code paths. Flags with low counts (1-3) are more likely to be
feature gates checked in a single location.

| Occurrences | Flag | Likely Type |
|-------------|------|-------------|
| 63 | `tengu_bash_security_check_triggered` | Telemetry (hot path) |
| 33 | `tengu_install_github_app_step_completed` | Telemetry |
| 23 | `tengu_plan_exit` | Telemetry |
| 18 | `tengu_marble_kite` | Gate (high for gate — active A/B test?) |
| 12 | `tengu_system_prompt_global_cache` | Gate (multi-reference) |
| 9 | `tengu_tst_kx7` | Gate/experiment |
| 6 | `tengu_session_memory` | Gate |
| 3 | `tengu_amber_flint` | Gate (typical) |
| 3 | `tengu_oboe` | Gate (typical) |

## Discovering New Flags

```bash
# Scan binary for all tengu_* flags
strings "$(which claude)" | grep -oE "tengu_[a-z0-9_]+" | sort -u

# Compare against baseline
claude-patcher gates scan

# Count occurrences (high = telemetry, low = gate)
strings "$(which claude)" | grep -oE "tengu_[a-z0-9_]+" | sort | uniq -c | sort -rn
```

## See Also

- [FEATURE-GATES.md](FEATURE-GATES.md) — Patchable feature gates reference
- [ENV-VARS.md](ENV-VARS.md) — Complete environment variable reference
