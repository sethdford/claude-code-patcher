# Tengu Flags — Complete Reference

> All 572 `tengu_*` flags extracted from the Claude Code binary, organized by category.

Tengu flags are [Statsig](https://statsig.com/) identifiers used for feature gating,
telemetry, and experimentation in Claude Code. Most are telemetry event names;
a small subset (the "codename-style" gates) control feature availability.

## Feature Gates (Codename-style)

These opaque, randomly-named flags are Statsig feature gates that enable or disable
functionality. Their names reveal nothing about purpose — they must be
reverse-engineered from the binary.

| Flag | Codename | Patchable? | Purpose |
|------|----------|------------|---------|
| `tengu_brass_pebble` | swarm-mode | Yes | Swarm/TeammateTool/delegate gate |
| `tengu_marble_anvil` | marble-anvil | No | Unknown feature gate |
| `tengu_marble_kite` | marble-kite | No | Unknown feature gate |
| `tengu_coral_fern` | coral-fern | No | Unknown feature gate |
| `tengu_quiet_fern` | quiet-fern | No | Unknown feature gate |
| `tengu_plank_river_frost` | plank-river-frost | No | Unknown feature gate |
| `tengu_quartz_lantern` | quartz-lantern | No | Unknown feature gate |
| `tengu_scarf_coffee` | scarf-coffee | No | Unknown feature gate |
| `tengu_cache_plum_violet` | cache-plum-violet | No | Cache feature |
| `tengu_flicker` | flicker | No | Unknown feature gate |
| `tengu_tool_pear` | tool-pear | No | Unknown feature gate |
| `tengu_cork_m4q` | cork-m4q | No | Unknown feature gate |
| `tengu_tst_kx7` | tst-kx7 | No | Unknown/test gate |
| `tengu_plum_vx3` | plum-vx3 | No | Unknown feature gate |
| `tengu_kv7_prompt_sort` | kv7-prompt-sort | No | Prompt sorting feature |
| `tengu_workout` | workout | No | Unknown feature gate |

## API & Networking

Flags related to API communication, retries, and error handling.

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
| `tengu_headless_latency` | Headless mode latency tracking |
| `tengu_model_fallback_triggered` | Model fallback event |
| `tengu_model_response_keyword_detected` | Response keyword detection |
| `tengu_prompt_cache_break` | Prompt cache break event |
| `tengu_rate_limit_options_menu_cancel` | Rate limit menu cancel |
| `tengu_rate_limit_options_menu_select_extra_usage` | Extra usage selection |
| `tengu_rate_limit_options_menu_select_upgrade` | Upgrade selection |
| `tengu_refusal_api_response` | API refusal response |
| `tengu_remote_backend` | Remote backend flag |
| `tengu_remote_create_session` | Remote session creation |
| `tengu_remote_create_session_error` | Remote session error |
| `tengu_remote_create_session_success` | Remote session success |
| `tengu_speculation` | Speculative execution flag |
| `tengu_max_tokens_context_overflow_adjustment` | Token overflow adjustment |
| `tengu_max_tokens_reached` | Max tokens reached |

## OAuth & Authentication

OAuth flow events, token management, and keychain operations.

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

## Tool Usage

Permission checks, execution tracking, and tool result handling.

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

## MCP (Model Context Protocol)

MCP server connections, tool calls, and OAuth for MCP.

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

## Session & Persistence

Session memory, resumption, branching, and tagging.

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

## File Operations

File history, snapshots, and change tracking.

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
| `tengu_watched_file_compression_failed` | Watched file compression failed |
| `tengu_watched_file_stat_error` | Watched file stat error |

## Compact/Summarization

Auto-compaction, cache sharing, and context management.

| Flag | Purpose |
|------|---------|
| `tengu_compact` | Compact event |
| `tengu_compact_cache_prefix` | Compact cache prefix |
| `tengu_compact_cache_sharing_fallback` | Cache sharing fallback |
| `tengu_compact_cache_sharing_success` | Cache sharing success |
| `tengu_compact_failed` | Compact failed |
| `tengu_compact_streaming_retry` | Compact streaming retry |
| `tengu_microcompact` | Micro-compaction event |
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

## Native Binary & Updates

Binary installation, auto-updates, and version management.

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

## Agent & Swarm

Agent creation, tools, and stop hooks.

| Flag | Purpose |
|------|---------|
| `tengu_agent_color_set` | Agent color set |
| `tengu_agent_created` | Agent created |
| `tengu_agent_definition_generated` | Agent definition generated |
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

## IDE/Extensions

Extension events, VS Code integration, and IDE commands.

| Flag | Purpose |
|------|---------|
| `tengu_ext_at_mentioned` | Extension at-mentioned |
| `tengu_ext_diff_accepted` | Extension diff accepted |
| `tengu_ext_diff_rejected` | Extension diff rejected |
| `tengu_ext_ide_command` | Extension IDE command |
| `tengu_ext_install_error` | Extension install error |
| `tengu_ext_installed` | Extension installed |
| `tengu_ext_will_show_diff` | Extension will show diff |
| `tengu_ide_` | IDE event (partial) |
| `tengu_vscode_` | VS Code event (partial) |
| `tengu_vscode_onboarding` | VS Code onboarding |
| `tengu_vscode_review_upsell` | VS Code review upsell |
| `tengu_external_editor_hint_shown` | External editor hint shown |
| `tengu_external_editor_used` | External editor used |
| `tengu_chrome_auto_enable` | Chrome auto-enable |
| `tengu_claude_in_chrome_onboarding_shown` | Claude in Chrome onboarding shown |
| `tengu_claude_in_chrome_setting_changed` | Claude in Chrome setting changed |
| `tengu_claude_in_chrome_setup` | Claude in Chrome setup |
| `tengu_claude_in_chrome_setup_failed` | Claude in Chrome setup failed |

## Permissions & Security

Permission prompts, bypass modes, and trust dialogs.

| Flag | Purpose |
|------|---------|
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

## Configuration

Settings changes, parsing, and locking.

| Flag | Purpose |
|------|---------|
| `tengu_auto_compact_setting_changed` | Auto-compact setting changed |
| `tengu_auto_connect_ide_changed` | Auto-connect IDE changed |
| `tengu_auto_install_ide_extension_changed` | Auto-install IDE extension changed |
| `tengu_config_cache_stats` | Config cache stats |
| `tengu_config_changed` | Config changed |
| `tengu_config_lock_contention` | Config lock contention |
| `tengu_config_model_changed` | Config model changed |
| `tengu_config_parse_error` | Config parse error |
| `tengu_config_stale_write` | Config stale write |
| `tengu_managed_settings_loaded` | Managed settings loaded |
| `tengu_managed_settings_security_dialog_accepted` | Managed settings accepted |
| `tengu_managed_settings_security_dialog_rejected` | Managed settings rejected |
| `tengu_managed_settings_security_dialog_shown` | Managed settings shown |
| `tengu_sm_config` | Session memory config |
| `tengu_version_config` | Version config |

## CLI Input/Output

User input modes, display styles, and output formatting.

| Flag | Purpose |
|------|---------|
| `tengu_input_background` | Input background mode |
| `tengu_input_bash` | Input bash mode |
| `tengu_input_command` | Input command mode |
| `tengu_input_prompt` | Input prompt mode |
| `tengu_input_slash_invalid` | Invalid slash command |
| `tengu_input_slash_missing` | Missing slash command |
| `tengu_output_style_changed` | Output style changed |
| `tengu_output_style_command_inline` | Output style inline command |
| `tengu_output_style_command_inline_help` | Output style inline help |
| `tengu_output_style_command_menu` | Output style menu |
| `tengu_context_size` | Context size event |
| `tengu_context_window_exceeded` | Context window exceeded |
| `tengu_empty_model_response` | Empty model response |
| `tengu_paste_image` | Image paste |
| `tengu_paste_text` | Text paste |
| `tengu_pasted_image_resize_attempt` | Pasted image resize |
| `tengu_single_word_prompt` | Single word prompt |

## Onboarding & Setup

First-run setup, GitHub Actions, and installation.

| Flag | Purpose |
|------|---------|
| `tengu_began_setup` | Setup began |
| `tengu_claude_install_command` | Claude install command |
| `tengu_onboarding_step` | Onboarding step |
| `tengu_setup_github_actions_completed` | GitHub Actions setup completed |
| `tengu_setup_github_actions_failed` | GitHub Actions setup failed |
| `tengu_setup_github_actions_started` | GitHub Actions setup started |
| `tengu_setup_token_command` | Setup token command |
| `tengu_install_github_app_completed` | GitHub App install completed |
| `tengu_install_github_app_error` | GitHub App install error |
| `tengu_install_github_app_started` | GitHub App install started |
| `tengu_install_github_app_step_completed` | GitHub App install step completed |
| `tengu_install_slack_app_clicked` | Slack app install clicked |

## Plugins & Skills

Plugin management, skill loading, and dynamic features.

| Flag | Purpose |
|------|---------|
| `tengu_dynamic_skills_changed` | Dynamic skills changed |
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
| `tengu_marketplace_added` | Marketplace item added |
| `tengu_marketplace_removed` | Marketplace item removed |
| `tengu_marketplace_updated` | Marketplace item updated |
| `tengu_marketplace_updated_all` | All marketplace items updated |
| `tengu_official_marketplace_auto_install` | Official marketplace auto-install |

## Teleport

Session teleportation, branching, and cross-repo session sharing.

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

## Streaming

Stream errors, tool execution, and stall detection.

| Flag | Purpose |
|------|---------|
| `tengu_stream_no_events` | Stream no events |
| `tengu_streaming_error` | Streaming error |
| `tengu_streaming_fallback_to_non_streaming` | Streaming fallback |
| `tengu_streaming_stall` | Streaming stall |
| `tengu_streaming_stall_summary` | Streaming stall summary |
| `tengu_streaming_tool_execution_not_used` | Streaming tool exec not used |
| `tengu_streaming_tool_execution_used` | Streaming tool exec used |
| `tengu_streaming_tool_execution2` | Streaming tool execution v2 |

## Hooks

Pre/post tool hooks and lifecycle events.

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

## Feedback & Surveys

User feedback, acceptance, and rejection events.

| Flag | Purpose |
|------|---------|
| `tengu_accept_feedback_mode_collapsed` | Accept feedback collapsed |
| `tengu_accept_feedback_mode_entered` | Accept feedback entered |
| `tengu_accept_submitted` | Accept submitted |
| `tengu_reject_feedback_mode_collapsed` | Reject feedback collapsed |
| `tengu_reject_feedback_mode_entered` | Reject feedback entered |
| `tengu_reject_submitted` | Reject submitted |
| `tengu_feedback_survey_config` | Feedback survey config |
| `tengu_feedback_survey_event` | Feedback survey event |

## Miscellaneous

Remaining flags: bash, git, cost, settings, and other events.

| Flag | Purpose |
|------|---------|
| `tengu_1p_event_batch_config` | 1P event batch config |
| `tengu_ask_user_question_accepted` | Ask user question accepted |
| `tengu_ask_user_question_finish_plan_interview` | Finish plan interview |
| `tengu_ask_user_question_rejected` | Ask user question rejected |
| `tengu_ask_user_question_respond_to_claude` | Respond to Claude |
| `tengu_at_mention_agent_not_found` | At-mention agent not found |
| `tengu_at_mention_agent_success` | At-mention agent success |
| `tengu_at_mention_extracting_directory_success` | At-mention directory extract |
| `tengu_at_mention_extracting_filename_error` | At-mention filename error |
| `tengu_at_mention_extracting_filename_success` | At-mention filename success |
| `tengu_at_mention_mcp_resource_error` | At-mention MCP resource error |
| `tengu_at_mention_mcp_resource_success` | At-mention MCP resource success |
| `tengu_atomic_write_error` | Atomic write error |
| `tengu_attachment_compute_duration` | Attachment compute duration |
| `tengu_attachment_file_too_large` | Attachment file too large |
| `tengu_attachments` | Attachments event |
| `tengu_bash_command_explicitly_backgrounded` | Bash command backgrounded |
| `tengu_bash_command_timeout_backgrounded` | Bash timeout backgrounded |
| `tengu_bash_prefix` | Bash prefix event |
| `tengu_bash_security_check_triggered` | Bash security check |
| `tengu_bash_tool_command_executed` | Bash tool command executed |
| `tengu_bash_tool_haiku_file_paths_read` | Bash tool haiku file paths |
| `tengu_bash_tool_reset_to_original_dir` | Bash tool reset to original dir |
| `tengu_bash_tool_simple_echo` | Bash tool simple echo |
| `tengu_bug_report_submitted` | Bug report submitted |
| `tengu_c4w_usage_limit_notifications_enabled` | C4W usage limit notifications |
| `tengu_cancel` | Cancel event |
| `tengu_claude_md_external_includes_dialog_accepted` | CLAUDE.md external includes accepted |
| `tengu_claude_md_external_includes_dialog_declined` | CLAUDE.md external includes declined |
| `tengu_claude_md_includes_dialog_shown` | CLAUDE.md includes dialog shown |
| `tengu_claude_md_permission_error` | CLAUDE.md permission error |
| `tengu_claude_rules_md_permission_error` | Claude rules permission error |
| `tengu_claudeai_limits_status_changed` | Claude.ai limits status changed |
| `tengu_claudeai_mcp_auth_completed` | Claude.ai MCP auth completed |
| `tengu_claudeai_mcp_auth_started` | Claude.ai MCP auth started |
| `tengu_claudeai_mcp_clear_auth_completed` | Claude.ai MCP clear auth completed |
| `tengu_claudeai_mcp_clear_auth_started` | Claude.ai MCP clear auth started |
| `tengu_claudeai_mcp_connectors` | Claude.ai MCP connectors |
| `tengu_claudeai_mcp_eligibility` | Claude.ai MCP eligibility |
| `tengu_claudeai_mcp_reconnect` | Claude.ai MCP reconnect |
| `tengu_claudeai_mcp_toggle` | Claude.ai MCP toggle |
| `tengu_code_change_view_opened` | Code change view opened |
| `tengu_code_diff_cli` | Code diff CLI |
| `tengu_code_diff_footer_setting_changed` | Code diff footer setting changed |
| `tengu_code_indexing_tool_used` | Code indexing tool used |
| `tengu_code_prompt_ignored` | Code prompt ignored |
| `tengu_concurrent_onquery_detected` | Concurrent onQuery detected |
| `tengu_concurrent_onquery_enqueued` | Concurrent onQuery enqueued |
| `tengu_continue` | Continue event |
| `tengu_continue_print` | Continue print |
| `tengu_conversation_forked` | Conversation forked |
| `tengu_cost_threshold_acknowledged` | Cost threshold acknowledged |
| `tengu_cost_threshold_reached` | Cost threshold reached |
| `tengu_custom_keybindings_loaded` | Custom keybindings loaded |
| `tengu_diff_tool_changed` | Diff tool changed |
| `tengu_dir_search` | Directory search |
| `tengu_doctor_command` | Doctor command |
| `tengu_editor_mode_changed` | Editor mode changed |
| `tengu_event_sampling_config` | Event sampling config |
| `tengu_exit` | Exit event |
| `tengu_filtered_orphaned_thinking_message` | Filtered orphaned thinking |
| `tengu_filtered_trailing_thinking_block` | Filtered trailing thinking |
| `tengu_fixed_empty_assistant_content` | Fixed empty assistant content |
| `tengu_git_index_lock_error` | Git index lock error |
| `tengu_git_operation` | Git operation |
| `tengu_grove_policy_dismissed` | Grove policy dismissed |
| `tengu_grove_policy_escaped` | Grove policy escaped |
| `tengu_grove_policy_exited` | Grove policy exited |
| `tengu_grove_policy_submitted` | Grove policy submitted |
| `tengu_grove_policy_toggled` | Grove policy toggled |
| `tengu_grove_policy_viewed` | Grove policy viewed |
| `tengu_grove_print_viewed` | Grove print viewed |
| `tengu_grove_privacy_settings_viewed` | Grove privacy settings viewed |
| `tengu_guest_passes_link_copied` | Guest passes link copied |
| `tengu_guest_passes_upsell_shown` | Guest passes upsell shown |
| `tengu_guest_passes_visited` | Guest passes visited |
| `tengu_help_toggled` | Help toggled |
| `tengu_image_api_validation_failed` | Image API validation failed |
| `tengu_image_compress_failed` | Image compress failed |
| `tengu_image_resize_failed` | Image resize failed |
| `tengu_image_resize_fallback` | Image resize fallback |
| `tengu_init` | Init event |
| `tengu_keybinding_customization_release` | Keybinding customization release |
| `tengu_keybinding_fallback_used` | Keybinding fallback used |
| `tengu_language_changed` | Language changed |
| `tengu_log_datadog_events` | Log Datadog events |
| `tengu_log_segment_events` | Log Segment events |
| `tengu_message_selector_cancelled` | Message selector cancelled |
| `tengu_message_selector_opened` | Message selector opened |
| `tengu_message_selector_restore_option_selected` | Message restore option |
| `tengu_message_selector_selected` | Message selector selected |
| `tengu_migrate_autoupdates_error` | Migrate auto-updates error |
| `tengu_migrate_autoupdates_to_settings` | Migrate auto-updates to settings |
| `tengu_migrate_ignore_patterns_config_cleanup_error` | Migrate ignore patterns cleanup error |
| `tengu_migrate_ignore_patterns_error` | Migrate ignore patterns error |
| `tengu_migrate_ignore_patterns_success` | Migrate ignore patterns success |
| `tengu_migrate_mcp_approval_fields_error` | Migrate MCP approval error |
| `tengu_migrate_mcp_approval_fields_success` | Migrate MCP approval success |
| `tengu_mode_cycle` | Mode cycle |
| `tengu_model_command_inline` | Model command inline |
| `tengu_model_command_inline_help` | Model command inline help |
| `tengu_model_command_menu` | Model command menu |
| `tengu_model_command_menu_effort` | Model command menu effort |
| `tengu_model_picker_hotkey` | Model picker hotkey |
| `tengu_node_warning` | Node warning |
| `tengu_notification_method_used` | Notification method used |
| `tengu_off_switch_query` | Off switch query |
| `tengu_opus_45_notice_shown` | Opus 4.5 notice shown |
| `tengu_opus45_upgrade_nudge_shown` | Opus 4.5 upgrade nudge shown |
| `tengu_orphaned_messages_tombstoned` | Orphaned messages tombstoned |
| `tengu_pdf_page_extraction` | PDF page extraction |
| `tengu_pid_based_version_locking` | PID-based version locking |
| `tengu_plan_enter` | Plan mode enter |
| `tengu_plan_exit` | Plan mode exit |
| `tengu_plan_external_editor_used` | Plan external editor used |
| `tengu_plan_mode_interview_phase` | Plan mode interview phase |
| `tengu_plan_remote_eligibility_failed` | Plan remote eligibility failed |
| `tengu_plan_remote_git_dialog` | Plan remote git dialog |
| `tengu_plan_remote_session_failed` | Plan remote session failed |
| `tengu_pr_status_cli` | PR status CLI |
| `tengu_pr_status_footer_setting_changed` | PR status footer setting changed |
| `tengu_preflight_check_failed` | Preflight check failed |
| `tengu_prompt_suggestion` | Prompt suggestion |
| `tengu_prompt_suggestion_init` | Prompt suggestion init |
| `tengu_query_after_attachments` | Query after attachments |
| `tengu_query_before_attachments` | Query before attachments |
| `tengu_query_error` | Query error |
| `tengu_react_vulnerability_notice_shown` | React vulnerability notice |
| `tengu_react_vulnerability_warning` | React vulnerability warning |
| `tengu_respect_gitignore_setting_changed` | Respect gitignore changed |
| `tengu_resume_print` | Resume print |
| `tengu_ripgrep_availability` | Ripgrep availability |
| `tengu_ripgrep_eagain_retry` | Ripgrep EAGAIN retry |
| `tengu_scratch` | Scratch/working memory |
| `tengu_settings_sync_download_empty` | Settings sync empty |
| `tengu_settings_sync_download_error` | Settings sync error |
| `tengu_settings_sync_download_fetch_failed` | Settings sync fetch failed |
| `tengu_settings_sync_download_skipped` | Settings sync skipped |
| `tengu_settings_sync_download_success` | Settings sync success |
| `tengu_shell_completion_failed` | Shell completion failed |
| `tengu_shell_set_cwd` | Shell set CWD |
| `tengu_shell_snapshot_error` | Shell snapshot error |
| `tengu_shell_snapshot_failed` | Shell snapshot failed |
| `tengu_shell_unknown_error` | Shell unknown error |
| `tengu_slash_command_forked` | Slash command forked |
| `tengu_sonnet_1m_notice_shown` | Sonnet 1M notice shown |
| `tengu_startup_manual_model_config` | Startup manual model config |
| `tengu_startup_perf` | Startup performance |
| `tengu_startup_telemetry` | Startup telemetry |
| `tengu_status_line_mount` | Status line mount |
| `tengu_stdin_interactive` | STDIN interactive |
| `tengu_structured_output_enabled` | Structured output enabled |
| `tengu_structured_output_failure` | Structured output failure |
| `tengu_switch_to_subscription_notice_shown` | Switch to subscription notice |
| `tengu_sysprompt_block` | System prompt block |
| `tengu_sysprompt_boundary_found` | System prompt boundary found |
| `tengu_sysprompt_missing_boundary_marker` | Missing boundary marker |
| `tengu_sysprompt_no_stable_tool_for_cache` | No stable tool for cache |
| `tengu_sysprompt_using_tool_based_cache` | Using tool-based cache |
| `tengu_system_prompt_global_cache` | System prompt global cache |
| `tengu_tag_command_add` | Tag command add |
| `tengu_tag_command_remove_cancelled` | Tag command remove cancelled |
| `tengu_tag_command_remove_confirmed` | Tag command remove confirmed |
| `tengu_tag_command_remove_prompt` | Tag command remove prompt |
| `tengu_terminal_progress_bar_setting_changed` | Terminal progress bar changed |
| `tengu_thinkback` | Thinkback feature |
| `tengu_thinking` | Thinking event |
| `tengu_thinking_toggled` | Thinking toggled |
| `tengu_thinking_toggled_hotkey` | Thinking toggled via hotkey |
| `tengu_timer` | Timer event |
| `tengu_tip_shown` | Tip shown |
| `tengu_tips_setting_changed` | Tips setting changed |
| `tengu_toggle_todos` | Toggle todos |
| `tengu_toggle_transcript` | Toggle transcript |
| `tengu_transcript_accessed` | Transcript accessed |
| `tengu_transcript_exit` | Transcript exit |
| `tengu_transcript_input_to_teammate` | Transcript input to teammate |
| `tengu_transcript_toggle_show_all` | Transcript toggle show all |
| `tengu_transcript_view_enter` | Transcript view enter |
| `tengu_transcript_view_exit` | Transcript view exit |
| `tengu_tree_sitter_load` | Tree-sitter load |
| `tengu_unary_event` | Unary event |
| `tengu_uncaught_exception` | Uncaught exception |
| `tengu_unhandled_rejection` | Unhandled rejection |
| `tengu_unknown_model_cost` | Unknown model cost |
| `tengu_update_check` | Update check |
| `tengu_version_check_failure` | Version check failure |
| `tengu_version_check_success` | Version check success |
| `tengu_version_lock_acquired` | Version lock acquired |
| `tengu_version_lock_failed` | Version lock failed |
| `tengu_worktree_detection` | Worktree detection |
| `tengu_write_claudemd` | Write CLAUDE.md |

---

## Discovering New Flags

```bash
# Compare current binary against baseline
./scripts/flag-monitor.sh

# Update baseline after Claude Code update
./scripts/flag-monitor.sh --update

# Scan via patcher CLI (portable, no `strings` needed)
claude-patcher gates scan
```

## See Also

- [FEATURE-GATES.md](FEATURE-GATES.md) — Patchable feature gates reference
- [NATIVE-INTEGRATION.md](../claude-fleet/docs/NATIVE-INTEGRATION.md) — Native multi-agent integration
