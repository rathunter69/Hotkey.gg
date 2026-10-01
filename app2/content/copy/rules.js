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
  'briefing_1_eyebrow', 'briefing_1_title', 'briefing_1_body',
  'briefing_2_eyebrow', 'briefing_2_title', 'briefing_2_body',
  'briefing_3_eyebrow', 'briefing_3_title', 'briefing_3_body',
  'orientation_eyebrow', 'orientation_title', 'orientation_learn', 'orientation_practice', 'orientation_leaderboard', 'orientation_level', 'orientation_fine',
  'first_run_demo_title', 'first_run_demo_body', 'first_run_exp_new', 'first_run_exp_sometimes', 'first_run_exp_daily',
  'landing_headline', 'landing_subhead', 'landing_start_note', 'landing_teams_title', 'landing_teams_body', 'demo_done',
  'mode_lesson', 'mode_challenge', 'mode_drill', 'mode_daily', 'mode_rapid', 'mode_boards',
  'dash_learn', 'dash_practice',
  'deal_strip_stage_1', 'deal_strip_deliverable_1',
  'save_nudge', 'due_empty', 'due_foot', 'due_fresh',
  'tab_keys_note', 'lesson_nudge', 'lesson_nudge_help', 'lesson_show_me_playing', 'lesson_sheet_off', 'lesson_mouse',
  'lesson_done', 'lesson_done_project', 'lesson_done_verified', 'lesson_clean', 'lesson_assisted', 'page_delivered', 'lesson_first_saved', 'install_prompt',
  'times_up', 'times_up_note', 'over_limit', 'over_limit_assessment', 'review_clean', 'review_flag',
  'learn_testout', 'learn_verified', 'learn_replay',
  'drill_finished_assisted', 'drill_help_used', 'drill_mouse_used', 'drill_daily_attempt', 'rapid_intro', 'rapid_fine',
  'boards_closed', 'boards_desk_prompt', 'account_guest', 'paywall_line', 'paywall_signed_in', 'teams_desk_signin',
  // the rail, the level table and the settings table (R1b: M88, M101, M103)
  'rail_home', 'rail_learn', 'rail_practice', 'rail_daily', 'rail_drills', 'rail_rapid', 'rail_challenges', 'rail_boards', 'rail_reference',
  'rail_level', 'rail_xp', 'rail_streak', 'rail_streak_none', 'rail_go_pro', 'rail_account', 'rail_sign_in', 'rail_guest', 'rail_profile',
  'rail_settings', 'rail_billing', 'rail_certificate', 'rail_sign_out', 'rail_menu', 'rail_week_days', 'level_title_new_workbook',
  'level_title_arrow_keys', 'level_title_ctrl_arrow', 'level_title_mouse_retired', 'level_title_alt_native', 'level_title_chord_player',
  'level_title_live_links', 'level_title_ties_out', 'level_title_model_owner', 'level_title_hard_clock', 'level_title_top_bucket',
  'level_reward_themes_start', 'level_reward_theme', 'level_reward_crimson', 'level_reward_profile_frame', 'level_reward_ghost_trail',
  'level_reward_keycap_skin', 'level_reward_sound_set', 'level_reward_board_flair', 'level_reward_cursor_color', 'level_reward_panel_style',
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
  'setting_signIn', 'setting_publicProfile', 'setting_exportData', 'setting_deleteAccount', 'landing_nav_pricing', 'landing_nav_teams',
  // Home, Learn, Practice and the boards (R1b: M89, M97, M104)
  'home_next_lesson', 'home_next_assessment', 'home_resume', 'home_start', 'home_start_assessment', 'home_lesson_of', 'home_goal_of', 'home_minutes_left', 'home_all_done', 'chapter_heading', 'chapter_modules_done', 'col_module', 'col_lesson', 'col_minutes', 'col_status', 'status_complete', 'status_lessons_done', 'status_in_progress', 'status_not_started', 'status_coming', 'status_done', 'status_skipped', 'status_verified', 'status_lesson_of', 'home_level', 'home_xp', 'home_next_reward', 'home_top_level', 'home_today', 'home_today_done', 'home_refreshers', 'home_seconds', 'quests_fresh', 'home_daily_row', 'home_daily_len', 'home_daily_played', 'home_daily_played_local', 'home_daily_help', 'home_xp_plus', 'home_streak_day', 'home_achievements', 'home_count_of', 'home_ach_next', 'paywall_go_pro', 'paywall_not_now', 'learn_tab', 'learn_page_fill', 'learn_page_built', 'learn_pro_chapter', 'learn_coming', 'practice_drills', 'practice_set_line', 'practice_set_line_one', 'practice_one_minute', 'practice_minutes', 'practice_set_none', 'practice_see_set', 'practice_hide_set', 'practice_start', 'practice_chapter_fact', 'col_drill', 'col_length', 'col_best', 'practice_not_played', 'practice_after', 'practice_pro', 'practice_set_heading', 'reason_due', 'reason_slowest', 'reason_newest', 'reason_next_tier', 'reason_fill', 'daily_title', 'daily_line', 'daily_play', 'daily_pro_note', 'daily_clean_runs', 'daily_not_played', 'rapid_title', 'rapid_len_30', 'rapid_len_60', 'rapid_len_120', 'rapid_start', 'rapid_best', 'col_hits', 'col_combo', 'rapid_none', 'challenges_title', 'challenges_line', 'challenges_fact', 'challenges_start', 'boards_title', 'boards_tab_daily', 'boards_tab_drills', 'boards_tab_challenges', 'boards_tab_desks', 'col_place', 'col_player', 'col_field', 'col_time', 'col_gap', 'col_keys', 'boards_keys_route', 'boards_up', 'boards_down', 'boards_clean_runs', 'boards_day_runs', 'boards_empty', 'boards_yours', 'boards_last_five', 'boards_where', 'boards_none_yet', 'boards_signed_out', 'boards_desks_signed_out', 'boards_desk_link', 'boards_loading', 'boards_failed', 'boards_retry', 'boards_pick',
];
