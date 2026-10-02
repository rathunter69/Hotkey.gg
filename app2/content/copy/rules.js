// app2/content/copy/rules.js — the vocabulary the copy checks and the screens agree on.
// RIBBON_WORDS: a goal that names one of these names something visible (R4). SITE_KEYS: the
// site.csv keys the screens read (R11 warns when one is missing; the screen keeps its built-in line).

export const RIBBON_WORDS = [
  'Ribbon', 'KeyTips?', 'Home tab', 'View tab', 'File tab', 'Format Cells', 'Rename Sheet', 'Delete Sheet', 'Move or Copy', 'Insert Sheet',
  'Go To Special', 'Go To', 'Find', 'Replace', 'Paste Special', 'Fill Series', 'AutoSum', 'AutoFit', 'Freeze Panes', 'Page Setup', 'Excel Options',
  'Quick Access Toolbar', 'QAT', 'Name Box', 'formula bar', 'Font Color', 'Gridlines', 'Bold', 'Italic', 'Underline', 'Borders?', 'Fill', 'Wrap',
  'Center Across Selection', 'Number tab', 'Increase Decimal', 'Decrease Decimal', 'Fill Color', 'Constants', 'Formulas', 'Blanks', 'Calculation', 'Automatic', 'Manual', 'Iterative', 'Alignment', 'Group', 'Ungroup', 'Hide', 'Unhide', 'Undo', 'Redo', 'Options', 'tab', 'sheet', 'row', 'column', 'header', 'title', 'total',
];

export const SITE_KEYS = [
  // R8: Teams desks and the join page (Phase F desks v1)
  'boards_desk_open', 'boards_desk_code', 'teams_desk_head', 'teams_by_hand', 'teams_row_1', 'teams_row_2', 'teams_row_3', 'teams_row_4', 'teams_talk_line', 'teams_how_head', 'teams_how_1_k', 'teams_how_1', 'teams_how_2_k', 'teams_how_2', 'teams_how_3_k', 'teams_how_3', 'teams_how_4_k', 'teams_how_4', 'teams_your_desk', 'teams_code_signin', 'desk_title', 'desk_mark', 'desk_signed_out', 'desk_none', 'desk_failed', 'desk_teams_head', 'desk_teams_line', 'desk_teams_link', 'desk_code_head', 'desk_code_label', 'desk_code_go', 'desk_join_title', 'desk_join_owner_k', 'desk_join_seats_k', 'desk_join_until_k', 'desk_join_line', 'desk_join_go', 'desk_join_signin', 'desk_join_signin_line', 'desk_joined', 'desk_sees_head', 'desk_sees_1', 'desk_sees_2', 'desk_sees_3', 'desk_sees_4', 'desk_sees_not', 'desk_seats_used', 'desk_until', 'desk_seats_head', 'desk_col_lessons', 'desk_col_verified', 'desk_col_active', 'desk_role_owner', 'desk_you', 'desk_free_seat', 'desk_free_confirm', 'desk_freed', 'desk_seat_left', 'desk_seats_left', 'desk_seats_full', 'desk_seats_line', 'desk_invite_head', 'desk_invite_line', 'desk_copy_link', 'desk_copied', 'desk_copy_blocked', 'desk_new_code', 'desk_new_code_line', 'desk_new_code_done', 'desk_members_head', 'desk_leave', 'desk_leave_confirm', 'desk_leave_line', 'desk_left', 'desk_board_head', 'desk_active_today', 'desk_active_yesterday', 'desk_active_days', 'desk_active_never', 'desk_err_bad_code', 'desk_err_tries', 'desk_err_ended', 'desk_err_on_desk', 'desk_err_full', 'desk_err_signin', 'desk_err_not_on', 'desk_err_not_owner', 'desk_err_owner_stays', 'desk_err_no_member', 'desk_err_failed', 'teams_title', 'teams_sub', 'teams_code_head',
  // the interface match (2026-10-02)
  'certificate_name', 'certificate_course', 'certificate_progress',
  // the interface match (2026-10-02)
  'save_line_ch1',
  // the interface match (2026-10-02)
  'ref_board_hint', 'ref_open_lesson', 'ref_no_key', 'ref_board', 'ref_leg_open', 'ref_leg_got',
  // the interface match (2026-10-02)
  'pricing_line', 'pricing_sheet_head', 'pricing_col_what', 'pricing_row_play', 'pricing_row_cert', 'pricing_included', 'pricing_not_included',
  // the interface match (2026-10-02)
  'settings_look_line', 'settings_game_head', 'settings_game_line', 'setting_on', 'setting_off', 'theme_light', 'theme_dark',
  // the interface match (2026-10-02)
  'ach_hidden_name', 'ach_hidden_desc', 'rarity_common', 'rarity_rare', 'rarity_epic', 'rarity_legendary', 'profile_guest', 'profile_lessons', 'profile_drills_pass', 'profile_dailies', 'profile_best_daily', 'col_level', 'col_title', 'col_reward', 'profile_levels', 'profile_you_are', 'profile_levels_line', 'profile_account_link', 'cert_next_done', 'cert_next_writing', 'cert_next_assess', 'cert_next_lessons', 'cert_next_lessons_one', 'cert_issued', 'cert_not_yet', 'cert_awarded_to', 'cert_you', 'cert_issued_at', 'cert_see', 'cert_verified_time', 'cert_verified', 'cert_ready', 'cert_lessons', 'cert_next_k', 'cert_go', 'cert_earn_head', 'cert_earn_1', 'cert_earn_2', 'cert_earn_3', 'cert_how',
  // the interface match (2026-10-02)
  'rapid_len_short_30', 'rapid_len_short_60', 'rapid_len_short_120', 'col_command', 'col_keys_press',
  // the interface match (2026-10-02)
  'home_tour',
  // the interface match (2026-10-02)
  'coach_done', 'signin_head', 'signin_line', 'signin_google', 'signin_fine',
  // R9: form consents and the age statement
  'consent_account', 'consent_terms_link', 'consent_privacy_link', 'consent_email_use', 'consent_age', 'consent_teams',
  // the interface match (2026-10-02)
  'first_run_free_k', 'first_run_free', 'first_run_full', 'first_run_save', 'first_run_tour', 'orientation_pro', 'orientation_account',
  // the interface match (2026-10-02)
  'daily_today', 'daily_not_clean', 'daily_missed', 'daily_week', 'daily_week_played', 'daily_keys', 'daily_rules', 'save_line_boards',
  // the interface match (2026-10-02)
  'boards_clean_runs_one', 'boards_day_runs_one',
  // the interface match (2026-10-02)
  'challenges_passed',
  // the interface match (2026-10-02)
  'challenges_intro',
  // the interface match (2026-10-02)
  'rapid_start_len', 'rapid_lengths', 'rapid_keys_hint', 'rapid_deck', 'rapid_deck_n', 'rapid_how', 'rapid_how_1', 'rapid_how_2', 'rapid_how_3',
  // the interface match (2026-10-02)
  'home_xp_why', 'save_title', 'save_line', 'save_go',
  // the interface match (2026-10-02)
  'learn_keys_n',
  // the interface match (2026-10-02)
  'practice_chapter_coming',
  // the interface match (2026-10-02)
  'learn_free', 'learn_being_written', 'learn_up_next', 'learn_reward', 'learn_reward_earned',
  // the interface match (2026-10-02)
  'home_xp_to_go',
  'briefing_1_eyebrow', 'briefing_1_title', 'briefing_1_body',
  'briefing_2_eyebrow', 'briefing_2_title', 'briefing_2_body',
  'briefing_3_eyebrow', 'briefing_3_title', 'briefing_3_body',
  'orientation_eyebrow', 'orientation_title', 'orientation_learn', 'orientation_practice', 'orientation_leaderboard', 'orientation_level', 'orientation_fine',
  'first_run_demo_title', 'first_run_demo_body', 'first_run_exp_new', 'first_run_exp_sometimes', 'first_run_exp_daily',
  'landing_headline', 'landing_subhead', 'landing_start_note', 'demo_done', 'demo_play', 'demo_aria',
  'mode_lesson', 'mode_challenge', 'mode_drill', 'mode_daily', 'mode_rapid', 'mode_boards',
  'dash_learn', 'dash_practice',
  'deal_strip_stage_1', 'deal_strip_deliverable_1',
  'save_nudge', 'due_empty', 'due_foot', 'due_fresh',
  'tab_keys_note', 'lesson_nudge', 'lesson_nudge_help', 'lesson_show_me_playing', 'lesson_sheet_off', 'lesson_mouse',
  'lesson_done', 'lesson_done_project', 'lesson_done_verified', 'lesson_clean', 'lesson_assisted', 'page_delivered', 'lesson_first_saved', 'install_prompt',
  'times_up', 'times_up_note', 'over_limit', 'over_limit_assessment', 'review_clean', 'review_flag',
  'learn_testout', 'learn_verified', 'learn_replay',
  'drill_finished_assisted', 'drill_help_used', 'drill_mouse_used', 'drill_daily_attempt', 'rapid_intro', 'rapid_fine',
  'boards_closed', 'boards_desk_prompt', 'account_guest', 'paywall_line', 'paywall_signed_in',
  // the rail, the level table and the settings table (R1b: M88, M101, M103)
  'rail_home', 'rail_learn', 'rail_practice', 'rail_daily', 'rail_drills', 'rail_rapid', 'rail_challenges', 'rail_boards', 'rail_reference',
  'rail_level', 'rail_xp', 'rail_streak', 'rail_streak_none', 'rail_go_pro', 'rail_account', 'rail_sign_in', 'rail_guest', 'rail_profile',
  'rail_settings', 'rail_billing', 'rail_certificate', 'rail_sign_out', 'rail_menu', 'rail_week_days', 'level_title_new_workbook',
  'level_title_arrow_keys', 'level_title_ctrl_arrow', 'level_title_mouse_retired', 'level_title_alt_native', 'level_title_chord_player',
  'level_title_live_links', 'level_title_ties_out', 'level_title_model_owner', 'level_title_hard_clock', 'level_title_top_bucket',
  'level_reward_themes_start', 'level_reward_theme', 'level_reward_crimson', 'level_reward_profile_frame', 'level_reward_ghost_trail',
  'level_reward_keycap_skin', 'level_reward_board_flair', 'level_reward_cursor_color', 'level_reward_panel_style',
  'level_up_title', 'level_up_reward', 'level_next', 'settings_group_keyboard', 'settings_group_lessons', 'settings_group_practice',
  'settings_group_appearance', 'settings_group_sound', 'settings_group_email', 'settings_group_account', 'setting_keyLabels',
  'setting_keyLabels_help', 'setting_keyLabels_win', 'setting_keyLabels_mac', 'setting_layout', 'setting_layout_us', 'setting_layout_uk',
  'setting_layout_other', 'setting_ribbonLessons', 'setting_ribbonLessons_help', 'setting_ribbonLessons_full', 'setting_ribbonLessons_tabs',
  'setting_ribbonDrills', 'setting_ribbonDrills_full', 'setting_ribbonDrills_tabs', 'setting_siteKeyTips', 'setting_siteKeyTips_help',
  'setting_cardSide', 'setting_cardSide_help', 'setting_cardSide_auto', 'setting_cardSide_left', 'setting_cardSide_right', 'setting_showKeys',
  'setting_showKeys_help', 'setting_showKeys_first', 'setting_showKeys_always', 'setting_nudge', 'setting_nudge_help', 'setting_nudge_8',
  'setting_nudge_15', 'setting_nudge_off', 'setting_demo', 'setting_demo_help', 'setting_setLength', 'setting_setLength_5', 'setting_setLength_10',
  'setting_setLength_20', 'setting_ghost', 'setting_ghost_help', 'setting_pace', 'setting_pace_help', 'setting_showOnBoards', 'setting_theme',
  'setting_theme_locked', 'setting_density', 'setting_density_comfortable', 'setting_density_compact', 'setting_sheetZoom', 'setting_sheetZoom_100',
  'setting_sheetZoom_110', 'setting_sheetZoom_125', 'setting_sound', 'setting_sound_help', 'setting_soundSet', 'setting_soundSet_default',
  'setting_effects', 'setting_effects_help', 'setting_effects_full', 'setting_effects_reduced', 'setting_effects_off', 'setting_dailyReminder',
  'setting_dailyReminder_help', 'setting_weeklySummary', 'setting_news', 'setting_handle', 'setting_certificateName', 'setting_certificateName_help',
  // the workspace chrome, the task card and the run panel (R1b: M90, M91, M93)
  'ws_back', 'ws_more', 'ws_sound_on', 'ws_sound_off', 'ws_goal_count', 'ws_task_count', 'ws_lesson_menu_hint', 'ws_close', 'ws_done', 'ws_esc_again', 'ws_sub_lesson',
  'ws_exit', 'ws_exit_hint', 'ws_sheet_keys', 'ws_sheet_keys_tip', 'ws_full_screen', 'ws_full_screen_tip', 'ws_focus_title', 'ws_focus_where', 'ws_focus_clock', 'more_exit',
  'leave_title', 'leave_body', 'leave_run_title', 'leave_run_body', 'leave_drill_title', 'leave_action', 'leave_stay', 'card_also_works', 'card_alt_or', 'card_live_try', 'card_live_works', 'panel_exit_ends',
  'ws_sub_challenge', 'ws_sub_item', 'ws_sub_drill', 'ws_sub_daily', 'ws_sub_due', 'ws_kind_project', 'ws_kind_assessment', 'ws_kind_testout', 'more_lessons',
  'more_restart', 'more_collapse', 'more_expand', 'more_move', 'more_report', 'restart_title', 'restart_body', 'restart_action', 'dialog_cancel', 'card_help',
  'card_hide', 'card_type', 'card_live_start', 'card_live_one', 'card_live_keys', 'card_live_done', 'card_live_wrong', 'card_live_mouse', 'card_live_mouse_help',
  'card_live_watch', 'card_live_demo', 'card_live_your_turn', 'card_live_doing', 'card_help_keys', 'card_help_once', 'card_help_do', 'card_help_clean', 'card_help_assisted',
  'card_help_none', 'card_card_hidden', 'card_side_right', 'card_side_left', 'card_side_below', 'card_side_above', 'card_side_auto', 'tier_pass', 'tier_expert',
  'tier_legendary', 'tier_none', 'panel_pace', 'panel_pace_behind', 'panel_best', 'panel_tasks', 'panel_about', 'panel_minutes', 'panel_minute', 'panel_seconds',
  'panel_press_any', 'panel_ready_foot', 'panel_ready_foot_assessment', 'panel_back', 'panel_keys_so_far', 'panel_esc_ends', 'panel_done_n', 'panel_more_after',
  'panel_all_done', 'panel_tasks_done', 'panel_new_best', 'panel_new_best_first', 'drill_finished', 'panel_no_time_help', 'panel_no_time_mouse', 'panel_xp_word',
  'panel_xp', 'panel_board', 'panel_board_today', 'panel_board_up', 'panel_board_down', 'panel_board_still', 'panel_equip', 'panel_quest', 'panel_quest_done',
  'panel_times', 'panel_once', 'panel_shortcuts', 'panel_shortcuts_n', 'panel_next_lesson', 'panel_next_drill', 'panel_next_due', 'panel_back_learn', 'panel_back_home',
  'panel_all_drills', 'panel_run_again', 'panel_run_again_fresh', 'panel_see_board', 'panel_try_again', 'panel_start_job', 'panel_look_sheet', 'panel_install',
  'panel_not_now', 'panel_create_account', 'panel_goals', 'panel_limit', 'panel_sheet_off', 'panel_daily_attempts', 'panel_copy_result', 'panel_result_copied',
  'panel_copy_blocked',
  'setting_signIn', 'setting_publicProfile', 'setting_exportData', 'setting_deleteAccount', 'landing_nav_pricing', 'landing_nav_teams',
  // Home, Learn, Practice and the boards (R1b: M89, M97, M104)
  'home_next_lesson', 'home_next_assessment', 'home_resume', 'home_start', 'home_start_assessment', 'home_lesson_of', 'home_goal_of', 'home_minutes_left', 'home_all_done', 'chapter_heading', 'chapter_modules_done', 'col_module', 'col_lesson', 'col_minutes', 'col_status', 'status_complete', 'status_lessons_done', 'status_in_progress', 'status_not_started', 'status_coming', 'status_done', 'status_skipped', 'status_verified', 'status_lesson_of', 'home_level', 'home_xp', 'home_next_reward', 'home_top_level', 'home_today', 'home_today_done', 'home_refreshers', 'home_seconds', 'quests_fresh', 'home_daily_row', 'home_daily_len', 'home_daily_played', 'home_daily_played_local', 'home_daily_help', 'home_xp_plus', 'home_streak_day', 'home_achievements', 'home_count_of', 'home_ach_next', 'paywall_go_pro', 'paywall_not_now', 'learn_tab', 'learn_page_fill', 'learn_page_built', 'learn_coming', 'practice_drills', 'practice_set_line', 'practice_set_line_one', 'practice_one_minute', 'practice_minutes', 'practice_set_none', 'practice_see_set', 'practice_hide_set', 'practice_start', 'practice_chapter_fact', 'col_drill', 'col_length', 'col_best', 'practice_not_played', 'practice_after', 'practice_pro', 'practice_set_heading', 'reason_due', 'reason_slowest', 'reason_newest', 'reason_next_tier', 'reason_fill', 'daily_title', 'daily_line', 'daily_play', 'daily_pro_note', 'daily_clean_runs', 'daily_not_played', 'rapid_title', 'rapid_len_30', 'rapid_len_60', 'rapid_len_120', 'rapid_start', 'rapid_best', 'col_hits', 'col_combo', 'rapid_none', 'challenges_title', 'challenges_line', 'challenges_fact', 'challenges_start', 'boards_title', 'boards_tab_daily', 'boards_tab_drills', 'boards_tab_challenges', 'boards_tab_desks', 'col_place', 'col_player', 'col_field', 'col_time', 'col_gap', 'col_keys', 'boards_keys_route', 'boards_up', 'boards_down', 'boards_clean_runs', 'boards_day_runs', 'boards_empty', 'boards_yours', 'boards_last_five', 'boards_where', 'boards_none_yet', 'boards_signed_out', 'boards_desks_signed_out', 'boards_desk_link', 'boards_loading', 'boards_failed', 'boards_retry', 'boards_pick',
  // the first run and the coach marks (M92), the landing page and the footer (M95), the paywall and pricing (M105), Reference (M106), Settings (M101)
  'orientation_home', 'orientation_reference', 'orientation_streak', 'coach_count', 'coach_next',
  'first_run_title', 'first_run_q_keyboard', 'first_run_q_experience', 'first_run_keyboard_win', 'first_run_keyboard_mac', 'first_run_fine', 'first_run_then', 'first_run_next', 'first_run_skip', 'first_run_start',
  'landing_start', 'landing_fact_lessons', 'landing_fact_challenges', 'landing_fact_hours',
  'landing_path_title', 'landing_hours', 'landing_free', 'landing_pro', 'landing_path_1_title', 'landing_path_1', 'landing_path_2_title', 'landing_path_2', 'landing_path_3_title', 'landing_path_3', 'landing_path_4_title', 'landing_path_4', 'landing_path_5_title', 'landing_path_5', 'landing_path_6_title', 'landing_path_6',
  'landing_pricing', 'landing_see_pricing', 'landing_return', 'landing_return_tail',
  'landing_demo_idle', 'landing_demo_still', 'landing_demo_focus', 'landing_demo_taken', 'landing_demo_failed',
  'landing_plate_drills_title', 'landing_plate_boards_title', 'landing_plate_boards_facts', 'landing_plate_boards_example', 'landing_plate_lesson_goal',
  'landing_show_label', 'landing_show_lesson_title', 'landing_show_lesson', 'landing_show_drills_title', 'landing_show_drills', 'landing_show_daily_title', 'landing_show_daily',
  'landing_strip_label', 'landing_ch_modules', 'landing_ch_lessons', 'landing_legend_lesson', 'landing_legend_challenge',
  'footer_pricing', 'footer_teams', 'footer_about', 'footer_contact', 'footer_privacy', 'footer_terms', 'footer_eula', 'footer_trademarks',
  'paywall_pro', 'paywall_go', 'paywall_chapter', 'paywall_this_lesson',
  'pricing_title', 'pricing_free', 'pricing_free_unit',
  'pricing_free_1', 'pricing_free_2', 'pricing_free_3', 'pricing_free_4', 'pricing_checkout_soon', 'pricing_money_back',
  'pricing_terms_title', 'pricing_term_1_name', 'pricing_term_1', 'pricing_term_2_name', 'pricing_term_2', 'pricing_term_3_name', 'pricing_term_3', 'pricing_term_4_name', 'pricing_term_4',
  'pricing_full', 'pricing_teams_col', 'pricing_recommended', 'pricing_full_figure', 'pricing_full_unit', 'pricing_full_student', 'pricing_teams_figure', 'pricing_teams_unit', 'pricing_teams_seats', 'pricing_full_1', 'pricing_full_2', 'pricing_full_3', 'pricing_full_4', 'pricing_teams_1', 'pricing_teams_2', 'pricing_teams_3', 'pricing_full_go', 'pricing_teams_go', 'pricing_teams_note', 'pricing_teams_subject', 'pricing_trust_cancel', 'pricing_trust_refund', 'pricing_trust_stripe', 'pricing_signed_in_note', 'paywall_price',
  'checkout_title', 'checkout_signin_head', 'checkout_signin_line', 'checkout_email', 'checkout_send_code', 'checkout_code', 'checkout_code_sent', 'checkout_verify', 'checkout_other_email', 'checkout_err_email', 'checkout_err_code', 'checkout_err_network', 'checkout_err_failed', 'checkout_retry', 'checkout_unavailable', 'checkout_see_pricing', 'checkout_loading', 'checkout_form_label', 'checkout_summary', 'checkout_price', 'checkout_price_student', 'checkout_inc_1', 'checkout_inc_2', 'checkout_inc_3', 'checkout_cancel', 'checkout_guarantee', 'checkout_stripe', 'checkout_have_head', 'checkout_have_line', 'checkout_done_title', 'checkout_done_wait', 'checkout_done_ok', 'checkout_done_go', 'checkout_done_timeout', 'checkout_done_support', 'checkout_done_refresh', 'checkout_done_signin', 'checkout_done_chapters', 'account_plan', 'account_plan_free', 'account_plan_full', 'account_plan_student', 'account_plan_renews', 'account_plan_ends', 'account_plan_granted', 'account_plan_granted_until', 'account_plan_free_line', 'account_cancel', 'account_manage', 'account_get', 'account_cancel_note', 'account_billing_err', 'account_billing_none', 'account_delete_sub',
  'ref_title', 'ref_loading', 'ref_failed', 'retry', 'ref_search', 'ref_group_move', 'ref_group_select', 'ref_group_edit', 'ref_group_format', 'ref_group_formulas', 'ref_group_ribbon', 'ref_group_data', 'ref_group_count',
  'ref_col_key', 'ref_col_what', 'ref_col_taught', 'ref_col_state', 'ref_state_not_yet', 'ref_state_taught', 'ref_state_practiced', 'ref_state_under_par', 'ref_drill_it', 'ref_or', 'ref_no_match', 'ref_collected', 'ref_drill_note',
  'settings_title', 'settings_saved_line', 'settings_not_saved', 'setting_handle_open', 'setting_signIn_open', 'setting_exportData_do', 'setting_deleteAccount_do',
  // the ops page (R8, 0015_ops.sql)
  'ops_title', 'ops_line', 'ops_refresh', 'ops_week', 'ops_days', 'ops_week_accounts', 'ops_week_lessons', 'ops_week_runs', 'ops_week_errors', 'ops_week_alerts', 'ops_col_what', 'ops_col_now', 'ops_col_before', 'ops_errors', 'ops_errors_facts', 'ops_errors_none', 'ops_col_message', 'ops_col_reports', 'ops_col_sessions', 'ops_col_last', 'ops_col_page', 'ops_col_browser', 'ops_unknown', 'ops_alerts', 'ops_alerts_facts', 'ops_alerts_none', 'ops_col_kind', 'ops_resolve', 'ops_digests', 'ops_digests_none', 'ops_col_week', 'ops_col_accounts', 'ops_col_lessons', 'ops_col_errors', 'ops_col_alerts', 'ops_copy', 'ops_copied', 'ops_unavailable', 'ops_signed_out', 'ops_not_member', 'ops_failed', 'ops_loading',
  // the hardcoded-strings pass (R8, M1): the lines the screens carried in code
  'grade_an_input_shown', 'grade_formula_shown_blue', 'grade_green_but_reads', 'grade_formula_shown', 'grade_has_typed_inside', 'grade_breaks_row_s', 'grade_shows_minus_standard', 'grade_shows_decimals_against',
  'grade_shows_zero_zero', 'grade_carries_currency_sign', 'grade_has_no_first', 'grade_shows_cost_positive', 'grade_sign_convention_stated', 'grade_gridlines_page_someone', 'grade_carries_grid_border', 'grade_has_no_title',
  'grade_padded_spaces_center', 'grade_centered_across_columns', 'grade_header_over_numbers', 'grade_percentage_line_italic', 'grade_sub_item_indented', 'grade_different_font_size', 'grade_title_smaller_than', 'grade_sheet_missing',
  'grade_total_without_top', 'grade_no_units_line', 'grade_formula_check_live', 'grade_does_move_inputs', 'grade_reads_check_does', 'grade_column_hidden_group', 'grade_row_hidden_group', 'grade_typed_number_where',
  'grade_changed_fix_faults', 'grade_has_no_title_2', 'grade_title_bold', 'grade_has_no_units', 'grade_units_line_italic', 'grade_filled_row_spacer', 'grade_header_bold', 'grade_row_has_no',
  'grade_holds_label_labels', 'grade_indented_spaces_use', 'grade_figure_no_number', 'grade_percentage_italic', 'grade_carries_vertical_border', 'grade_total_bold_top', 'grade_panes_frozen', 'grade_desk_number_format',
  'acct_tab_signin', 'acct_check_email', 'acct_magic_go', 'acct_unavailable', 'acct_signup_fine', 'acct_keep_head', 'acct_keep_line', 'acct_carried_head',
  'acct_carried_lessons', 'acct_carried_bests', 'acct_carried_platform', 'acct_carried_skipped', 'acct_carried_fine', 'acct_handle', 'acct_handle_fine', 'acct_handle_save',
  'acct_public', 'acct_code', 'acct_redeem', 'acct_stats_empty', 'acct_stats', 'acct_stat_level', 'acct_stat_time', 'acct_stat_runs',
  'acct_stat_keys', 'acct_stat_pbs', 'acct_stat_streak', 'acct_improvement', 'acct_most_used', 'acct_delete_line', 'acct_confirm', 'acct_delete_go',
  'acct_delete_keep', 'acct_data_line_in', 'acct_export', 'acct_delete_local', 'acct_stored', 'acct_err_network', 'acct_link_sent', 'acct_confirm_link',
  'acct_google_off', 'acct_handle_saved', 'acct_err_network_short', 'acct_save_failed', 'acct_public_on', 'acct_public_off', 'acct_signing_out', 'acct_code_empty',
  'acct_code_bad', 'acct_code_used', 'acct_code_expired', 'acct_code_tries', 'acct_code_failed', 'acct_paid_until', 'acct_code_redeemed', 'acct_export_failed',
  'acct_exported', 'acct_local_confirm', 'acct_local_deleted', 'acct_deleting', 'acct_delete_failed', 'acct_deleted', 'acct_delete_network', 'acct_signout_unsaved',
  'save_state_device', 'flair_unlocks_at', 'first_run_exp_new_label', 'first_run_exp_sometimes_label', 'first_run_exp_daily_label', 'first_run_keyboard_win_label', 'handle_rule', 'handle_banned',
  'landing_headline_2', 'landing_headline_3', 'lesson_save_blocked', 'grade_check_failed', 'demo_poster_note', 'demo_poster_alt', 'fx_sound_off_title', 'fx_sound_off',
  'err_mount', 'err_cap', 'err_head', 'err_retry', 'narrow_head', 'err_fetch', 'narrow_line', 'narrow_back',
  'page_label_home', 'page_label_landing', 'page_label_root', 'page_label_start', 'page_label_learn', 'page_label_lesson', 'page_label_practice', 'page_label_drill', 'page_label_daily',
  'page_label_rapid', 'page_label_due', 'page_label_leaderboard', 'page_label_reference', 'page_label_pricing', 'page_label_teams', 'page_label_account', 'page_label_checkout',
  'page_label_desk', 'page_label_other', 'auth_bad_credentials', 'save_state_pending', 'save_state_account', 'save_state_retry', 'save_state_failed', 'save_line_device', 'save_line_pending', 'save_line_account',
  'save_line_retry', 'save_line_failed', 'first_run_keyboard_mac_label', 'learn_plan_1', 'learn_plan_2', 'learn_plan_3', 'learn_plan_4', 'learn_plan_5',
  'learn_plan_6', 'fx_sound_on_title', 'fx_sound_on', 'acct_signout_unsaved_one', 'acct_tab_signup', 'acct_tab_magic', 'acct_delete_head', 'acct_data_line_out',
  'acct_delete', 'acct_stored_times', 'acct_stored_none', 'acct_delete_fine', 'acct_paid_on', 'demo_poster_link', 'demo_title', 'demo_brief',
  'demo_teach_1', 'demo_goal_1', 'demo_teach_2', 'demo_goal_2', 'demo_teach_3', 'demo_goal_3', 'demo_teach_4', 'demo_goal_4',
  // the hardcoded-strings pass (R8, M1): the lines the screens carried in code
  'conv_A1_name', 'conv_A1_short', 'conv_A2_name', 'conv_A2_short', 'conv_A3_name', 'conv_A3_short', 'conv_A4_name', 'conv_A4_short',
  'conv_A5_name', 'conv_A5_short', 'conv_A6_name', 'conv_A6_short', 'conv_B1_name', 'conv_B1_short', 'conv_B2_name', 'conv_B2_short',
  'conv_B3_name', 'conv_B3_short', 'conv_B4_name', 'conv_B4_short', 'conv_B5_name', 'conv_B5_short', 'conv_B6_name', 'conv_B6_short',
  'conv_C1_name', 'conv_C1_short', 'conv_C2_name', 'conv_C2_short', 'conv_C3_name', 'conv_C3_short', 'conv_C4_name', 'conv_C4_short',
  'conv_C5_name', 'conv_C5_short', 'conv_C6_name', 'conv_C6_short', 'conv_C7_name', 'conv_C7_short', 'conv_C8_name', 'conv_C8_short',
  'conv_C9_name', 'conv_C9_short', 'conv_D1_name', 'conv_D1_short', 'conv_D2_name', 'conv_D2_short', 'conv_D3_name', 'conv_D3_short',
  'conv_D4_name', 'conv_D4_short', 'conv_D5_name', 'conv_D5_short', 'conv_D6_name', 'conv_D6_short', 'conv_D7_name', 'conv_D7_short',
  'conv_D8_name', 'conv_D8_short', 'conv_D9_name', 'conv_D9_short', 'conv_E1_name', 'conv_E1_short', 'conv_E2_name', 'conv_E2_short',
  'conv_E3_name', 'conv_E3_short', 'conv_E4_name', 'conv_E4_short', 'conv_E5_name', 'conv_E5_short', 'conv_E6_name', 'conv_E6_short',
  'conv_E7_name', 'conv_E7_short', 'conv_E8_name', 'conv_E8_short', 'conv_E9_name', 'conv_E9_short', 'conv_F1_name', 'conv_F1_short',
  'conv_F2_name', 'conv_F2_short', 'conv_F3_name', 'conv_F3_short', 'conv_F4_name', 'conv_F4_short', 'conv_F5_name', 'conv_F5_short',
  'conv_G1_name', 'conv_G1_short', 'conv_G2_name', 'conv_G2_short', 'conv_G3_name', 'conv_G3_short',
];
