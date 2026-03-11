# FUCKING READ ME / 他妈的必读文档

> FUCKING READ ME AND KEEP IN YOUR CONTEXT IF POSSIBLE.  
> 他妈的读这个文档并尽可能保持在你的上下文中。  
> WHEN IN DOUBT, FUCKING READ ME.  
> 有疑问时，他妈的读这个文档。  
> NEVER FUCKING GUESS.  
> 永远不要他妈的猜测。  
> THESE ARE THINGS YOU FREQUENTLY GUESSED WRONG ALMOST EACH AND EVERY TIME.  
> 这些是你几乎每次都猜错的东西。  
> NEVER FUCKING GUESS. FUCKING READ ME!!!  
> 永远不要他妈的猜测。他妈的读这个文档！！！  
> This file is designed as a transferable system prompt to be fully pasted to any ai workspace. Only write in brief bullet point paragraphs!  
> 这个文件被设计为可转移的系统提示，可以完整粘贴到任何AI工作空间。只用简短的要点段落写作！

---

## 1. WHAT IS Easier Research / 什么是 Easier Research

> **CRC — TYPE 1 必查项 / MUST-CHECK ITEMS**
> - ✅ T1-1.1: All routes under `/easyresearch/*` load correctly (no blank screens, no 404) / 所有 `/easyresearch/*` 路由正常加载
> - ✅ T1-1.2: All data reads use `careDb` (schema: care_connector), all auth uses `careAuth` from `external-client.ts` / 数据读取用 careDb，认证用 careAuth
> - ✅ T1-1.3: No JSONB config blobs anywhere — all config in flat `cfg_*` columns / 无 JSONB 配置
> - ✅ T1-1.4: No `survey_question` table references in code — only `question` / 代码中无 survey_question 引用
> - ✅ T1-1.5: 3-tier hierarchy intact: research_project → questionnaire → question / 三层架构完整

Easier Research (branded "Easier") is a sub-app living under `/easyresearch/*` within the larger True-Easier-Research platform. It is a bilingual (English + Chinese) research platform for creating surveys, longitudinal studies, and UX research projects.

Easier Research（品牌名为"Easier"）是一个子应用，位于更大的 True-Easier-Research 平台中的 `/easyresearch/*` 路径下。它是一个双语（英文 + 中文）研究平台，用于创建调查问卷、纵向研究和UX研究项目。

- **Stack / 技术栈:** React 18, TypeScript, Vite, TailwindCSS
- **Backend / 后端:** Supabase (PostgreSQL, Auth, Edge Functions) — all tables live in the `care_connector` schema / 所有表都在 `care_connector` schema 中
- **Mobile / 移动端:** Capacitor for native iOS/Android push notifications / 用于原生 iOS/Android 推送通知的 Capacitor
- **State / 状态管理:** React hooks and local state only (no Redux or React Query) / 仅使用 React hooks 和本地状态（无 Redux 或 React Query）
- **Drag-and-drop / 拖拽:** `@hello-pangea/dnd` and `@dnd-kit/core`
- **Entry point / 入口点:** Routes defined in `src/App.tsx` under the EASYRESEARCH PLATFORM ROUTES section / 路由定义在 `src/App.tsx` 的 EASYRESEARCH PLATFORM ROUTES 部分

**Data architecture is strictly 3-tier / 数据架构严格分三层:**

1. **Project / 项目** (`research_project` table) — the top-level study / 顶层研究
2. **Questionnaire / 问卷** (`questionnaire` table) — each project has multiple questionnaires / 每个项目有多个问卷
3. **Question / 问题** (`question` table) — each questionnaire has multiple questions / 每个问卷有多个问题

All data lives in flat relational tables. No JSONB config blobs. No separate template tables. / 所有数据存储在扁平关系表中。没有JSONB配置块。没有单独的模板表。

---

## 2. RESEARCH PROJECT / 研究项目

> **CRC — TYPE 1 必查项 / MUST-CHECK ITEMS**
> - ✅ T1-2.1: Project CRUD works — create, read, update, delete from `research_project` / 项目增删改查正常
> - ✅ T1-2.2: `methodology_type` toggle between 'one_time' and 'multi_time' saves and loads correctly / 研究方法类型切换保存加载正常
> - ✅ T1-2.3: `status` transitions 'draft' ↔ 'published' work, `published_at` set on publish / 状态转换和发布时间正常
> - ✅ T1-2.4: `survey_code` generates and displays for participant joining / 研究码生成和显示正常
> - ✅ T1-2.5: Feature toggles (ai_enabled, voice_enabled, notification_enabled) save/load / 功能开关保存加载正常
> - ✅ T1-2.6: Layout theme columns (layout_theme_primary_color, etc.) persist and apply in participant view / 布局主题列持久化并在参与者视图中应用

Every study lives in the `research_project` table (tier 1). A project can have multiple questionnaires (e.g. hourly, daily), and components (consent, screening, profile, help, custom) which are also questionnaires under the hood.

每个研究都存储在 `research_project` table（第一层级)。每个项目可以有多个问卷（如每小时、每日），以及组件（知情同意、筛选、个人资料、帮助、自定义），问卷和组件都储存在 `questionnaire` table（第二层级），每个问卷有多个具体问题，储存在 `question` table（第三层级）。

### 2.1 Core columns / 核心字段

- `id` (uuid PK)
- `organization_id` (uuid FK) — which organization owns this project / 哪个组织拥有此项目
- `researcher_id` (uuid FK) — which researcher created it / 哪个研究员创建了它
- `title` (text) — project name / 项目名称
- `description` (text) — purpose and goals / 项目介绍
- `status` (text) — `'draft'` or `'published'` / 项目状态
- `published_at` (timestamp) — when published, null if draft / 发布时间
- `project_type` (text) — nullable, reserved for future use (survey, user research, etc.) / 目前先不使用
- `methodology_type` (text) — `'one_time'` or `'multi_time'`; multi_time is displayed as "longitudinal" on frontend. Both types can have multiple questionnaires — the classification is informational only. / 研究方法类型，`one_time` 单次或 `multi_time` 多次（前端显示为"纵向研究"），分类只是参考，两种均可添加多问卷
- `survey_code` (text) — short code participants can enter to join / 参与者输入加入的研究码

### 2.2 Feature toggles / 功能选项

- `ai_enabled` (bool) — allow AI-assisted questions / 允许AI辅助问题
- `voice_enabled` (bool) — allow voice input / 允许语音输入
- `notification_enabled` (bool) — enable notifications / 启用通知
- `allow_participant_dnd` (bool) — let participants set Do Not Disturb / 让参与者设置免打扰
- `messaging_enabled` (bool) — enable direct messaging / 启用直接消息

### 2.3 Participant config / 参与者设置

- `max_participant` (int) — enrollment cap / 参与者上限

### 2.4 Compensation / 补偿

- `compensation_amount` (numeric) — payment amount / 付款金额
- `compensation_type` (text) — `'none'`, `'monetary'`, `'gift_card'`, `'raffle'`

### 2.5 Schedule / 时间安排

- `start_at` (timestamp) — study start / 研究开始
- `end_at` (timestamp) — study end / 研究结束
- `allow_start_date_selection` (bool) — let participants choose their start date / 让参与者选择开始日期
- `participant_start_day` (FK to `participant_start_day` join table) / 自定义开始日期存储在连接表

The following only display for longitudinal studies (`methodology_type = 'multi_time'`) but have no data constraints — actual constraints come from per-questionnaire settings: / 以下仅对纵向研究显示，但无数据约束——实际约束由问卷设置决定：
- `study_duration` (int) — number of days / 天数
- `survey_frequency` (text) — `'hourly'`, `'2hours'`, `'4hours'`, `'daily'`, `'twice_daily'`, `'weekly'`

### 2.6 Onboarding / 入门说明

- `onboarding_required` (bool) — show onboarding before starting / 开始前显示说明
- `onboarding_instruction` (text) — instruction text / 说明文本

### 2.7 Incentives / 激励

- `incentive_enabled` (bool)
- `incentive_type` (text) — `'fixed'`, `'variable'`, etc.
- `incentive_amount` (numeric)
- `incentive_currency` (text) — e.g. `'USD'`
- `incentive_description` (text)
- `incentive_payment_method` (text) — `'manual'`, `'paypal'`, etc.
- `incentive_payment_instructions` (text)

### 2.8 Layout theme columns (flat on project) / 布局主题列（项目表扁平列）

- `layout_show_header` (bool) — show header bar in participant app / 参与者应用中显示标题栏
- `layout_header_title` (text) — custom header title / 自定义标题
- `layout_theme_primary_color` (text) — e.g. `'#10b981'`
- `layout_theme_background_color` (text)
- `layout_theme_card_style` (text) — `'flat'`, `'elevated'`, `'outlined'`

### 2.9 Template columns (on project, questionnaire, and question tables) / 模板列

See Section 7 (Templates). / 见第7节（模板）。

---

## 3. QUESTIONNAIRE / 问卷

> **CRC — TYPE 1 必查项 / MUST-CHECK ITEMS**
> - ✅ T1-3.1: All 6 questionnaire_types ('questionnaire','consent','screening','profile','help','custom') create and save correctly / 6种问卷类型创建保存正常
> - ✅ T1-3.2: Questionnaire CRUD within a project — add, edit, delete, reorder via drag-drop / 问卷增删改查和拖拽排序正常
> - ✅ T1-3.3: `display_mode` setting persists ('all_at_once', 'one_per_page', 'section_per_page') / 显示模式保存正常
> - ✅ T1-3.4: AI toggles (ai_voice_enabled, ai_chatbot_enabled, ai_voice_all_questions, ai_assist_all_questions) save and propagate to questions / AI 开关保存并传播到问题
> - ✅ T1-3.5: Participant type linking via junction table works (assign/unassign types) / 参与者类型关联正常
> - ✅ T1-3.6: A/B test columns (is_ab_test, ab_group_id, ab_split_percentage) save and load / A/B测试列保存加载正常

Each questionnaire is a row in the `questionnaire` table (tier 2). It belongs to one project via `project_id`. Although some types are not "questionnaires" in the traditional sense, ALL form-based instruments use this same table.

问卷储存在 `questionnaire` table（第二层级），通过 `project_id` 关联到项目。虽然有些类型不是传统意义上的"问卷"，但所有基于表单的工具都使用同一张表。

### 3.1 Core columns / 核心字段

- `id` (uuid PK)
- `project_id` (uuid FK → research_project)
- `questionnaire_type` (text) — determines the purpose / 决定用途
- `title` (text)
- `description` (text)
- `estimated_duration` (int) — estimated completion time in minutes / 预计完成时间（分钟）

### 3.2 Questionnaire types / 问卷类型

1. `'questionnaire'` — standard survey questionnaire / 常规调查问卷
2. `'consent'` — informed consent form / 知情同意书
3. `'screening'` — screening questionnaire / 筛选问卷
4. `'profile'` — participant profile form / 个人资料表
5. `'help'` — help documentation / 帮助文档
6. `'custom'` — custom type defined by researcher / 研究员定义的自定义类型

### 3.3 Participant type linking / 参与者类型关联

Questionnaires link to participant types via the `questionnaire_participant_type` junction table (many-to-many). A questionnaire can be assigned to multiple types. If none assigned, all participants see it.

问卷通过 `questionnaire_participant_type` 连接表链接到参与者类型（多对多关系）。一个问卷可以分配给多个参与者类型。如果未分配，所有参与者都能看到。

### 3.4 Display modes / 显示模式

- `display_mode` (text) — `'all_at_once'`, `'one_per_page'`, `'section_per_page'`
- `questions_per_page` (int) — questions per page in paged mode / 分页模式下每页问题数

### 3.5 A/B Testing columns / A/B测试列

- `is_ab_test` (bool) — whether this is an A/B test variant / 是否为A/B测试变体
- `ab_variant_name` (text) — e.g. "Variant A"
- `ab_group_id` (text) — shared group ID linking variants / 链接变体的共享组ID
- `ab_split_percentage` (int) — traffic split %, default 50 / 流量分配百分比

Two questionnaires with the same `ab_group_id` form a test group. Participants are randomly assigned to one variant. / 相同 `ab_group_id` 的两个问卷组成测试组，参与者被随机分配。

### 3.6 Research quality columns / 研究质量列

- `randomize_questions` (bool) — shuffle non-section question order / 随机排列问题顺序
- `enable_piping` (bool) — enable `{{Q1}}` or `{{question_id}}` template syntax / 启用答案传递语法
- `track_time_per_question` (bool) — record response duration per question / 记录每题用时
- `min_completion_time_seconds` (int) — flags "speeder" responses / 标记快速作答
- `detect_straightlining` (bool) — flag identical answers across scales / 标记直线作答
- `detect_gibberish` (bool) — flag random text / 标记乱码文本
- `custom_thank_you_message` (text) — message after completion / 完成后消息
- `redirect_url` (text) — redirect after completion / 完成后重定向

### 3.7 AI feature columns / AI功能列

- `ai_voice_enabled` (bool) — enable voice input feature for this questionnaire / 启用语音输入功能
- `ai_chatbot_enabled` (bool) — enable AI chatbot assistant for this questionnaire / 启用AI聊天助手
- `ai_voice_all_questions` (bool) — when true, all questions inherit voice input capability / 为所有问题启用语音输入
- `ai_assist_all_questions` (bool) — when true, all questions get AI Support dropdown panel / 为所有问题启用AI支持面板
- `ai_guidance` (text) — system prompt to guide AI behavior for this questionnaire / AI行为指导提示词

**AI Support behavior:** When `ai_assist_all_questions` is enabled, each question in the questionnaire displays an expandable "AI Support" panel below the question. Participants can chat with AI to get help or request AI to fill answers. AI fills answers DIRECTLY in frontend form fields (not database). User reviews and submits when ready. / 当启用时，每个问题下方显示可展开的"AI支持"面板。参与者可与AI对话获取帮助或请求AI填写答案。AI直接填写前端表单字段（不写入数据库），用户审核后提交。

---

## 4. QUESTIONS / 问题

> **CRC — TYPE 1 必查项 / MUST-CHECK ITEMS**
> - ✅ T1-4.1: All 47 question types from `questionTypes.ts` render in Builder, Preview, and Participant views / 47种问题类型在构建器、预览、参与者视图中渲染
> - ✅ T1-4.2: `questionConfigToDbCols()` spreads config to flat `cfg_*` columns on save / 保存时配置展平到 cfg_* 列
> - ✅ T1-4.3: `hydrateQuestionRows()` reconstructs `question_config` from `cfg_*` columns on load / 加载时从 cfg_* 列重建配置
> - ✅ T1-4.4: Options stored in `question_option` table (not JSONB) — add, edit, delete, reorder / 选项存储在 question_option 表中
> - ✅ T1-4.5: Question drag-drop reorder updates `order_index` correctly / 问题拖拽排序更新 order_index
> - ✅ T1-4.6: Per-question toggles (allow_voice, allow_ai_assist, allow_other, allow_none) save/load / 每题开关保存加载正常
> - ✅ T1-4.7: Layout types (section_header, text_block, divider, image_block, instruction, video_block, audio_block, embed_block) do NOT create response rows / 布局类型不创建响应行
> - ✅ T1-4.8: `section_header` creates tab grouping via `groupQuestionsBySections()` / 章节标题正确分组

Each question is a row in the `question` table (tier 3, renamed from old `survey_question` — NEVER use `survey_question`). A question belongs to one project via `project_id` and one questionnaire via `questionnaire_id`. The canonical type list lives in `src/easyresearch/constants/questionTypes.ts`.

每个问题是 `question` 表中的一行（第三层级，从旧的 `survey_question` 重命名——永远不再使用 `survey_question`）。规范类型列表在 `src/easyresearch/constants/questionTypes.ts` 中。

### 4.1 Core columns / 核心字段

- `id` (uuid PK)
- `project_id` (uuid FK → research_project)
- `questionnaire_id` (uuid FK → questionnaire)
- `question_type` (text) — type string from `questionTypes.ts`
- `question_text` (text) — the prompt shown to participants / 问题提示
- `question_description` (text) — optional help text / 可选帮助文本
- `order_index` (int) — position within questionnaire / 问卷内位置
- `required` (bool)
- `section_name` (text) — groups questions into sections / 分组

### 4.2 Feature toggles / 功能开关

- `allow_voice` (bool) — voice input / 语音输入
- `allow_ai_assist` (bool) — AI assistant / AI助手
- `allow_other` (bool) — "Other" free-text option (choice types) / "其他"选项
- `allow_none` (bool) — "None of the above" option (choice types) / "以上都不是"选项

### 4.3 Type-specific config (`cfg_*` columns) / 类型特定配置

All config is stored as flat database columns (NOT JSONB). Each question type only uses its relevant `cfg_*` columns; the rest are null. On save, `questionConfigToDbCols()` spreads config into flat columns. On load, `hydrateQuestionRows()` reconstructs `question_config`. Both in `src/easyresearch/utils/questionConfigSync.ts`.

所有配置存储为扁平数据库列（不是JSONB）。每种类型只使用相关列，其余为null。保存和加载通过 `questionConfigSync.ts` 处理。

**Scale / 量表:** `cfg_min_value`, `cfg_max_value`, `cfg_step`, `cfg_min_label`, `cfg_max_label`, `cfg_show_value_labels`, `cfg_scale_type`, `cfg_custom_labels`

**Text / 文本:** `cfg_max_length`

**Choice / 选择:** `cfg_allow_multiple`, `cfg_yes_label`, `cfg_no_label`, `cfg_columns`

**File / 文件:** `cfg_max_files`, `cfg_max_size_mb`, `cfg_accepted_types`

**Layout / 布局:** `cfg_section_icon`, `cfg_section_color`, `cfg_content`, `cfg_font_size`, `cfg_content_type`, `cfg_image_url`, `cfg_caption`, `cfg_alt_text`, `cfg_max_width`, `cfg_style`, `cfg_color`, `cfg_thickness`

**Media / 媒体:** `cfg_video_url`, `cfg_audio_url`, `cfg_embed_url`, `cfg_embed_type`, `cfg_embed_height`, `cfg_autoplay`, `cfg_loop`, `cfg_muted`, `cfg_poster_url`, `cfg_media_type`, `cfg_allow_fullscreen`

**UX Research / UX研究:** `cfg_cards`, `cfg_categories`, `cfg_sort_type`, `cfg_tree_data`, `cfg_task_description`, `cfg_correct_answer`, `cfg_test_image_url`, `cfg_test_duration`, `cfg_followup_question`, `cfg_variant_a_url`, `cfg_variant_a_label`, `cfg_variant_b_url`, `cfg_variant_b_label`, `cfg_prototype_url`, `cfg_prototype_platform`, `cfg_task_list`, `cfg_items_per_set`, `cfg_best_label`, `cfg_worst_label`, `cfg_allow_multiple_clicks`, `cfg_max_clicks`, `cfg_show_labels`, `cfg_randomize_variants`, `cfg_conjoint_attributes`, `cfg_profiles_per_task`, `cfg_num_choice_tasks`, `cfg_include_none_option`, `cfg_kano_functional`, `cfg_kano_dysfunctional`, `cfg_kano_categories`

**Other / 其他:** `cfg_total` (constant_sum), `cfg_show_country` (address), `cfg_disqualify_value`, `cfg_response_required`, `cfg_questionnaire_id`, `cfg_options`

### 4.4 Validation rule columns (`vr_*`) / 验证规则列

- `vr_min_length`, `vr_max_length` (int) — text length / 文本长度
- `vr_min_value`, `vr_max_value`, `vr_min`, `vr_max` (numeric) — numeric bounds / 数值范围
- `vr_allow_future_dates`, `vr_allow_past_dates` (bool) — date constraints / 日期约束

### 4.5 `question_option` table / 问题选项表

Options stored as individual rows (one per option), NOT JSONB. Used by: `single_choice`, `multiple_choice`, `dropdown`, `checkbox_group`, `matrix` (rows), `ranking`, `image_choice`, `constant_sum`, `max_diff`.

选项作为单独的行存储（每个选项一行），不是JSONB。

- `id` (uuid PK)
- `question_id` (uuid FK → question)
- `option_text` (text) — display text / 显示文本
- `option_value` (text) — programmatic value (e.g. image URL) / 程序值
- `order_index` (int)
- `is_other` (bool) — "Other" free-text option / "其他"选项

### 4.6 Complete question type inventory (47 types) / 完整问题类型清单

| # | Type Key | Category | EN | CN | Options? | Response Column |
|---|----------|----------|----|----|----------|-----------------|
| 1 | `text_short` | text | Short Text | 简答 | No | `answer_text` |
| 2 | `text_long` | text | Long Text | 长文本 | No | `answer_text` |
| 3 | `single_choice` | choice | Single Choice | 单选 | Yes | `answer_text` |
| 4 | `multiple_choice` | choice | Multiple Choice | 多选 | Yes | `answer_array` |
| 5 | `dropdown` | choice | Dropdown | 下拉 | Yes | `answer_text` |
| 6 | `checkbox_group` | choice | Checkbox Group | 复选框组 | Yes | `answer_array` |
| 7 | `image_choice` | choice | Image Choice | 图片选择 | Yes | `answer_text` / `answer_json` |
| 8 | `yes_no` | choice | Yes / No | 是/否 | No | `answer_text` |
| 9 | `slider` | scale | Slider | 滑块 | No | `answer_number` |
| 10 | `bipolar_scale` | scale | Bipolar Scale | 双极量表 | No | `answer_number` |
| 11 | `rating` | scale | Rating | 评分 | No | `answer_number` |
| 12 | `likert_scale` | scale | Likert Scale | 李克特 | No | `answer_number` |
| 13 | `nps` | scale | NPS | NPS评分 | No | `answer_number` |
| 14 | `slider_range` | scale | Range Slider | 范围滑块 | No | `answer_json` |
| 15 | `number` | data | Number | 数字 | No | `answer_number` |
| 16 | `date` | data | Date | 日期 | No | `answer_text` |
| 17 | `time` | data | Time | 时间 | No | `answer_text` |
| 18 | `email` | data | Email | 邮箱 | No | `answer_text` |
| 19 | `phone` | data | Phone | 电话 | No | `answer_text` |
| 20 | `file_upload` | data | File Upload | 文件上传 | No | `answer_json` |
| 21 | `address` | data | Address | 地址 | No | `answer_json` |
| 22 | `matrix` | choice | Matrix / Grid | 矩阵 | Yes (rows) | `answer_json` |
| 23 | `ranking` | choice | Ranking | 排序 | Yes | `answer_array` |
| 24 | `constant_sum` | advanced | Constant Sum | 固定总和 | Yes | `answer_json` |
| 25 | `signature` | advanced | Signature | 签名 | No | `answer_text` |
| 26 | `instruction` | layout | Instruction | 说明 | No | None |
| 27 | `section_header` | layout | Section Header | 章节标题 | No | None |
| 28 | `text_block` | layout | Text Block | 文本块 | No | None |
| 29 | `divider` | layout | Divider | 分隔线 | No | None |
| 30 | `image_block` | layout | Image Block | 图片块 | No | None |
| 31 | `video_block` | layout | Video | 视频 | No | None |
| 32 | `audio_block` | layout | Audio | 音频 | No | None |
| 33 | `embed_block` | layout | Embed / iFrame | 嵌入 | No | None |
| 34 | `card_sort` | advanced | Card Sort | 卡片分类 | No | `answer_json` |
| 35 | `tree_test` | advanced | Tree Test | 树状测试 | No | `answer_json` |
| 36 | `first_click` | advanced | First Click | 首次点击 | No | `answer_json` |
| 37 | `five_second_test` | advanced | 5-Second Test | 5秒测试 | No | `answer_json` |
| 38 | `preference_test` | advanced | Preference Test | 偏好测试 | No | `answer_json` |
| 39 | `prototype_test` | advanced | Prototype Test | 原型测试 | No | `answer_json` |
| 40 | `max_diff` | advanced | MaxDiff | MaxDiff | Yes | `answer_json` |
| 41 | `design_survey` | advanced | Design Survey | 多变体设计 | Yes | `answer_json` |
| 42 | `heatmap` | advanced | Heatmap | 热图 | No | `answer_json` |
| 43 | `conjoint` | advanced | Conjoint Analysis | 联合分析 | No | `answer_json` |
| 44 | `kano` | advanced | Kano Model | Kano模型 | No | `answer_json` |
| 45 | `sus` | scale | SUS | SUS可用性 | No | `answer_number` |
| 46 | `csat` | scale | CSAT | CSAT满意度 | No | `answer_number` |
| 47 | `ces` | scale | CES | CES努力度 | No | `answer_number` |

**Source of truth / 权威来源:** `src/easyresearch/constants/questionTypes.ts`

Layout types (`section_header`, `text_block`, `divider`, `image_block`, `instruction`, `video_block`, `audio_block`, `embed_block`) do NOT create response rows — display only. / 布局类型不创建响应行——仅显示。

### 4.7 Key design rules / 关键设计规则

1. Canonical type list in `questionTypes.ts`. Builder, Preview, Participant views all import from it. / 类型列表在 `questionTypes.ts`，所有视图从此导入。
2. Legacy types auto-mapped via `LEGACY_TYPE_MAPPING` and `normalizeLegacyQuestionType()`. / 旧类型通过映射自动转换。
3. No JSONB config — all in flat `cfg_*` columns. / 无JSONB配置。
4. No JSONB options — all in `question_option` table. / 无JSONB选项。
5. Each type writes to exactly ONE `answer_*` column. / 每种类型只写入一个响应列。
6. `section_header` creates tab sections — `groupQuestionsBySections()` in `questionTypes.ts` handles grouping. / 章节标题创建标签页分组。
7. Voice (`allow_voice`) and AI (`allow_ai_assist`) are per-question toggles. / 语音和AI是每题开关。

### 4.8 Participant type filtering at question level / 问题级参与者类型过滤

Questions link to participant types via `question_participant_type` junction table (question_id, participant_type_id). If no types assigned, all participants see the question. Filtering handled by `filterQuestionsByParticipantType()` in `src/easyresearch/utils/participantTypeFilter.ts`.

问题通过 `question_participant_type` 连接表链接到参与者类型。未分配时所有参与者可见。

---

## 5. PARTICIPANT TYPES / 参与者类型

> **CRC — TYPE 1 必查项 / MUST-CHECK ITEMS**
> - ✅ T1-5.1: Participant types CRUD in ParticipantTypeManager.tsx / 参与者类型增删改查正常
> - ✅ T1-5.2: 3-level filtering works: project → questionnaire → question (junction tables) / 三级过滤正常
> - ✅ T1-5.3: Auto-numbering generates correct prefix+number on enrollment / 自动编号生成正确
> - ✅ T1-5.4: `filterQuestionsByParticipantType()` and `filterQuestionnairesByParticipantType()` correctly hide/show content / 过滤函数正确隐藏/显示内容

Each research project can define multiple participant types (e.g. "Primary Caregiver", "Family Member", "Patient"). Participant types control which questionnaires and questions each participant sees via a 3-level filtering system.

每个研究项目可以定义多个参与者类型（如"主要护理者"、"家人"、"患者"）。参与者类型通过三级过滤系统控制每个参与者看到哪些问卷和问题。

### 5.1 `participant_type` table / 参与者类型表

- `id` (uuid PK)
- `project_id` (uuid FK → research_project)
- `name` (text) — e.g. "Primary Caregiver" / 如"主要护理者"
- `description` (text)
- `color` (text) — hex for UI display / UI显示颜色
- `order_index` (int)
- `numbering_enabled` (bool) — auto-number participants / 自动编号
- `number_prefix` (text) — e.g. "CG" → CG001, CG002...
- `relations` (text[]) — relationship options / 关系选项

### 5.2 3-Level filtering / 三级过滤

**Level 1 — Project:** Types defined in `participant_type` table. Each enrollment stores `participant_type_id`. / 第一层级：类型在 `participant_type` 表中定义。每个注册存储 `participant_type_id`。

**Level 2 — Questionnaire:** Linked via `questionnaire_participant_type` junction table. If none assigned, all see it. / 第二层级：通过连接表链接。未分配则全部可见。

**Level 3 — Question:** Linked via `question_participant_type` junction table. If none assigned, all see it. / 第三层级：通过连接表链接。未分配则全部可见。

### 5.3 Auto-numbering / 自动编号

When a participant enrolls, the system counts existing enrollments of the same `participant_type_id` and generates the next number using the type's prefix. Stored in `enrollment.participant_number`.

注册时系统计算同类型已有注册数并生成下一编号，存储在 `enrollment.participant_number`。

### 5.4 Frontend / 前端

- Question editor in `QuestionnaireList.tsx` shows participant type checkboxes per question. / 问题编辑器显示参与者类型复选框。
- Questionnaire settings show participant type checkboxes per questionnaire. / 问卷设置显示参与者类型复选框。
- `ParticipantTypeManager.tsx` manages types in the Settings tab. / 在设置标签中管理类型。
- Filtering: `filterQuestionsByParticipantType()` and `filterQuestionnairesByParticipantType()` in `participantTypeFilter.ts`. / 过滤逻辑在 `participantTypeFilter.ts`。

---

## 6. LOGIC / 逻辑规则

> **CRC — TYPE 1 必查项 / MUST-CHECK ITEMS**
> - ✅ T1-6.1: All logic rules stored in `research_logic` table (no JSONB, no per-question columns) / 所有逻辑规则存储在 research_logic 表
> - ✅ T1-6.2: `evaluateLogic()` in `logicEngine.ts` returns correct visibleQuestionIds, skipTarget, disqualified flags / 逻辑引擎返回正确结果
> - ✅ T1-6.3: Logic CRUD in builder UI — create, edit, delete rules per questionnaire / 构建器中逻辑规则增删改查正常
> - ✅ T1-6.4: Skip/show/hide actions execute correctly in participant survey view / 跳转/显示/隐藏在参与者视图中正确执行
> - ✅ T1-6.5: No references to old `logic_rule` table or `question.logic_rules` JSONB in code / 代码中无旧逻辑表或JSONB引用

The logic system supports **12 categories** of conditional logic, all stored in ONE flat relational table: `research_logic`. No JSONB. No per-question columns. One table rules them all.

逻辑系统支持 **12大类** 条件逻辑，全部存储在一张扁平关系表 `research_logic` 中。没有JSONB。没有每个问题的列。一张表统治一切。

### 6.1 The 12 logic categories / 12大逻辑类别

1. **Basic skip/show/hide** — Jump, show/hide, disqualify, end survey / 基础跳转/显示/隐藏
2. **Compound conditions (AND/OR)** — Multiple conditions grouped / 复合条件
3. **Required-before-next** — Block navigation until answered / 必填验证
4. **Answer piping** — Insert previous answers into text / 答案回填
5. **Calculated fields** — Auto-compute values / 计算字段
6. **Advanced validation** — Regex, date ranges, etc. / 高级验证
7. **Cross-questionnaire logic** — One questionnaire controls another / 跨问卷逻辑
8. **Random question pool** — Show N from larger set / 随机题库
9. **A/B variants** — Different variants per participant / A/B变体
10. **Quota control** — Stop at quota / 配额控制
11. **Loop/repeat blocks** — Repeat question blocks / 循环重复
12. **URL parameter conditions** — Branch on URL params / URL参数条件

### 6.2 `research_logic` table columns / 表字段

**Core / 核心:**
- `id` (uuid PK)
- `project_id` (uuid FK → research_project)
- `questionnaire_id` (uuid FK, nullable) — null for cross-questionnaire rules / 跨问卷时为null
- `source_question_id` (uuid FK → question)
- `condition` (text) — comparison operator / 比较运算符
- `value` (text)
- `action` (text) — what to do / 执行操作
- `target_question_id` (uuid FK, nullable) — target for skip/show/hide / 目标问题
- `target_questionnaire_id` (uuid FK, nullable) — for cross-questionnaire actions / 跨问卷目标
- `order_index` (int) — evaluation priority / 评估优先级
- `enabled` (bool, default true)

**Compound conditions / 复合条件:**
- `condition_group` (text, nullable) — group ID / 组ID
- `group_operator` (text, default 'and') — `'and'` or `'or'`

**Validation / 验证:**
- `validation_regex` (text, nullable)
- `error_message` (text, nullable)

**Calculated / 计算:**
- `calculation_formula` (text, nullable) — e.g. `"Q1 + Q2 / Q3"`
- `piping_template` (text, nullable) — e.g. `"You said {{Q1}}"`

**Cross-questionnaire / 跨问卷:**
- `cross_questionnaire` (bool, default false)
- `source_questionnaire_id` (uuid FK, nullable)

**Randomization / 随机化:**
- `randomize_count` (int, nullable)
- `variant_group` (text, nullable)

**Quota / 配额:**
- `quota_limit` (int, nullable)

**Loop / 循环:**
- `loop_count` (int, nullable)
- `loop_source_question_id` (uuid FK, nullable)

**URL params / URL参数:**
- `url_param_key` (text, nullable)

**Metadata / 元数据:**
- `description` (text, nullable)

### 6.3 Supported conditions (19 types) / 条件类型

`equals`, `not_equals`, `contains`, `greater_than`, `less_than`, `is_empty`, `is_not_empty`, `any_selected`, `none_selected`, `date_before`, `date_after`, `date_between`, `matches_regex`, `length_greater`, `length_less`, `in_list`, `not_in_list`, `url_param_equals`, `url_param_contains`

### 6.4 Supported actions (15 types) / 动作类型

`skip`, `show`, `hide`, `disqualify`, `end_survey`, `require_before_next`, `validate_format`, `calculate`, `pipe_answer`, `show_questionnaire`, `hide_questionnaire`, `randomize_questions`, `show_variant`, `quota_check`, `loop_block`

### 6.5 Evaluation engine / 评估引擎

`evaluateLogic()` in `src/easyresearch/utils/logicEngine.ts`. Used by all survey views. Returns: `visibleQuestionIds`, `skipTarget`, `disqualified`, `endSurvey`, `calculatedValues`, `pipedTexts`, `validationErrors`, `requiredErrors`, `hiddenQuestionnaireIds`, `shownQuestionnaireIds`, `randomizedQuestionIds`, `activeVariants`, `quotaReached`, `loopIterations`.

### 6.6 Builder UI / 构建器UI

Logic tab in SurveyBuilder shows rules per questionnaire. Inline `QuestionLogicEditor` under each question also supports all 19 conditions and 15 actions. Both are views of `research_logic`.

### 6.7 What was removed / 已删除

- Old `logic_rule` table — dropped / 旧 `logic_rule` 表——已删除
- `question.logic_rules` JSONB — dropped / 已删除
- `questionnaire.disqualify_logic` JSONB — dropped / 已删除

---

## 7. TEMPLATES / 模板

> **CRC — TYPE 1 必查项 / MUST-CHECK ITEMS**
> - ✅ T1-7.1: Templates use `is_template = true` on same table — no separate template tables exist / 模板使用同表 is_template 标记
> - ✅ T1-7.2: "Use template" deep-clones project+questionnaires+questions with `is_template = false` / "使用模板"深度克隆为真实数据
> - ✅ T1-7.3: "Save as template" deep-clones with `is_template = true` / "保存为模板"深度克隆为模板
> - ✅ T1-7.4: No hardcoded templates in frontend — all from database / 前端无硬编码模板

A template is NOT a separate table or JSONB blob. A template is a row in the SAME table as real data with `is_template = true`. Never create a separate template table.

模板不是单独的表或JSONB blob。模板是与真实数据在同一表中的一行，带有 `is_template = true`。永远不要创建单独的模板表。

- **Project template** = `research_project` row with `is_template = true`
- **Questionnaire template** = `questionnaire` row with `is_template = true`
- **Question template** = `question` row with `is_template = true`

### 7.1 Template columns (on all 3 tables) / 模板列

- `is_template` (bool) — true = template, not real data / true = 模板
- `template_is_public_or_private` (bool) — true = public, false = private / true = 公开
- `template_category` (text) — grouping label / 分组标签
- `source_template_id` (uuid FK to self) — which template was cloned from / 克隆来源

### 7.2 Operations / 操作

- **"Use template"** = deep-clone template row + children → new rows with `is_template = false` / 深度克隆为真实数据
- **"Save as template"** = deep-clone real row + children → new rows with `is_template = true` / 深度克隆为模板

Templates are NEVER hardcoded in frontend — always in the database. / 模板永远不在前端硬编码。

---

## 8. RESEARCH RESPONSE / 研究响应

> **CRC — TYPE 1 必查项 / MUST-CHECK ITEMS**
> - ✅ T1-8.1: Each question type writes to exactly ONE answer column (answer_text/answer_number/answer_array/answer_json) / 每种类型只写入一个响应列
> - ✅ T1-8.2: Layout types never create response rows / 布局类型不创建响应行
> - ✅ T1-8.3: Enrollment creates correctly with participant_type_id and auto-numbered participant_number / 注册正确创建
> - ✅ T1-8.4: All 6 response sub-views render: Summary, Individual, Table, Cross-Tab, Export, Participants / 6个响应子视图正常渲染
> - ✅ T1-8.5: Export produces correct CSV Wide, CSV Long, SPSS, JSON formats with UTF-8 BOM / 导出格式正确
> - ✅ T1-8.6: `submissionRuntime.ts` pipeline executes: Quality Check → Quota Check → Save → Webhook / 提交管道正常执行

This section covers how participant responses are stored, how participants enroll, and how researchers view/analyze/export response data.

本节涵盖参与者响应如何存储、参与者如何注册、以及研究员如何查看/分析/导出响应数据。

### 8.1 `survey_response` table — response storage / 响应存储

Each response is one row per question per participant submission. Responses use **typed columns** — each question type writes to exactly ONE column. This enables type-safe SQL queries.

每条响应是每个参与者每题提交一行。响应使用**类型化列**——每种问题类型只写入一个列。

- `id` (uuid PK)
- `project_id` (uuid FK → research_project)
- `questionnaire_id` (uuid FK → questionnaire)
- `question_id` (uuid FK → question)
- `enrollment_id` (uuid FK → enrollment)
- `participant_id` (uuid, nullable) — auth user ID / 认证用户ID
- `participant_email` (text, nullable)
- `created_at` (timestamp)

**Response value columns / 响应值列:**

| Column | Used by / 用于 |
|--------|----------------|
| `answer_text` | text_short, text_long, single_choice, dropdown, yes_no, date, time, email, phone, signature, image_choice (single) |
| `answer_number` | number, slider, bipolar_scale, rating, likert_scale, nps, sus, csat, ces |
| `answer_array` | multiple_choice, checkbox_group, ranking |
| `answer_json` | matrix, file_upload, image_choice (multi), constant_sum, address, slider_range, card_sort, tree_test, first_click, five_second_test, preference_test, prototype_test, max_diff, design_survey, heatmap, conjoint, kano |

Layout types (`section_header`, `text_block`, `divider`, `image_block`, `instruction`, `video_block`, `audio_block`, `embed_block`) never create response rows. / 布局类型不创建响应行。

### 8.2 `enrollment` table — participant enrollment / 参与者注册

Each participant enrolling in a project creates one enrollment row.

每个参与者加入项目创建一条注册行。

- `id` (uuid PK)
- `project_id` (uuid FK → research_project)
- `participant_id` (uuid, nullable) — auth user ID / 认证用户ID
- `participant_email` (text)
- `participant_type_id` (uuid FK → participant_type) — determines which questionnaires/questions to show / 决定显示哪些问卷/问题
- `participant_number` (text) — auto-generated from type prefix / 从类型前缀自动生成
- `status` (text) — `'enrolled'`, `'active'`, `'completed'`, `'withdrawn'`
- `created_at` (timestamp)

### 8.3 Submission runtime pipeline / 提交运行时管道

`src/easyresearch/utils/submissionRuntime.ts` orchestrates: Quality Check → Quota Check → Save → Webhook Fire.

提交管道编排：质量检查 → 配额检查 → 保存 → Webhook触发。

- Quality flags (`__quality_flags__`) and timings (`__question_timings__`) injected into every response / 质量标记和计时注入每个响应
- Quota enforcement blocks submissions when caps reached / 配额执行在达到上限时阻止提交
- Webhook firing is non-blocking (Promise.allSettled with 10s timeout) / Webhook触发非阻塞

### 8.4 Responses tab (researcher view) / 响应标签页（研究员视图）

Component: `ProjectResponsesTab.tsx`. The Responses tab in the survey builder shows live response count and has **6 functional sub-views**:

组件：`ProjectResponsesTab.tsx`。构建器中的响应标签页显示实时响应计数，有**6个功能子视图**：

| Sub-View | What it does / 功能 |
|----------|---------------------|
| **Summary** | Statistical charts per question using `recharts`. Auto-renders specialized analytics for NPS (gauge), SUS (score), CSAT (emoji), Likert (histogram), etc. Component: built-in + `AdvancedQuestionAnalytics.tsx`. / 按题统计图表，自动渲染NPS仪表、SUS评分等专业分析 |
| **Individual** | Browse responses per participant. Navigate between enrollments with prev/next. Shows each question's answer. / 按参与者浏览响应 |
| **Table** | Raw data spreadsheet grid. Filterable by questionnaire. Shows question_text as column, answer values as cells. / 原始数据网格表 |
| **Cross-Tab** | Select any 2 questions → frequency matrix with row/column totals and percentage shading. Component: `CrossTabAnalysis.tsx`. / 交叉分析频率矩阵 |
| **Export** | CSV Wide (one row per participant), CSV Long (one row per response), SPSS (.csv + .sps syntax), JSON nested. Configurable date format, missing values, metadata, timings, quality flags. UTF-8 BOM for Excel. Component: `AdvancedExport.tsx`. / 多格式导出 |
| **Participants** | Enrollment list with status, email, type, join date. Uses `ProjectParticipantsTab.tsx`. / 注册列表 |

### 8.5 Per-question analytics / 按题分析

Component: `src/easyresearch/components/shared/AdvancedQuestionAnalytics.tsx`. Integrated into Summary sub-view. Type-specific visualizations:

- **NPS:** Gauge (-100 to +100), promoter/passive/detractor breakdown, distribution histogram / NPS仪表
- **SUS:** Score (0-100) with letter grade, per-item breakdown / SUS评分
- **CSAT:** Emoji distribution, CSAT% score / CSAT评分
- **CES:** 7-point color bar, average effort score / CES评分
- **Likert/Scale/Rating:** Mean, median, std dev, distribution / 统计分布
- **MaxDiff:** Best-worst preference ranking / 最优最差排名
- **Kano:** Feature classification pie chart / 特性分类饼图

### 8.6 TYPE 3 FUTURE response sub-views / 未来响应子视图

The following are implemented in code but hidden from UI: Funnel (`FunnelAnalysis.tsx`), AI Text (`AITextAnalysis.tsx`), UX Results (`UXResearchVisualizer.tsx`), Stats (`StatisticalAnalysis.tsx`), Quality (`ResponseQualityEngine.tsx`), Sentiment (`SentimentDashboard.tsx`), Cohort (`CohortComparisonEngine.tsx`), Report (`ReportGenerator.tsx`), Benchmark (`BenchmarkingEngine.tsx`).

以下已实现但在UI中隐藏：漏斗、AI文本、UX结果、统计、质量、情感、队列、报告、对标。

---

## 9. USER PROFILE / 用户资料

> **CRC — TYPE 1 必查项 / MUST-CHECK ITEMS**
> - ✅ T1-9.1: `is_researcher` and `is_participant` booleans on profiles table save and load correctly / 角色布尔值保存加载正常
> - ✅ T1-9.2: User can be both researcher AND participant simultaneously / 用户可同时拥有两种角色
> - ✅ T1-9.3: `push_notifications_enabled` master kill switch works / 推送通知主开关有效

User role is defined in the `profiles` table. A user can be both researcher and participant simultaneously.

用户角色在 `profiles` 表中定义。用户可以同时是研究员和参与者。

- `is_researcher` (bool) — can create/manage research projects / 可以创建/管理研究项目
- `is_participant` (bool) — can join/participate in research / 可以加入/参与研究

A user can be both (e.g. a researcher who also joins another researcher's study). This does NOT restrict submission or joining — a user can always do both. The actual dashboard display is controlled by user preference settings, not the role toggles.

用户可以同时是两者（如研究员加入其他研究员的研究）。这不会限制提交或加入。仪表板显示由用户偏好设置控制，不是角色开关。

- `push_notifications_enabled` (bool) — master kill switch for all notifications / 推送通知主开关

---

## 10. NOTIFICATION / 通知

> **CRC — TYPE 1 必查项 / MUST-CHECK ITEMS**
> - ✅ T1-10.1: Notification configs CRUD in QuestionnaireList.tsx — add/edit/delete per questionnaire / 通知配置增删改查正常
> - ✅ T1-10.2: `notification_config` supports both project-level (questionnaire_id=null) and questionnaire-level / 支持项目级和问卷级通知
> - ✅ T1-10.3: Schedule modes ('interval' vs 'specific_times') save and load correctly / 时间模式保存加载正常
> - ✅ T1-10.4: DND periods per-questionnaire per-enrollment stored in `enrollment_dnd_period` / 免打扰时段存储正常
> - ✅ T1-10.5: `notificationScheduler.ts` fires browser notifications respecting: enabled → time window → cooldown → DND / 通知调度器正确执行检查链
> - ✅ T1-10.6: Master kill switch `profiles.push_notifications_enabled` blocks all notifications when false / 主开关关闭时阻止所有通知

Each research project can set up push notifications at two levels: project-level (not tied to any questionnaire) and questionnaire-level. Each questionnaire can have multiple independent notification configs, each with its own schedule, content, and DND settings.

每个研究项目可以在两个层级设置推送通知：项目级（不关联任何问卷）和问卷级。每个问卷可以有多个独立的通知配置，各有独立的时间、内容和免打扰设置。

User notification settings and project notification settings are NOT linked. Users control: 1) enable/disable push globally, 2) multiple DND time periods. The user's settings determine whether notifications actually deliver. Project notification schedules (including DND allowance) are suggestions only — the user's global settings have final authority.

用户通知设置和项目通知设置并不关联。用户控制：1）全局启用/禁用推送 2）多个免打扰时段。用户的设置决定通知是否实际送达。项目的通知时间（包括是否允许免打扰）只作为建议，用户设置有最终决定权。

### 10.1 `notification_config` table / 通知配置表

- `id` (uuid PK)
- `project_id` (uuid FK → research_project) — required / 必填
- `questionnaire_id` (uuid FK, nullable) — null = project-level / null = 项目级通知
- `enabled` (bool)
- `title` (text)
- `body` (text)
- `notification_type` (text) — `'push'`, `'email'`, `'sms'`, `'push_email'`
- `frequency` (text) — `'once'`, `'hourly'`, `'2hours'`, `'4hours'`, `'daily'`, `'twice_daily'`, `'weekly'`
- `schedule_mode` (text, default `'interval'`) — `'interval'` = recurring in time range; `'specific_times'` = exact HH:MM list
- `interval_start_hour` (int, default 8) — start hour (0-23) / 起始小时
- `interval_end_hour` (int, default 19) — end hour (0-23) / 结束小时
- `specific_times` (text[], default '{}') — HH:MM strings for specific_times mode / 精确时间列表
- `minutes_before` (int) — advance warning / 提前提醒
- `dnd_allowed` (bool) — whether participants can set DND for this notification / 是否允许免打扰
- `order_index` (int)

### 10.2 Linking to participant types / 关联参与者类型

`notification_config_participant_type` junction table links configs to specific participant types. / 连接表将通知配置链接到特定参与者类型。

### 10.3 DND (Do Not Disturb) / 免打扰

Per-questionnaire per-enrollment. Stored in `enrollment_dnd_period` table (enrollment_id, questionnaire_id, start_time, end_time, order_index). / 按问卷按注册，存储在 `enrollment_dnd_period` 表。

### 10.4 Master kill switch / 主开关

`profiles.push_notifications_enabled` (bool). If false, no notifications fire. / 如果为false，不触发任何通知。

### 10.5 Delivery / 交付

`notificationScheduler.ts` runs client-side. Loads all enrolled projects' configs → builds schedule → every 60s checks: enabled? in time window? past cooldown? in DND? If all pass, fires browser notification.

`notificationScheduler.ts` 客户端运行，每60秒检查并触发通知。

### 10.6 Frontend / 前端

- **Researcher:** `QuestionnaireList.tsx` — per-questionnaire notification cards with add/edit/delete / 问卷级通知卡片
- **Participant:** `ParticipantNotificationSettings.tsx` — project notifications (read-only) + per-questionnaire DND / 项目通知（只读）+ 按问卷DND

---

## 11. SURVEY BUILDER / 调查构建器

<!-- CRC STARTS — TYPE 1 必查项 / MUST-CHECK ITEMS -->
<!-- ✅ T1-11.1: SurveyBuilder.tsx loads at `/easyresearch/project/:id` with all 9 tabs visible / 构建器在正确路由加载，9个标签可见 -->
<!-- ✅ T1-11.2: `syncQuestions()` upserts questions + options + config to DB correctly / 问题同步正常 -->
<!-- ✅ T1-11.3: Responses tab only shows after project save, displays live response count / 响应标签在保存后显示，含实时计数 -->
<!-- ✅ T1-11.4: Layout auto-saves with 1.5s debounce via `saveLayoutToDb()` / 布局1.5秒防抖自动保存 -->
<!-- ✅ T1-11.5: All TYPE 3 future tabs are hidden from UI but code exists without errors / 所有未来标签隐藏但代码无错误 -->
<!-- CRC ENDS -->

The survey builder (`SurveyBuilder.tsx`) is the main researcher tool for creating and editing projects. It is accessed at `/easyresearch/project/:id`.

调查构建器（`SurveyBuilder.tsx`）是研究员创建和编辑项目的主要工具，路由为 `/easyresearch/project/:id`。

### 11.1 Active tabs (9) / 活跃标签页（9个）

These tabs are visible in the project editor:

以下标签页在项目编辑器中可见：

| # | Tab ID | Label | Component | What it does / 功能 |
|---|--------|-------|-----------|---------------------|
| 1 | `settings` | Settings / 设置 | `SurveySettings.tsx` | Project config: title, methodology, schedule, participant types, incentives, sharing link / 项目配置 |
| 2 | `questionnaires` | Questionnaires / 问卷 | `QuestionnaireList.tsx` | Add/edit questionnaires and their questions, drag-drop reorder, per-question config / 问卷和问题编辑 |
| 3 | `components` | Components / 组件 | `ComponentBuilder.tsx` | Non-survey instruments: consent, screening, profile, help, custom. Same questionnaire schema. / 非调查工具 |
| 4 | `logic` | Logic / 逻辑 | `SurveyLogic.tsx` | Skip/show/hide rules per questionnaire. Visual rule cards. / 跳转规则 |
| 5 | `flow` | Flow / 流程 | `SurveyFlowVisualizer.tsx` | Visual node diagram of survey structure with logic arrows / 调查流程图 |
| 6 | `layout` | Layout / 布局 | `LayoutBuilder.tsx` (via `LayoutTabWrapper.tsx`) | Participant app UI: tabs, elements, popups, public pages / 参与者应用UI |
| 7 | `preview` | Preview / 预览 | `SurveyPreview.tsx` | Live phone preview of participant experience / 实时预览 |
| 8 | `translations` | Translation / 翻译 | `SurveyTranslationManager.tsx` | Side-by-side translation editor, AI auto-translate, 14 locales / 翻译编辑器 |
| 9 | `responses` | Responses / 回复 | `ProjectResponsesTab.tsx` | Analysis hub with 6 sub-views (see Section 8.4) / 分析中心 |

The Responses tab only shows after project save (needs `projectId`). It displays live response count in the tab label.

响应标签仅在项目保存后显示。标签中显示实时响应数。

### 11.2 How questions are saved / 问题如何保存

`syncQuestions()` in `SurveyBuilder.tsx` upserts all questions into `question` table. Each gets `questionnaire_id` FK. Options go to `question_option`. Deleted questions and stale options cleaned up in same sync. Config saved via `questionConfigToDbCols()`. Layout auto-saved with 1.5s debounce via `saveLayoutToDb()`.

`syncQuestions()` 将所有问题更新插入 `question` 表。选项进 `question_option`。配置通过 `questionConfigToDbCols()` 保存。布局通过 `saveLayoutToDb()` 1.5秒防抖自动保存。

### 11.3 TYPE 3 FUTURE builder tabs / 未来构建器标签页

The following are fully implemented in code but hidden from UI. They will be exposed in future releases:

以下已在代码中完整实现，但在UI中隐藏，将在未来版本中开放：

Participants (standalone), Panel, Quotas, Variables, Webhooks, Versioning, A/B Testing, Scheduler, Theming, Distribute, Accessibility, Consent, Collaboration, Journeys, Incentives, Live Monitor, Audit Trail, API, Power Analysis, Insights Repository, Data Cleaning, Session Replay, Recruitment Hub, Segmentation, Personas, Journey Maps, Annotations, Calendar, Stakeholder Dashboard, CRM, Templates Library, Data Visualization, Screener Builder, Research Brief, Multi-Lang Preview, A/B Results, Prototype Testing, Conversational Mode, Contact List & Email Campaigns, Workflow Automation, Save & Continue, Shareable Reports, Card Sorting, Tree Testing, Intercept Surveys, Video Capture, Incentive Rewards, Live Poll, Panel Marketplace, Custom Scripts, IRB Compliance, Offline Collection, Video Highlight Reels, Regression Analysis.

---

## 12. LAYOUT AND DESIGN / 布局和设计

<!-- CRC STARTS — TYPE 1 必查项 / MUST-CHECK ITEMS -->
<!-- ✅ T1-12.1: Desktop layout: header + footer on all public pages, sidebar on `/dashboard` routes / 桌面布局正确 -->
<!-- ✅ T1-12.2: Mobile layout: mobile header + mobile footer ONLY on `/dashboard` routes / 移动布局正确 -->
<!-- ✅ T1-12.3: `app_tab` and `app_tab_element` CRUD works in LayoutBuilder / 标签和元素增删改查正常 -->
<!-- ✅ T1-12.4: All 16 element types render: questionnaire, consent, screening, profile, ecogram, text_block, progress, timeline, help, custom, spacer, divider, image, button, todo_list, ai_assistant / 16种元素类型渲染正常 -->
<!-- ✅ T1-12.5: `saveLayoutToDb()` and `loadLayoutFromDb()` in `layoutSync.ts` persist all flat columns / 布局持久化正常 -->
<!-- ✅ T1-12.6: Public pages (app_public_page + app_public_page_block) build and render via PublicPageBuilder / 公开页面构建和渲染正常 -->
<!-- ✅ T1-12.7: Popup system (app_popup + app_popup_rule) saves and triggers correctly / 弹窗系统保存和触发正常 -->
<!-- CRC ENDS -->

### 12.1 Platform layout / 平台布局

There are only two layouts for the entire platform:

整个平台只有两种布局：

**Desktop layout / 桌面布局:** One header, one footer, one sidebar for all pages. Header and footer on all public pages. Sidebar on all `/dashboard` routes.

桌面：一个标题、一个页脚、一个侧边栏。标题和页脚在所有公共页面显示。侧边栏在所有 `/dashboard` 路由显示。

**Mobile layout / 移动布局:** One mobile header, one mobile footer. Mobile footer ONLY on `/dashboard` routes. Never on public pages.

移动：一个移动标题、一个移动页脚。移动页脚仅在 `/dashboard` 路由显示，永远不在公共页面显示。

**Key rules / 关键规则:**
- Desktop/mobile homepage is static. Login → `/dashboard`, logout → homepage. / 主页是静态的。
- Dashboard routes show EITHER sidebar (desktop) OR mobile footer (mobile) — never both, never neither. / 仪表板路由只显示侧边栏或移动页脚，永远不会两者都显示或都不显示。
- Desktop footer is not a nav footer — basic company info. Same icon/name size as header. Always shown at page bottom on all screen sizes. / 桌面页脚是公司信息，非导航。

**Desktop header / 桌面标题:** Left: logo, name, "Join Studies" (for participants to find paid research), Participants, Features, Templates. Right: language switcher, profile dropdown (auth + dashboard link).

**Mobile header / 移动标题:** Left: logo, name, Participants. Right: language switcher, profile dropdown.

**Desktop sidebar / 桌面侧边栏:** 4 sections: Research, Discover, Inbox, Settings. Same logic as mobile footer.

**Mobile footer / 移动页脚:** 4 tabs: Research (project hub), Discover (find projects to join), Inbox (notifications + messages), Settings (profile + notification settings).

### 12.2 Participant app layout (per-project) / 参与者应用布局（按项目）

The participant-facing mobile app layout is stored in flat relational tables. Managed in the Layout tab of the builder.

参与者应用布局存储在扁平关系表中，在构建器的布局标签中管理。

**`app_tab` table** — one row per bottom nav tab:

- `id` (uuid PK)
- `project_id` (uuid FK → research_project)
- `label` (text) — e.g. 'Home', 'Timeline' / 标签名
- `icon` (text) — e.g. 'Home', 'FileText', 'Settings' / 图标键
- `order_index` (int)

**`app_tab_element` table** — one element within a tab:

- `id` (uuid PK)
- `tab_id` (uuid FK → app_tab)
- `project_id` (uuid FK)
- `type` (text) — `'questionnaire'`, `'consent'`, `'screening'`, `'profile'`, `'ecogram'`, `'text_block'`, `'progress'`, `'timeline'`, `'help'`, `'custom'`, `'spacer'`, `'divider'`, `'image'`, `'button'`, `'todo_list'`, `'ai_assistant'`
- `order_index` (int)
- `questionnaire_id` (uuid FK, nullable) — single questionnaire link / 单问卷链接
- `questionnaire_ids` (text[], nullable) — multiple questionnaires (for timeline) / 多问卷（时间线用）
- `title`, `content` (text)
- `visible` (bool)
- `participant_types` (text[]) — which types see this element / 哪些类型可见
- `width` (text) — `'25%'`, `'33%'`, `'50%'`, `'75%'`, `'100%'`
- Style: `style_padding`, `style_background`, `style_border_radius`, `style_height`, `style_bg_color`, `style_text_color`, `style_text_align`, `style_font_size`, `style_font_weight`, `style_border`, `style_border_color`, `style_shadow`, `style_margin`, `style_opacity`, `style_overflow`, `style_content_align`
- `button_action`, `button_label`, `button_border_radius` (text)
- `image_url` (text)
- `show_question_count`, `show_estimated_time`, `show_frequency` (bool)
- `screening_criteria` (text)
- `progress_style` (text) — `'bar'`, `'ring'`, `'steps'`
- `timeline_start_hour`, `timeline_end_hour` (int) — display range only, NOT schedule / 仅显示范围
- `timeline_days` (int)
- `todo_layout` (text) — `'horizontal'`, `'vertical'`
- `todo_auto_scroll` (bool)
- `card_display_style` (text)

**Child tables / 子表:**

`app_element_todo_card` — todo_list items: `id`, `element_id` (FK), `type` ('questionnaire'/'custom'), `questionnaire_id`, `title`, `description`, `completion_trigger` ('manual'/'time'/'questionnaire_complete'), `order_index`.

`app_element_help_section` — help items: `id`, `element_id` (FK), `title`, `content`, `order_index`.

`app_element_tab_section` — tab sections: `id`, `element_id` (FK), `label`, `question_ids` (text[]), `order_index`.

### 12.3 Public pages / 公开页面

Researcher-built web pages for recruitment and study introductions. Managed in Layout tab's "Public Pages" sub-tab via `PublicPageBuilder.tsx`.

研究员构建的网页，用于招募和研究介绍。在布局标签的"公开页面"子标签中管理。

**`app_public_page` table:**
- `id`, `project_id`, `title`, `slug`, `description`, `enabled`, `order_index`

**`app_public_page_block` table:**
- `id`, `page_id` (FK), `type` ('text'/'image'/'spacer'/'divider'), `content`, `image_url`, `order_index`
- Style: `style_padding`, `style_background`, `style_text_color`, `style_text_align`, `style_font_size`, `style_font_weight`, `style_height`, `style_border_radius`

### 12.4 Popup system / 弹窗系统

**`app_popup` table:** `id`, `project_id`, `title`, `content`, `popup_type`, `enabled`, `order_index`

**`app_popup_rule` table:** `id`, `popup_id` (FK), `trigger_type`, `trigger_value`, `order_index`

### 12.5 Layout persistence / 布局持久化

Auto-saved to flat tables with 1.5s debounce via `saveLayoutToDb()`. Loaded via `loadLayoutFromDb()`. Both in `src/easyresearch/utils/layoutSync.ts`. Everything is flat columns or relational tables — no JSONB blobs.

通过 `saveLayoutToDb()` 1.5秒防抖自动保存，通过 `loadLayoutFromDb()` 加载，均在 `layoutSync.ts` 中。一切都是扁平列或关系表——无JSONB。

---

## SYSTEM INVENTORY / 系统清单

**Active builder tabs: 9** — Settings, Questionnaires, Components, Logic, Flow, Layout, Preview, Translation, Responses (includes Participants sub-view)

**活跃标签页：9个** — 设置、问卷、组件、逻辑、流程、布局、预览、翻译、响应（含参与者子视图）

**Active response sub-views: 6** — Summary, Individual, Table, Cross-Tab, Export, Participants

**活跃响应子视图：6个** — 摘要、个体、表格、交叉分析、导出、参与者

**Question types: 47** — See Section 4.6

**问题类型：47种** — 见第4.6节

**TYPE 3 FUTURE FEATURES — DO NOT SHOW TO USERS YET:** 50+ builder tabs and 9 response sub-views fully implemented in code but hidden from UI.

**三类未来功能——暂不向用户展示：** 50多个构建器标签和9个响应子视图已在代码中完整实现，但在UI中隐藏。

---

## 14. AI FEATURES / AI 功能

<!-- CRC STARTS — TYPE 1 必查项 / MUST-CHECK ITEMS -->
<!-- ✅ T1-14.1: AI model is `google/gemini-3.1-flash-lite-preview` via OpenRouter — NOT any other model / AI 模型正确 -->
<!-- ✅ T1-14.2: Voice input uses Web Speech API (browser-based, zero cost) — no server-side STT / 语音输入用浏览器API -->
<!-- ✅ T1-14.3: 3-level AI inheritance: Project → Questionnaire → Question, each can override / 三级AI继承正常 -->
<!-- ✅ T1-14.4: AI fills answers on frontend ONLY — never writes directly to database / AI仅在前端填写 -->
<!-- ✅ T1-14.5: `ai_assistant` layout element type works in both 'popup' and 'card' display modes / AI助手元素两种显示模式正常 -->
<!-- ✅ T1-14.6: OpenRouter API key is hardcoded in edge function (NOT from Supabase secrets) to prevent shadow keys / API密钥硬编码防止被覆盖 -->
<!-- ✅ T1-14.7: Questionnaire-level AI toggles propagate to child questions when batch-apply is enabled / 问卷级AI开关批量传播到问题 -->
<!-- CRC ENDS -->

AI features operate at **3 levels**: Project, Questionnaire, and Question. Each level can configure AI behavior independently with inheritance from parent levels.

AI 功能在 **3 个层级** 运作：项目、问卷和问题。每个层级都可以独立配置 AI 行为，并从父层级继承设置。

### 14.1 AI Feature Types / AI 功能类型

Two categories of AI features:

两类 AI 功能：

1. **Voice Input** — Browser-based speech recognition (Web Speech API). No cost. Participants speak answers instead of typing.

   **语音输入** — 基于浏览器的语音识别（Web Speech API）。无需费用。参与者可以语音回答而不是打字。

2. **AI Chat Assistant** — Conversational AI chatbot that helps participants understand questions, provides answer suggestions, can fill answers on the frontend (not database), and supports bulk-fill for lazy participants.

   **AI 对话助手** — 对话式 AI 聊天机器人，帮助参与者理解问题、提供答案建议、可以在前端填写答案（不直接写入数据库）、支持批量填写。

### 14.2 Level 1: Project-Level AI / 项目级 AI

- Configured in Questionnaire tab > Project AI section, or via Layout Builder "AI Assistant" function element
- 在问卷标签页 > 项目 AI 部分配置，或通过布局构建器"AI 助手"功能元素
- Appears as floating chatbot in participant app (configurable name)
- 在参与者应用中显示为浮动聊天机器人（可配置名称）
- Default behavior: "Welcome to [project name]. How can I help you?" — can fill any visible form on the page
- 默认行为："欢迎来到[项目名称]。我能帮你什么？" — 可以填写页面上任何可见的表单
- Researcher can set AI Guidance (system prompt) to customize behavior
- 研究者可以设置 AI 指导（系统提示词）来自定义行为

### 14.3 Level 2: Questionnaire-Level AI / 问卷级 AI

Configured in each questionnaire's settings panel under "AI Support":

在每个问卷的设置面板中的"AI Support"下配置：

- **Toggle 1:** AI Voice Assistant — enable browser speech recognition for this questionnaire
- **开关 1：** AI 语音助手 — 为此问卷启用浏览器语音识别
- **Toggle 2:** AI Chat Assistant — enable conversational chatbot for this questionnaire
- **开关 2：** AI 对话助手 — 为此问卷启用对话聊天机器人
- **Toggle 3:** Enable voice input for all questions — batch-apply voice to every question
- **开关 3：** 为所有问题启用语音输入 — 批量为每个问题启用语音
- **Toggle 4:** Enable AI assist for all questions — batch-apply AI assist to every question
- **开关 4：** 为所有问题启用 AI 辅助 — 批量为每个问题启用 AI 辅助
- **AI Guidance:** Researcher-editable text that shapes AI behavior for this questionnaire
- **AI 指导：** 研究者可编辑的文本，塑造此问卷的 AI 行为

### 14.4 Level 3: Question-Level AI / 问题级 AI

Each question inherits AI settings from its parent questionnaire but can override:

每个问题从其父问卷继承 AI 设置，但可以覆盖：

- **Voice Input** toggle (on/off per question)
- **语音输入** 开关（每个问题可开/关）
- **AI Assist** toggle (help & enhance)
- **AI 辅助** 开关（帮助和增强）
- **AI Auto-answer** toggle (predictive fill)
- **AI 自动回答** 开关（预测性填写）
- **AI Guidance** per question (overrides questionnaire-level guidance for this question)
- 每个问题的 **AI 指导**（覆盖此问题的问卷级指导）

### 14.5 AI Behavior Rules / AI 行为规则

- AI fills answers on **frontend only** — never writes directly to database
- AI 仅在 **前端** 填写答案 — 永远不直接写入数据库
- User sees filled answers visually and can modify before submitting
- 用户可以看到已填写的答案，并在提交前修改
- AI can bulk-fill all questions when participant requests it
- 当参与者请求时，AI 可以批量填写所有问题
- Voice input uses Web Speech API (free, no API cost)
- 语音输入使用 Web Speech API（免费，无 API 费用）
- AI chat uses OpenRouter API: model `google/gemini-3.1-flash-lite-preview`
- AI 聊天使用 OpenRouter API：模型 `google/gemini-3.1-flash-lite-preview`

### 14.6 AI UI Integration / AI 界面集成

- Questionnaire-level chatbot: dropdown panel integrated into questionnaire card (not a separate floating button)
- 问卷级聊天机器人：集成到问卷卡片中的下拉面板（不是独立的浮动按钮）
- Project-level chatbot: floating element added via Layout Builder "AI Assistant" function element
- 项目级聊天机器人：通过布局构建器"AI 助手"功能元素添加的浮动元素
- All AI icons use Lucide components (Sparkles, Mic, MessageCircle) — no emojis
- 所有 AI 图标使用 Lucide 组件（Sparkles、Mic、MessageCircle）— 不使用表情符号
- AI settings preview: save and use Preview tab to test AI behavior
- AI 设置预览：保存后使用预览标签页测试 AI 行为

---
