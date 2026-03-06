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

Easier Research (branded "Easier") is a sub-app living under `/easyresearch/*` within the larger True-Easier-Research platform. 

Easier Research（品牌名为"Easier"）是一个子应用，位于更大的 True-Easier-Research 平台中的 `/easyresearch/*` 路径下。

- **Stack / 技术栈:** React 18, TypeScript, Vite, TailwindCSS
- **Backend / 后端:** Supabase (PostgreSQL, Auth, Edge Functions) — all tables live in the `care_connector` schema / 所有表都在 `care_connector` schema 中
- **Mobile / 移动端:** Capacitor for native iOS/Android push notifications / 用于原生 iOS/Android 推送通知的 Capacitor
- **State / 状态管理:** React hooks and local state only (no Redux or React Query) / 仅使用 React hooks 和本地状态（无 Redux 或 React Query）
- **Drag-and-drop / 拖拽:** `@hello-pangea/dnd` and `@dnd-kit/core`
- **Entry point / 入口点:** Routes defined in `src/App.tsx` under the EASYRESEARCH PLATFORM ROUTES section / 路由定义在 `src/App.tsx` 的 EASYRESEARCH PLATFORM ROUTES 部分
- **Development stage ai api key / 开发阶段 AI API 密钥:** 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 use google/gemma-3-27b-it to save my fucking money / 使用 google/gemma-3-27b-it 来节省我他妈的钱

---

## 2. RESEARCH PROJECT / 研究项目

Every study lives in the `research_project` table. A project can have multiple questionnaires (e.g. hourly, daily), and components (profile questions, FAQs) which are also questionnaires under the hood. 

每个研究都存储在 `research_project` table（第一层级)，每一个项目可以有多个问卷（如每小时、每日），以及组件（个人资料问题、FAQ），问卷和组件都储存在 'questionnaire` table(第二层级)，每个问卷有多个具体问题，比如单选、多选题，具体问题都储存在question` table (第三层级)


*research_project 数据类型:*
- `id` (uuid PK)
- `organization_id` (uuid FK) — which organization owns this project / 哪个组织拥有此项目 
- `researcher_id` (uuid FK) — which researcher created it / 哪个研究员创建了它
- `title` (text) — project name / 项目名称
- `description` (text) — purpose and goals / 项目介绍
- `status` (text) — 'draft' or 'published' / 项目状态，草稿还是发布
- `published_at` (timestamp) — when published, null if draft / 发布时间，草稿时为空
- `project_type` (text) — nullable and don't use it for now, we'll use to for survey, user research, etc / 目前先不要使用，未来将用于区分调研、用户研究等，目前不要在前端使用
- `methodology_type` (text) — two types for now, one_time multi_time multi_time should be desplayed as longitutal on frontend 研究方法类型，目前有两种，单次和多次，多次在前端显示为长期调研，但注意，我们目前不对分类进行一切后续的显示限制，两种方式均可以添加多个问卷，分类选择只是参考 
- `survey_code` (text) — short code participants can enter to join / 参与者可以输入加入研究的研究码

*Feature toggles / 功能选项:*
- `ai_enabled` (bool) — allow AI-assisted questions / 允许AI辅助问题
- `voice_enabled` (bool) — allow voice input / 允许语音输入
- `notification_enabled` (bool) — enable notifications for this project / 为此项目启用通知
- `allow_participant_dnd` (bool) — let participants set Do Not Disturb hours / 让参与者设置免打扰时间
- `messaging_enabled` (bool) — enable direct messaging between researcher and participants / 启用研究员和参与者之间的直接消息


*Participant config / 参与者设置:*
- `max_participant` (int) — enrollment cap / 参与者上限


*Compensation / 补偿:*
- `compensation_amount` (numeric) — payment amount / 付款金额
- `compensation_type` (text) — 'none', 'monetary', 'gift_card', 'raffle'

*Schedule / 时间安排:*

- `start_at` (timestamp) — study start date / 研究开始日期
- `end_at` (timestamp) — study end date / 研究结束日期
- `allow_start_date_selection` (bool) — let participants choose their own start date / 让参与者选择自己的开始日期
- `participant_start_day` (fk to participant_start_day join table to store the actual start day of the participant) / 如果参与者选择自己的开始日期，把自定义开始日期储存于participant_start_day join table

以下只对长期研究显示 (methodology_type=multi_day, 但注意，这些设置只是前端显示，并没有数据约束，真正的数据约束由具体的questionaire里的项目时长决定)：
- `study_duration` (int) — number of days for longitudinal studies / 纵向研究的天数 
- `survey_frequency` (text) — 'hourly', '2hours', '4hours', 'daily', 'twice_daily', 'weekly'


*Onboarding / 入门说明:*
- `onboarding_required` (bool) — show onboarding instructions before starting / 开始前显示入门说明
- `onboarding_instruction` (text) — the instruction text / 说明文本



*Incentives / 激励:*
- `incentive_enabled` (bool) — whether incentives are active / 激励是否激活
- `incentive_type` (text) — 'fixed', 'variable', etc.
- `incentive_amount` (numeric) — payment amount / 付款金额
- `incentive_currency` (text) — e.g. 'USD'
- `incentive_description` (text) — what participants receive / 参与者获得什么
- `incentive_payment_method` (text) — 'manual', 'paypal', etc.
- `incentive_payment_instructions` (text) — how to claim payment / 如何申请付款

*Template columns (on all three tables: project, questionnaire, question) / 模板列（在所有三个表上：project、questionnaire、question）:*
- `is_template` (bool) — true = this row is a template, not a real project / true = 此行是模板，不是真实项目
- `template_is_public_or_private` (bool) — true = public, false = private / true = 公开，false = 私有
- `template_category` (text) — grouping label / 分组标签
- `source_template_id` (uuid FK to self) — which template this was cloned from / 此模板克隆自哪个模板

*Layout theme/header (flat columns — layout tabs and elements are in separate tables, see section 13) / 布局主题/标题（扁平列——布局标签和元素在单独的表中，见第13节）:*
- `layout_show_header` (bool) — show header bar in participant app / 在参与者应用中显示标题栏
- `layout_header_title` (text) — custom header title / 自定义标题
- `layout_theme_primary_color` (text) — primary accent color, e.g. '#10b981' / 主要强调色，如 '#10b981'
- `layout_theme_background_color` (text) — background color / 背景色
- `layout_theme_card_style` (text) — 'flat', 'elevated', or 'outlined'



## 8. QUESTIONNAIRE / 问卷

Each questionnaire is a row in the `questionnaire` table in the `care_connector` schema. It belongs to one project and has a type field that determines its purpose:

问卷储存在 `questionnaire` table，通过


1. id 
2. project_id - 所属研究项目
3. questionnaire_type - 问卷类型
4. title - 问卷标题
5. description - 问卷描述
6. estimated_duration - 预计完成时间

问卷通过questionnaire_type定义类型：

1. 'questionnaire' - 常规调查问卷

2-6虽然不是狭义上的问卷，但在这个项目里研究所使用的所有表单也都使用`questionnaire` table

2. 'consent' - 知情同意书
3. 'screening' - 筛选问卷
4. 'profile' - 个人资料
5. 'help' - 帮助文档
6. 'custom' - 自定义类型

Questionnaires are linked to participant types through the `questionnaire_participant_type` junction table — a many-to-many relationship. A questionnaire can be assigned to multiple participant types, and a participant type can have multiple questionnaires.

问卷通过 `questionnaire_participant_type` 连接表链接到参与者类型——多对多关系。一个问卷可以分配给多个参与者类型，一个参与者类型可以有多个问卷。

## 9. QUESTIONS / 问题

The question system supports **27 question types** across 6 categories, all stored in ONE flat relational table: `question`. No JSONB config columns. Type-specific settings are flat `cfg_*` columns. Options live in `question_option`. Responses live in `survey_response`. The canonical type list lives in `src/easyresearch/constants/questionTypes.ts`.

问题系统支持 **27种问题类型**，分为6大类别，全部存储在一张扁平关系表 `question` 中。没有 JSONB 配置列。类型特定设置为扁平 `cfg_*` 列。选项在 `question_option` 中。响应在 `survey_response` 中。规范类型列表在 `src/easyresearch/constants/questionTypes.ts` 中。

Each question is a row in the `question` table (renamed from the old `survey_question` — NEVER use `survey_question` anymore). A question belongs to one project via `project_id` and optionally to one questionnaire via `questionnaire_id`.

每个问题是 `question` 表中的一行（从旧的 `survey_question` 重命名——永远不要再使用 `survey_question`）。一个问题通过 `project_id` 属于一个项目，可选地通过 `questionnaire_id` 属于一个问卷。

### 9.1 `question` table columns / 表字段

**Core fields / 核心字段:**

- `id` (uuid PK)
- `project_id` (uuid FK → research_project) — always set / 始终设置
- `questionnaire_id` (uuid FK → questionnaire) — links the question to a specific questionnaire / 将问题链接到特定问卷
- `question_type` (text) — the type string from `questionTypes.ts`, e.g. `'single_choice'`, `'slider'`, `'matrix'` / 来自 `questionTypes.ts` 的类型字符串
- `question_text` (text) — the actual question prompt shown to participants / 向参与者显示的实际问题提示
- `question_description` (text) — optional help text below the question / 问题下方的可选帮助文本
- `order_index` (int) — position within the questionnaire / 在问卷中的位置
- `required` (bool) — whether the participant must answer / 参与者是否必须回答
- `section_name` (text) — groups questions into sections for display / 将问题分组到部分以供显示

**Feature toggles / 功能开关:**

- `allow_voice` (bool) — voice input allowed for this question / 此问题允许语音输入
- `allow_ai_assist` (bool) — AI assistant allowed for this question / 此问题允许AI助手
- `allow_other` (bool) — adds an "Other" free-text option (for choice types) / 添加"其他"自由文本选项（用于选择类型）
- `allow_none` (bool) — adds a "None of the above" option (for choice types) / 添加"以上都不是"选项（用于选择类型）

**Type-specific config columns (`cfg_*`, 38 columns) / 类型特定配置列:**

These are flat database columns (NOT JSONB) on the `question` table. Each question type only uses its relevant `cfg_*` columns; the rest are null. They are hydrated into an in-memory `question_config` object by `questionConfigSync.ts`.

这些是 `question` 表上的扁平数据库列（不是 JSONB）。每种问题类型仅使用其相关的 `cfg_*` 列；其余为 null。它们通过 `questionConfigSync.ts` 水合为内存中的 `question_config` 对象。

- `cfg_min_value` (numeric) — minimum value for slider, bipolar_scale / 滑块、双极量表的最小值
- `cfg_max_value` (numeric) — maximum value for slider, bipolar_scale, rating / 滑块、双极量表、评分的最大值
- `cfg_step` (numeric) — step increment for slider, bipolar_scale / 滑块、双极量表的步长
- `cfg_min_label` (text) — label for minimum end of scale / 量表最小端的标签
- `cfg_max_label` (text) — label for maximum end of scale / 量表最大端的标签
- `cfg_max_length` (int) — character limit for text_short, text_long / 短文本、长文本的字符限制
- `cfg_columns` (text) — JSON string of column headers for matrix type / 矩阵类型的列标题 JSON 字符串
- `cfg_scale_type` (text) — scale range for likert_scale, e.g. `'1-5'`, `'1-7'` / 李克特量表的量表范围
- `cfg_custom_labels` (text) — JSON string of custom point labels for likert_scale / 李克特量表的自定义点标签 JSON 字符串
- `cfg_layout` (text) — layout mode for checkbox_group: `'vertical'` or `'grid'` / 复选框组的布局模式
- `cfg_columns_count` (int) — number of columns for checkbox_group grid layout / 复选框组网格布局的列数
- `cfg_allow_multiple` (bool) — allow multiple selections for image_choice / 图片选择允许多选
- `cfg_yes_label` (text) — custom "Yes" text for yes_no / 是否题的自定义"是"文本
- `cfg_no_label` (text) — custom "No" text for yes_no / 是否题的自定义"否"文本
- `cfg_max_files` (int) — maximum files for file_upload / 文件上传的最大文件数
- `cfg_max_size_mb` (int) — max file size in MB for file_upload / 文件上传的最大文件大小（MB）
- `cfg_accepted_types` (text) — allowed MIME types for file_upload, e.g. `'image/*,.pdf'` / 文件上传允许的 MIME 类型
- `cfg_content_type` (text) — content type for instruction block: `'text'` / 说明块的内容类型
- `cfg_section_icon` (text) — icon for section_header / 章节标题的图标
- `cfg_section_color` (text) — color for section_header, e.g. `'#10b981'` / 章节标题的颜色
- `cfg_content` (text) — content for text_block / 文本块的内容
- `cfg_font_size` (int) — font size for text_block / 文本块的字号
- `cfg_image_url` (text) — URL for image_block / 图片块的 URL
- `cfg_caption` (text) — caption for image_block / 图片块的说明文字
- `cfg_alt_text` (text) — alt text for image_block / 图片块的替代文本
- `cfg_max_width` (text) — max width for image_block, e.g. `'100%'` / 图片块的最大宽度
- `cfg_style` (text) — line style for divider: `'solid'`, `'dashed'`, `'dotted'` / 分隔线样式
- `cfg_color` (text) — color for divider / 分隔线颜色
- `cfg_thickness` (int) — thickness in px for divider / 分隔线粗细（像素）
- `cfg_show_value_labels` (bool) — show value labels on bipolar_scale / 双极量表上显示值标签

**Validation rule columns (`vr_*`, 8 columns) / 验证规则列:**

- `vr_min_length` (int) — minimum text length / 最小文本长度
- `vr_max_length` (int) — maximum text length / 最大文本长度
- `vr_min_value` (numeric) — minimum numeric value / 最小数值
- `vr_max_value` (numeric) — maximum numeric value / 最大数值
- `vr_min` (numeric) — alias for min value / 最小值别名
- `vr_max` (numeric) — alias for max value / 最大值别名
- `vr_allow_future_dates` (bool) — allow dates in the future / 允许未来日期
- `vr_allow_past_dates` (bool) — allow dates in the past / 允许过去日期

**Other config columns / 其他配置列:**

- `logic_rules` — DROPPED. All logic is now in the `research_logic` table (see section 5). / 已删除。所有逻辑现在在 `research_logic` 表中（见第5节）。
- `ai_config` — AI-related settings (reserved, not yet implemented) / AI相关设置（保留，尚未实现）
- `scoring_config` — scoring/weighting for analytics / 分析的评分/权重
- `piping_config` — answer piping into later questions / 答案传递到后续问题

### 9.2 `question_option` table / 问题选项表

Options are stored as individual rows in `question_option` (one row per option), NOT in JSONB. Used by: `single_choice`, `multiple_choice`, `dropdown`, `checkbox_group`, `matrix` (rows), `ranking`, `image_choice`.

选项作为单独的行存储在 `question_option` 中（每个选项一行），不在 JSONB 中。以下类型使用：`single_choice`、`multiple_choice`、`dropdown`、`checkbox_group`、`matrix`（行）、`ranking`、`image_choice`。

- `id` (uuid PK)
- `question_id` (uuid FK → question) — which question this option belongs to / 此选项属于哪个问题
- `option_text` (text) — display text shown to participant / 向参与者显示的文本
- `option_value` (text) — programmatic value (e.g. image URL for image_choice) / 程序值（如 image_choice 的图片 URL）
- `order_index` (int) — display position / 显示位置
- `is_other` (bool) — whether this is the "Other" free-text option / 是否是"其他"自由文本选项

### 9.3 `survey_response` table — response storage / 响应存储

Responses are stored in `survey_response` with **typed columns**. Each question type writes to exactly ONE response column. This allows type-safe queries and aggregation.

响应存储在 `survey_response` 中，使用**类型化列**。每种问题类型只写入一个响应列。这允许类型安全的查询和聚合。

- `answer_text` (text) — for: `text_short`, `text_long`, `email`, `phone`, `date`, `time`, `single_choice`, `dropdown`, `yes_no` / 用于：短文本、长文本、电子邮件、电话、日期、时间、单选、下拉、是否
- `answer_number` (numeric) — for: `number`, `slider`, `bipolar_scale`, `rating`, `likert_scale`, `nps` / 用于：数字、滑块、双极量表、评分、李克特量表、NPS
- `answer_array` (text[]) — for: `multiple_choice`, `checkbox_group`, `ranking` / 用于：多选、复选框组、排名
- `answer_json` (JSONB) — for: `matrix`, `file_upload`, `image_choice` (complex structured data only) / 用于：矩阵、文件上传、图片选择（仅复杂结构数据）

Layout types (`section_header`, `text_block`, `divider`, `image_block`, `instruction`) do NOT create response rows — they are display-only. / 布局类型不创建响应行——它们仅用于显示。

### 9.4 Participant type filtering / 参与者类型过滤

Questions can be shown per participant type at **3 levels**: / 问题可以在**3个层级**按参与者类型显示：

**Level 1 — Project:** Participant types are defined at the project level in `participant_type` table. Each enrollment stores `participant_type_id` (uuid FK → participant_type). / 第一层级——项目：参与者类型在项目级别的 `participant_type` 表中定义。每个注册存储 `participant_type_id`。

**Level 2 — Questionnaire:** Questionnaires are linked to participant types via the `questionnaire_participant_type` junction table (questionnaire_id, participant_type_id). A questionnaire can be assigned to multiple types. Only participants of the assigned types see the questionnaire. If no types assigned, all participants see it. / 第二层级——问卷：问卷通过 `questionnaire_participant_type` 连接表链接到参与者类型。如果未分配类型，所有参与者都能看到。

**Level 3 — Question:** Questions are linked to participant types via the `question_participant_type` junction table (question_id, participant_type_id). A question can be assigned to multiple types. Only participants of the assigned types see the question. If no types assigned, all participants see it. / 第三层级——问题：问题通过 `question_participant_type` 连接表链接到参与者类型。如果未分配类型，所有参与者都能看到。

**Filtering logic:** Survey views (`ParticipantSurveyView`, `OneTimeSurveyView`) use `filterQuestionsByParticipantType()` and `filterQuestionnairesByParticipantType()` utilities in `src/easyresearch/utils/participantTypeFilter.ts` to filter content based on `enrollment.participant_type_id`. / 过滤逻辑：调查视图使用 `participantTypeFilter.ts` 中的过滤工具函数过滤内容。

### 9.5 The 27 Question Types — Full Reference / 27种问题类型——完整参考

#### Category 1: Text Input (2 types) / 文本输入（2种）

**1. `text_short` — Short Text / 短文本**

Single-line text input for brief responses (names, single words, short phrases). / 单行文本输入，用于简短回答（姓名、单词、短语）。

- **Requires options:** No / 不需要选项
- **Supports allow_other / allow_none:** No / 不支持
- **Config columns used:** `cfg_max_length` (default 100) / 使用的配置列：`cfg_max_length`（默认100）
- **Validation columns:** `vr_min_length`, `vr_max_length` / 验证列
- **Response column:** `answer_text` / 响应列
- **Supports voice input:** Yes (if `allow_voice = true`) / 支持语音输入

**2. `text_long` — Long Text / 长文本**

Multi-line textarea for detailed responses (paragraphs, open-ended feedback). Displays as a resizable textarea with min-height 120px. / 多行文本区域，用于详细回答（段落、开放式反馈）。显示为可调整大小的文本区域。

- **Requires options:** No / 不需要选项
- **Supports allow_other / allow_none:** No / 不支持
- **Config columns used:** `cfg_max_length` (default 2000) / 使用的配置列：`cfg_max_length`（默认2000）
- **Validation columns:** `vr_min_length`, `vr_max_length` / 验证列
- **Response column:** `answer_text` / 响应列
- **Supports voice input:** Yes (if `allow_voice = true`) / 支持语音输入

#### Category 2: Choice Types (6 types) / 选择类型（6种）

**3. `single_choice` — Single Choice (Radio Buttons) / 单选**

Radio button group — participant selects exactly one option. Each option is a row in `question_option`. Supports "Other" free-text and "None of the above". / 单选按钮组——参与者选择一个选项。每个选项是 `question_option` 中的一行。支持"其他"和"以上都不是"。

- **Requires options:** Yes (`question_option` rows) / 需要选项
- **Supports allow_other:** Yes — adds free-text "Other" option / 支持——添加"其他"自由文本选项
- **Supports allow_none:** Yes — adds "None of the above" option / 支持——添加"以上都不是"选项
- **Config columns used:** None / 不使用配置列
- **Response column:** `answer_text` (stores selected `option.id`) / 响应列：存储选中的 option.id
- **Supports voice input:** No / 不支持语音输入

**4. `multiple_choice` — Multiple Choice (Checkboxes) / 多选**

Checkbox group — participant selects one or more options. Supports "Other" and "None of the above". / 复选框组——参与者选择一个或多个选项。支持"其他"和"以上都不是"。

- **Requires options:** Yes (`question_option` rows) / 需要选项
- **Supports allow_other:** Yes / 支持
- **Supports allow_none:** Yes / 支持
- **Config columns used:** None / 不使用配置列
- **Response column:** `answer_array` (stores array of selected `option.id` values) / 响应列：存储选中的 option.id 数组
- **Supports voice input:** No / 不支持语音输入

**5. `dropdown` — Dropdown Select / 下拉选择**

Space-efficient dropdown menu for when there are many options. Does NOT support "Other" or "None". / 节省空间的下拉菜单，适用于选项很多的情况。不支持"其他"或"以上都不是"。

- **Requires options:** Yes (`question_option` rows) / 需要选项
- **Supports allow_other / allow_none:** No / 不支持
- **Config columns used:** None / 不使用配置列
- **Response column:** `answer_text` (stores selected `option.id`) / 响应列：存储选中的 option.id
- **Supports voice input:** No / 不支持语音输入

**6. `checkbox_group` — Categorized Checkbox Group / 分类复选框组**

Like `multiple_choice` but with grid/column layout support. Used for categorized multi-select (e.g. activity types, challenge types). Can display options in 1, 2, or 3 columns. / 类似 `multiple_choice` 但支持网格/列布局。用于分类多选（如活动类型、挑战类型）。可以1、2或3列显示选项。

- **Requires options:** Yes (`question_option` rows) / 需要选项
- **Supports allow_other:** Yes / 支持
- **Supports allow_none:** No / 不支持
- **Config columns used:** `cfg_layout` (`'vertical'` or `'grid'`), `cfg_columns_count` (1, 2, or 3) / 使用的配置列
- **Response column:** `answer_array` (stores array of selected values) / 响应列：存储选中值数组
- **Supports voice input:** No / 不支持语音输入

**7. `image_choice` — Image-Based Choice / 图片选择**

Select from image-based or emoji-based options (e.g. emoji mood picker, visual stimuli). Options store image URLs in `option_value` and display labels in `option_text`. Can allow single or multiple selection. / 从图片或表情选项中选择。选项在 `option_value` 中存储图片 URL，在 `option_text` 中存储标签。可以允许单选或多选。

- **Requires options:** Yes (`question_option` rows, `option_value` = image URL or emoji) / 需要选项
- **Supports allow_other / allow_none:** No / 不支持
- **Config columns used:** `cfg_allow_multiple` (bool, default false) / 使用的配置列
- **Response column:** `answer_text` (single) or `answer_json` (multiple) / 响应列
- **Supports voice input:** No / 不支持语音输入

**8. `yes_no` — Yes / No Toggle / 是否题**

Simple binary choice with customizable labels. Displays as two large toggle buttons. / 简单的二元选择，标签可自定义。显示为两个大切换按钮。

- **Requires options:** No (built-in Yes/No) / 不需要选项（内置是/否）
- **Supports allow_other / allow_none:** No / 不支持
- **Config columns used:** `cfg_yes_label` (default "Yes"), `cfg_no_label` (default "No") / 使用的配置列
- **Response column:** `answer_text` (stores `'yes'` or `'no'`) / 响应列：存储 `'yes'` 或 `'no'`
- **Supports voice input:** No / 不支持语音输入

#### Category 3: Scale Types (5 types) / 量表类型（5种）

**9. `slider` — Range Slider / 范围滑块**

Continuous range slider for numeric input. Displays a horizontal slider with current value. / 连续范围滑块，用于数字输入。显示带当前值的水平滑块。

- **Requires options:** No / 不需要选项
- **Config columns used:** `cfg_min_value` (default 0), `cfg_max_value` (default 10), `cfg_step` (default 1), `cfg_min_label`, `cfg_max_label` / 使用的配置列
- **Response column:** `answer_number` / 响应列
- **Supports voice input:** No / 不支持语音输入

**10. `bipolar_scale` — Bipolar Scale / 双极量表**

Negative-to-positive scale (e.g. -3 to +3) with labeled endpoints. Displays as clickable number buttons with color coding (red for negative, green for positive, gray for zero). / 负到正量表（如 -3 到 +3）。显示为可点击的数字按钮，带颜色编码（红色负值、绿色正值、灰色零值）。

- **Requires options:** No / 不需要选项
- **Config columns used:** `cfg_min_value` (default -3), `cfg_max_value` (default 3), `cfg_step` (default 1), `cfg_min_label`, `cfg_max_label`, `cfg_show_value_labels` (default true) / 使用的配置列
- **Response column:** `answer_number` / 响应列
- **Supports voice input:** No / 不支持语音输入

**11. `rating` — Star / Number Rating / 星级/数字评分**

Star or number rating scale (1-5, 1-10, etc.). Displays as a row of clickable numbered buttons. / 星级或数字评分量表。显示为一排可点击的数字按钮。

- **Requires options:** No / 不需要选项
- **Config columns used:** `cfg_max_value` (default 5) / 使用的配置列
- **Response column:** `answer_number` / 响应列
- **Supports voice input:** No / 不支持语音输入

**12. `likert_scale` — Likert Agreement Scale / 李克特同意量表**

Agreement scale (Strongly Disagree to Strongly Agree). Displays as labeled radio buttons. Supports configurable scale range and custom point labels. / 同意量表（非常不同意到非常同意）。显示为带标签的单选按钮。支持可配置的量表范围和自定义点标签。

- **Requires options:** No (labels are auto-generated or custom) / 不需要选项（标签自动生成或自定义）
- **Config columns used:** `cfg_scale_type` (e.g. `'1-5'`, `'1-7'`), `cfg_custom_labels` (JSON array of strings), `cfg_min_label`, `cfg_max_label` / 使用的配置列
- **Response column:** `answer_number` / 响应列
- **Supports voice input:** No / 不支持语音输入

**13. `nps` — Net Promoter Score / 净推荐值**

Standard NPS question (0-10 likelihood to recommend). Displays 11 numbered buttons with color coding: 0-6 red (detractors), 7-8 yellow (passives), 9-10 green (promoters). Labels show "Not at all likely" to "Extremely likely". / 标准 NPS 问题（0-10 推荐可能性）。显示11个带颜色编码的数字按钮。

- **Requires options:** No (fixed 0-10 scale) / 不需要选项（固定 0-10 量表）
- **Config columns used:** None (NPS is a fixed standard) / 不使用配置列
- **Response column:** `answer_number` / 响应列
- **Supports voice input:** No / 不支持语音输入

#### Category 4: Data Input Types (5 types) / 数据输入类型（5种）

**14. `number` — Numeric Input / 数字输入**

Numeric input field. Accepts integers and decimals. / 数字输入字段。接受整数和小数。

- **Requires options:** No / 不需要选项
- **Config columns used:** None / 不使用配置列
- **Validation columns:** `vr_min_value`, `vr_max_value` / 验证列
- **Response column:** `answer_number` / 响应列
- **Supports voice input:** No / 不支持语音输入

**15. `date` — Date Picker / 日期选择器**

Native HTML date picker input. / 原生 HTML 日期选择器输入。

- **Requires options:** No / 不需要选项
- **Config columns used:** None / 不使用配置列
- **Validation columns:** `vr_allow_future_dates`, `vr_allow_past_dates` / 验证列
- **Response column:** `answer_text` (ISO date string, e.g. `'2025-03-05'`) / 响应列：ISO 日期字符串
- **Supports voice input:** No / 不支持语音输入

**16. `time` — Time Picker / 时间选择器**

Native HTML time picker input. / 原生 HTML 时间选择器输入。

- **Requires options:** No / 不需要选项
- **Config columns used:** None / 不使用配置列
- **Response column:** `answer_text` (time string, e.g. `'14:30'`) / 响应列：时间字符串
- **Supports voice input:** No / 不支持语音输入

**17. `email` — Email Address / 电子邮件**

Email input with browser-native validation. / 带浏览器原生验证的电子邮件输入。

- **Requires options:** No / 不需要选项
- **Config columns used:** None / 不使用配置列
- **Validation columns:** Browser validates email format / 浏览器验证电子邮件格式
- **Response column:** `answer_text` / 响应列
- **Supports voice input:** No / 不支持语音输入

**18. `phone` — Phone Number / 电话号码**

Phone number input with `type="tel"`. Placeholder shows formatting hint. / 电话号码输入。占位符显示格式提示。

- **Requires options:** No / 不需要选项
- **Config columns used:** None / 不使用配置列
- **Response column:** `answer_text` / 响应列
- **Supports voice input:** No / 不支持语音输入

#### Category 5: Advanced Types (5 types) / 高级类型（5种）

**19. `matrix` — Matrix / Grid Question / 矩阵/网格问题**

Grid of rows × columns for multi-item scales. Rows are stored as `question_option` entries. Columns are stored in `cfg_columns` as a JSON string array. Each row gets exactly one column selection. / 行×列的网格。行存储为 `question_option` 条目。列存储在 `cfg_columns` 中作为 JSON 字符串数组。每行获得一个列选择。

Example: Rate satisfaction across 5 categories (rows) on a 5-point scale (columns). / 示例：在5点量表（列）上对5个类别（行）进行满意度评分。

- **Requires options:** Yes (`question_option` rows = matrix rows) / 需要选项（选项行 = 矩阵行）
- **Config columns used:** `cfg_columns` (JSON array, e.g. `'["Strongly Disagree","Disagree","Neutral","Agree","Strongly Agree"]'`) / 使用的配置列
- **Response column:** `answer_json` (object: `{ "row_option_id": "selected_column_label", ... }`) / 响应列：对象
- **Supports voice input:** No / 不支持语音输入

**20. `ranking` — Drag-to-Rank / 拖拽排序**

Drag items to rank in order of preference. Options stored in `question_option`. Participant reorders them using up/down arrow buttons. / 拖拽项目按偏好排序。选项存储在 `question_option` 中。参与者使用上下箭头按钮重新排序。

- **Requires options:** Yes (`question_option` rows) / 需要选项
- **Config columns used:** None / 不使用配置列
- **Response column:** `answer_array` (ordered array of `option.id` values, first = highest rank) / 响应列：有序的 option.id 数组，第一个 = 最高排名
- **Supports voice input:** No / 不支持语音输入

**21. `file_upload` — File Upload / 文件上传**

Allow participants to upload images, documents, or other files. Displays a drag-and-drop zone with file type and size constraints. / 允许参与者上传图片、文档或其他文件。显示带文件类型和大小限制的拖放区域。

- **Requires options:** No / 不需要选项
- **Config columns used:** `cfg_max_files` (default 1), `cfg_max_size_mb` (default 10), `cfg_accepted_types` (default `'image/*,.pdf,.doc,.docx'`) / 使用的配置列
- **Response column:** `answer_json` (file metadata) / 响应列：文件元数据
- **Supports voice input:** No / 不支持语音输入

**22. `instruction` — Instruction Block / 说明块**

Display-only block showing instructions, information, or media to participants. No response is collected. Used to provide context or guidance between questions. / 仅显示块，向参与者展示说明、信息或媒体。不收集响应。用于在问题之间提供上下文或指导。

- **Requires options:** No / 不需要选项
- **Config columns used:** `cfg_content_type` (default `'text'`) / 使用的配置列
- **Response column:** None (display only) / 无（仅显示）
- **Supports voice input:** No / 不支持语音输入

#### Category 6: Layout Types (4 types) / 布局类型（4种）

These types do NOT collect responses. They are used purely for visual structure and organization. / 这些类型不收集响应。它们仅用于视觉结构和组织。

**23. `section_header` — Section / Tab Header / 章节/标签页标题**

Groups questions into tabs or sections. All questions after a section_header until the next section_header belong to that section. The `groupQuestionsBySections()` utility in `questionTypes.ts` handles the grouping logic. / 将问题分组到标签页或章节中。section_header 之后直到下一个 section_header 之间的所有问题属于该章节。`questionTypes.ts` 中的 `groupQuestionsBySections()` 处理分组逻辑。

- **Config columns used:** `cfg_section_icon` (emoji or icon name), `cfg_section_color` (hex color, default `'#10b981'`) / 使用的配置列
- **Response column:** None / 无
- **question_text is used as:** Section title / 章节标题

**24. `text_block` — Rich Text Block / 富文本块**

Displays rich text content — descriptions, notes, formatted information — between questions. / 在问题之间显示富文本内容——描述、注释、格式化信息。

- **Config columns used:** `cfg_content` (text content), `cfg_font_size` (default 14) / 使用的配置列
- **Response column:** None / 无

**25. `divider` — Divider Line / 分隔线**

Visual separator line between sections or questions. / 章节或问题之间的视觉分隔线。

- **Config columns used:** `cfg_style` (`'solid'`, `'dashed'`, `'dotted'`), `cfg_color` (default `'#e5e7eb'`), `cfg_thickness` (default 1, in px) / 使用的配置列
- **Response column:** None / 无

**26. `image_block` — Image Display / 图片展示**

Displays an image with optional caption. No response collected. Used for visual stimuli, instructions with images, etc. / 显示带可选说明文字的图片。不收集响应。用于视觉刺激、带图片的说明等。

- **Config columns used:** `cfg_image_url`, `cfg_caption`, `cfg_alt_text`, `cfg_max_width` (default `'100%'`) / 使用的配置列
- **Response column:** None / 无

**27. `constant_sum` — Constant Sum / 固定总额分配**

Participants distribute a fixed total (e.g. 100 points) across multiple options. The sum of all inputs must equal the configured total. Uses `question_option` rows for the items to distribute across. / 参与者将固定总额（如100分）分配到多个选项中。所有输入之和必须等于配置的总额。使用 `question_option` 行作为分配项目。

- **Config columns used:** `cfg_total` (integer, default 100 — the total participants must distribute) / 使用的配置列：`cfg_total`（整数，默认100——参与者必须分配的总数）
- **Response column:** `answer_json` — `{ "option_id_1": 40, "option_id_2": 60 }` / 响应列：`answer_json`——以选项ID为键、分配数值为值的JSON对象
- **Options:** Stored in `question_option` table (same as choice types) / 选项存储在 `question_option` 表中

**28. `signature` — Signature Pad / 签名板**

Draw a signature on a touch/mouse canvas. Captures the signature as a base64 PNG data URI. Used for consent forms, verification, or legal agreements. / 在触摸/鼠标画布上绘制签名。以 base64 PNG 数据URI形式捕获签名。用于同意书、验证或法律协议。

- **Config columns used:** (none) / 使用的配置列：（无）
- **Response column:** `answer_text` — base64-encoded PNG data URI (`data:image/png;base64,...`) / 响应列：`answer_text`——base64编码的PNG数据URI
- **Options:** None / 无选项

**29. `address` — Structured Address / 结构化地址**

Structured address input with separate fields for street, city, state/province, postal code, and (optionally) country. Each field is stored as a key in a JSON object. / 结构化地址输入，包含街道、城市、州/省、邮政编码和（可选的）国家的独立字段。每个字段作为JSON对象中的键存储。

- **Config columns used:** `cfg_show_country` (boolean, default `true` — whether to display the country field) / 使用的配置列：`cfg_show_country`（布尔值，默认 `true`——是否显示国家字段）
- **Response column:** `answer_json` — `{ "street": "123 Main St", "city": "SF", "state": "CA", "postal_code": "94102", "country": "US" }` / 响应列：`answer_json`
- **Options:** None / 无选项

**30. `slider_range` — Range Slider (Dual-Handle) / 范围滑块（双手柄）**

Dual-handle slider for selecting a numeric range (low–high). Participant chooses both a lower and upper bound within the configured min/max. Useful for price ranges, age ranges, time windows, etc. / 双手柄滑块，用于选择数值范围（低–高）。参与者在配置的最小/最大值范围内选择下限和上限。适用于价格范围、年龄范围、时间窗口等。

- **Config columns used:** `cfg_min_value`, `cfg_max_value`, `cfg_step`, `cfg_min_label`, `cfg_max_label` (reuses same columns as `slider` / `bipolar_scale`) / 使用的配置列：复用 `slider`/`bipolar_scale` 的相同列
- **Response column:** `answer_json` — `{ "low": 25, "high": 75 }` / 响应列：`answer_json`——`{ "low": 25, "high": 75 }`
- **Options:** None / 无选项

### 9.6 Response column mapping (quick reference) / 响应列映射（快速参考）

| `answer_text` | `answer_number` | `answer_array` | `answer_json` | None (no response) |
|---|---|---|---|---|
| `text_short` | `number` | `multiple_choice` | `matrix` | `section_header` |
| `text_long` | `slider` | `checkbox_group` | `file_upload` | `text_block` |
| `single_choice` | `bipolar_scale` | `ranking` | `image_choice` (multi) | `divider` |
| `dropdown` | `rating` | | `constant_sum` | `image_block` |
| `yes_no` | `likert_scale` | | `address` | `instruction` |
| `date` | `nps` | | `slider_range` | |
| `time` | | | | |
| `email` | | | | |
| `phone` | | | | |
| `signature` | | | | |
| `image_choice` (single) | | | | |

### 9.7 Config column mapping per question type / 每种问题类型的配置列映射

| Question Type | Config Columns Used |
|---|---|
| `text_short` | `cfg_max_length` |
| `text_long` | `cfg_max_length` |
| `single_choice` | (none) |
| `multiple_choice` | (none) |
| `dropdown` | (none) |
| `checkbox_group` | `cfg_layout`, `cfg_columns_count` |
| `image_choice` | `cfg_allow_multiple` |
| `yes_no` | `cfg_yes_label`, `cfg_no_label` |
| `slider` | `cfg_min_value`, `cfg_max_value`, `cfg_step`, `cfg_min_label`, `cfg_max_label` |
| `bipolar_scale` | `cfg_min_value`, `cfg_max_value`, `cfg_step`, `cfg_min_label`, `cfg_max_label`, `cfg_show_value_labels` |
| `rating` | `cfg_max_value` |
| `likert_scale` | `cfg_scale_type`, `cfg_custom_labels`, `cfg_min_label`, `cfg_max_label` |
| `nps` | (none — fixed 0-10) |
| `number` | (none) |
| `date` | (none) |
| `time` | (none) |
| `email` | (none) |
| `phone` | (none) |
| `matrix` | `cfg_columns` |
| `ranking` | (none) |
| `file_upload` | `cfg_max_files`, `cfg_max_size_mb`, `cfg_accepted_types` |
| `instruction` | `cfg_content_type` |
| `section_header` | `cfg_section_icon`, `cfg_section_color` |
| `text_block` | `cfg_content`, `cfg_font_size` |
| `divider` | `cfg_style`, `cfg_color`, `cfg_thickness` |
| `image_block` | `cfg_image_url`, `cfg_caption`, `cfg_alt_text`, `cfg_max_width` |
| `constant_sum` | `cfg_total` |
| `signature` | (none) |
| `address` | `cfg_show_country` |
| `slider_range` | `cfg_min_value`, `cfg_max_value`, `cfg_step`, `cfg_min_label`, `cfg_max_label` |

### 9.8 Key design rules / 关键设计规则

1. **One source of truth:** The canonical type list lives in `src/easyresearch/constants/questionTypes.ts`. Builder, Preview, Participant views, and Response handling all import from this file. / 规范类型列表在 `questionTypes.ts` 中。构建器、预览、参与者视图和响应处理都从此文件导入。
2. **Legacy type mapping:** Old type strings (e.g. `'text'`, `'scale'`, `'likert'`) are auto-mapped to current types via `LEGACY_TYPE_MAPPING` and `normalizeLegacyQuestionType()`. / 旧类型字符串通过 `LEGACY_TYPE_MAPPING` 和 `normalizeLegacyQuestionType()` 自动映射到当前类型。
3. **No JSONB config:** All config is in flat `cfg_*` columns. Hydrated to `question_config` in memory via `questionConfigSync.ts`. / 所有配置在扁平 `cfg_*` 列中。通过 `questionConfigSync.ts` 水合为内存中的 `question_config`。
4. **No JSONB options:** All options are in the `question_option` table. Never store options in JSONB. / 所有选项在 `question_option` 表中。永远不要在 JSONB 中存储选项。
5. **Type-safe responses:** Each question type writes to exactly one `answer_*` column. This enables type-safe SQL queries and aggregation. / 每种问题类型只写入一个 `answer_*` 列。这使得类型安全的 SQL 查询和聚合成为可能。
6. **Layout types are display-only:** `section_header`, `text_block`, `divider`, `image_block`, and `instruction` never create response rows. They are filtered out during response saving. / 布局类型仅用于显示，永远不会创建响应行。
7. **Section grouping:** The `groupQuestionsBySections()` utility splits a flat question list into sections based on `section_header` boundaries. This powers the tabbed questionnaire UI. / `groupQuestionsBySections()` 根据 `section_header` 边界将扁平问题列表分成章节。这为标签页式问卷 UI 提供支持。
8. **Voice and AI:** Text input types support `allow_voice` (speech-to-text) and `allow_ai_assist` (chatbot help). These are per-question toggles on the `question` table. / 文本输入类型支持语音输入和 AI 辅助。这些是 `question` 表上的每个问题开关。


## 5. LOGIC / 逻辑规则

The logic system supports **12 categories** of conditional logic, all stored in ONE flat relational table: `research_logic`. No JSONB. No per-question columns. One table rules them all.

逻辑系统支持 **12 大类** 条件逻辑，全部存储在一张扁平关系表 `research_logic` 中。没有JSONB。没有每个问题的列。一张表统治一切。

### 5.1 The 12 Logic Categories / 12大逻辑类别

1. **Basic skip/show/hide** — Jump to questions, show/hide based on answers, disqualify, end survey / 基础跳转/显示/隐藏——基于答案跳转、显示/隐藏问题、取消资格、结束调查
2. **Compound conditions (AND/OR)** — Multiple conditions grouped with AND or OR operators / 复合条件——多个条件通过 AND 或 OR 运算符组合
3. **Required-before-next validation** — Block navigation until a question is answered / 必填验证——阻止导航直到问题被回答
4. **Answer piping** — Insert previous answers into question text dynamically / 答案回填——将之前的答案动态插入问题文本
5. **Calculated fields** — Auto-compute values from other answers (BMI, scores, etc.) / 计算字段——从其他答案自动计算值（BMI、分数等）
6. **Advanced validation** — Regex, date ranges, text length, list matching / 高级验证——正则表达式、日期范围、文本长度、列表匹配
7. **Cross-questionnaire logic** — One questionnaire's answers control another's visibility / 跨问卷逻辑——一个问卷的答案控制另一个问卷的可见性
8. **Random question pool** — Show N random questions from a larger set / 随机题库——从更大的题库中随机显示N题
9. **A/B variants** — Show different question variants to different participants / A/B变体——向不同参与者显示不同的问题变体
10. **Quota control** — Stop collecting once a quota is reached (e.g. 100 males) / 配额控制——达到配额后停止收集（如100名男性）
11. **Loop/repeat blocks** — Repeat a question block N times or once per multi-select answer / 循环重复块——重复一组问题N次或按多选答案重复
12. **URL parameter conditions** — Branch logic based on URL query parameters / URL参数条件——基于URL查询参数的分支逻辑

### 5.2 `research_logic` table columns / 表字段

**Core fields / 核心字段:**

- `id` (uuid PK)
- `project_id` (uuid FK → research_project) — always set, for easy bulk load / 始终设置，便于批量加载
- `questionnaire_id` (uuid FK → questionnaire, **nullable**) — scopes the rule to one questionnaire; null for cross-questionnaire rules / 将规则限定到一个问卷；跨问卷规则时为null
- `source_question_id` (uuid FK → question) — IF this question... / 如果这个问题...
- `condition` (text) — comparison operator (see 5.3) / 比较运算符（见5.3）
- `value` (text) — ...has this value / ...有这个值
- `action` (text) — THEN do this (see 5.4) / 那么执行此操作（见5.4）
- `target_question_id` (uuid FK → question, nullable) — target question for skip/show/hide/calculate/pipe_answer / 目标问题，用于跳转/显示/隐藏/计算/回填
- `order_index` (int) — evaluation order within the questionnaire / 问卷内的评估顺序
- `enabled` (bool, default true) — soft toggle without deleting / 软开关，无需删除
- `created_at` (timestamptz)

**Compound condition fields / 复合条件字段:**

- `condition_group` (text, nullable) — group ID to combine multiple rules with AND/OR; rules with the same group ID are evaluated together / 条件组ID，用于将多个规则以AND/OR组合；相同组ID的规则一起评估
- `group_operator` (text, default 'and') — 'and' or 'or'; how rules within the same group are combined / 组内规则的组合方式：'and'（且）或 'or'（或）

**Advanced action fields / 高级动作字段:**

- `calculation_formula` (text, nullable) — math formula with `{{question_id}}` placeholders, e.g. `{{weight}} / (({{height}} / 100) * ({{height}} / 100))` / 计算公式，使用 `{{question_id}}` 占位符
- `piping_template` (text, nullable) — text template with `{{question_id}}` placeholders, e.g. `您之前说您的孩子叫{{q3}}，{{q3}}今年几岁？` / 回填模板，使用 `{{question_id}}` 占位符
- `validation_regex` (text, nullable) — regex pattern for format validation, e.g. `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$` for email / 格式验证的正则表达式
- `error_message` (text, nullable) — custom error message for require/validate actions / 自定义错误提示

**Cross-questionnaire fields / 跨问卷字段:**

- `cross_questionnaire` (bool, default false) — whether this rule references another questionnaire / 是否引用其他问卷
- `target_questionnaire_id` (uuid FK → questionnaire, nullable) — the questionnaire to show/hide / 要显示/隐藏的目标问卷

**Randomization fields / 随机化字段:**

- `randomize_count` (int, nullable) — number of random questions to show from the pool / 从题库中随机显示的题数

**A/B Variant fields / A/B变体字段:**

- `variant_group` (text, nullable) — group name for A/B variants; rules sharing the same group show only one variant per participant / 变体组名；同组规则每个参与者只显示一个变体

**Quota fields / 配额字段:**

- `quota_limit` (int, nullable) — maximum count for this quota bucket / 此配额桶的最大数量
- `quota_field` (text, nullable) — field=value defining the quota bucket, e.g. `gender=male` / 定义配额桶的字段=值

**Loop fields / 循环字段:**

- `loop_source_question_id` (uuid FK, nullable) — multi-select question whose answers determine loop iterations / 多选问题，其答案决定循环次数
- `loop_count` (int, nullable) — fixed number of loop iterations (used when loop_source_question_id is null) / 固定循环次数

**URL parameter fields / URL参数字段:**

- `url_param_key` (text, nullable) — URL query parameter key for url_param conditions / URL查询参数键

**Metadata / 元数据:**

- `description` (text, nullable) — optional human-readable note about the rule / 可选的规则说明

### 5.3 Supported conditions (19 types) / 支持的条件（19种）

**Basic / 基础:**
- `equals` — exact match (case insensitive) / 精确匹配（不区分大小写）
- `not_equals` — not equal / 不等于
- `contains` — substring match / 子字符串匹配
- `greater_than` — numeric > / 数字大于
- `less_than` — numeric < / 数字小于
- `is_empty` — null or empty string / 空值或空字符串
- `is_not_empty` — has a value / 有值

**Multiple choice / 多选:**
- `any_selected` — value is in the selected array / 值在选中数组中
- `none_selected` — value is NOT in the selected array / 值不在选中数组中

**Date / 日期:**
- `date_before` — response date is before the rule value (supports "today") / 响应日期在规则值之前（支持"today"）
- `date_after` — response date is after the rule value (supports "today") / 响应日期在规则值之后（支持"today"）
- `date_between` — response date is within a range (value: "2020-01-01,2025-12-31") / 响应日期在范围内（值："2020-01-01,2025-12-31"）

**Text / 文本:**
- `matches_regex` — response matches a regex pattern / 响应匹配正则表达式
- `length_greater` — response text length > value / 响应文本长度大于值
- `length_less` — response text length < value / 响应文本长度小于值

**List / 列表:**
- `in_list` — response value is in a comma-separated list / 响应值在逗号分隔的列表中
- `not_in_list` — response value is NOT in a comma-separated list / 响应值不在逗号分隔的列表中

**URL Parameters / URL参数:**
- `url_param_equals` — URL query parameter equals value (format: `key=expected`) / URL查询参数等于值
- `url_param_contains` — URL query parameter contains value (format: `key=substring`) / URL查询参数包含值

### 5.4 Supported actions (15 types) / 支持的动作（15种）

**Basic flow / 基础流程:**
- `skip` — jump to `target_question_id`, skipping everything in between / 跳转到目标问题
- `show` — show `target_question_id` only if condition matches (hidden by default) / 条件匹配时显示
- `hide` — hide `target_question_id` if condition matches / 条件匹配时隐藏
- `disqualify` — end survey, mark participant as disqualified; `target_question_id` is null / 取消资格
- `end_survey` — end survey early with completion status; `target_question_id` is null / 提前结束调查

**Validation / 验证:**
- `require_before_next` — block "Next" button until the source question is answered; shows `error_message` / 阻止"下一步"直到源问题被回答；显示 `error_message`
- `validate_format` — validate source question's answer against `validation_regex`; shows `error_message` on failure / 用 `validation_regex` 验证源问题的答案；失败时显示 `error_message`

**Computed / 计算:**
- `calculate` — evaluate `calculation_formula` and store result in `target_question_id` / 计算 `calculation_formula` 并存储结果到目标问题
- `pipe_answer` — replace `{{question_id}}` placeholders in `piping_template` and display in `target_question_id` / 替换 `piping_template` 中的占位符并显示在目标问题

**Cross-questionnaire / 跨问卷:**
- `show_questionnaire` — show `target_questionnaire_id` when condition matches / 条件匹配时显示目标问卷
- `hide_questionnaire` — hide `target_questionnaire_id` when condition matches / 条件匹配时隐藏目标问卷

**Randomization / 随机化:**
- `randomize_questions` — randomly select `randomize_count` questions from the questionnaire; deterministic per-participant / 从问卷中随机选择 `randomize_count` 题；每个参与者确定性的

**A/B Testing / A/B测试:**
- `show_variant` — show one question variant from a `variant_group`; other variants are hidden; deterministic per-participant / 从 `variant_group` 中显示一个问题变体；其他变体隐藏

**Quota / 配额:**
- `quota_check` — when condition matches and `quota_limit` is reached, set `quotaReached = true` (used to disqualify or end survey) / 条件匹配且达到 `quota_limit` 时设置配额已满

**Loop / 循环:**
- `loop_block` — repeat a question block `loop_count` times, or once per answer in `loop_source_question_id` / 重复一组问题 `loop_count` 次，或按 `loop_source_question_id` 的每个答案重复

### 5.5 Compound conditions (AND/OR) / 复合条件

Multiple rules can be grouped using the same `condition_group` value. Rules in the same group are combined with `group_operator`:

多个规则可以通过相同的 `condition_group` 值分组。同组规则用 `group_operator` 组合：

- **AND group**: ALL conditions must match for the action to trigger / 所有条件都必须满足才触发动作
- **OR group**: ANY condition matching triggers the action / 任一条件满足就触发动作

Example: "IF age > 65 AND gender = female THEN disqualify" / 示例："如果年龄 > 65 且 性别 = 女性 则取消资格"
- Rule 1: source=age_question, condition=greater_than, value=65, condition_group="g1", group_operator="and", action=disqualify
- Rule 2: source=gender_question, condition=equals, value=female, condition_group="g1", group_operator="and", action=disqualify

Rules **without** a `condition_group` are evaluated individually (single-condition rules). / 没有 `condition_group` 的规则单独评估（单条件规则）。

### 5.6 Key design rules / 关键设计规则

1. Most rules are **per-questionnaire**. Cross-questionnaire rules set `cross_questionnaire = true` and `questionnaire_id = null`. / 大多数规则是按问卷的。跨问卷规则设置 `cross_questionnaire = true` 且 `questionnaire_id = null`。
2. For intra-questionnaire rules, `source_question_id` and `target_question_id` must both belong to the same `questionnaire_id`. / 问卷内规则中，`source_question_id` 和 `target_question_id` 必须属于同一个 `questionnaire_id`。
3. Multiple rules for the same source question are evaluated in `order_index` order. First matching `skip` wins. All matching `show`/`hide` are applied. First matching `disqualify`/`end_survey` wins. / 同一源问题的多条规则按 `order_index` 顺序评估。
4. `enabled = false` rules are ignored during evaluation but preserved in the builder. / `enabled = false` 的规则在评估时被忽略，但在构建器中保留。
5. All new fields are **nullable/optional** — existing rules continue to work unchanged. / 所有新字段都是**可空/可选的**——现有规则继续正常工作。

### 5.7 Evaluation engine / 评估引擎

A shared `evaluateLogic()` function in `src/easyresearch/utils/logicEngine.ts` is used by ALL survey views (ParticipantSurveyView, OneTimeSurveyView). It returns:

共享的 `evaluateLogic()` 函数在 `src/easyresearch/utils/logicEngine.ts` 中，被所有调查视图使用。它返回：

- `visibleQuestionIds` — which questions to display / 要显示的问题
- `skipTarget` — which question to jump to / 要跳转到的问题
- `disqualified` — whether participant is disqualified / 参与者是否被取消资格
- `endSurvey` — whether to end early / 是否提前结束
- `calculatedValues` — computed values from calculate rules / 计算规则产生的计算值
- `pipedTexts` — piped text from pipe_answer rules / 回填规则产生的文本
- `validationErrors` — validation failures from validate_format rules / 格式验证失败信息
- `requiredErrors` — required-before-next failures / 必填验证失败信息
- `hiddenQuestionnaireIds` — questionnaires hidden by cross-questionnaire rules / 被跨问卷规则隐藏的问卷
- `shownQuestionnaireIds` — questionnaires shown by cross-questionnaire rules / 被跨问卷规则显示的问卷
- `randomizedQuestionIds` — per-questionnaire randomized question subsets / 每个问卷的随机问题子集
- `activeVariants` — per-group selected A/B variant question ID / 每组选中的A/B变体问题ID
- `quotaReached` — whether any quota_check rule has triggered / 是否有配额规则已触发
- `loopIterations` — per-question loop repeat count / 每个问题的循环重复次数

Additional convenience helpers / 额外的便捷辅助函数:
- `checkRequiredBeforeNext()` — check required-before-next rules / 检查必填验证规则
- `checkValidation()` — check validate_format rules / 检查格式验证规则
- `getCalculatedValues()` — get calculated values / 获取计算值
- `getPipedText()` — get piped text for a question / 获取问题的回填文本
- `getCrossQuestionnaireVisibility()` — get cross-questionnaire visibility / 获取跨问卷可见性
- `checkQuotaReached()` — check if quota is full, blocks survey on submit / 检查配额是否已满，提交时阻止调查
- `expandLoopQuestions()` — expand questions with loop iterations (synthetic IDs) / 用循环迭代展开问题（合成ID）

### 5.8 Builder UI / 构建器UI

The Logic tab in SurveyBuilder shows rules scoped to the currently selected questionnaire. Each rule card shows: source question, condition, value, action, target, **condition group** (with AND/OR selector), and advanced fields (formula, piping template, regex, error message, description).

SurveyBuilder中的Logic标签显示当前选中问卷的规则。每个规则卡片显示：源问题、条件、值、动作、目标、**条件组**（带AND/OR选择器）和高级字段（公式、回填模板、正则、错误提示、说明）。

The inline QuestionLogicEditor under each question in QuestionnaireList also supports all 19 conditions and 15 actions. Both are views of the same `research_logic` data. Each new action type includes bilingual help text explaining how it works.

QuestionnaireList中每个问题下的内联QuestionLogicEditor也支持全部19种条件和15种动作。两者都是同一 `research_logic` 数据的视图。每种新动作类型都有双语帮助文字解释其工作原理。

### 5.9 What was removed / 删除了什么

- Old `logic_rule` table (project-scoped, no questionnaire_id) — DROPPED / 旧的 `logic_rule` 表——已删除
- `question.logic_rules` JSONB column — DROPPED / `question.logic_rules` JSONB列——已删除
- `questionnaire.disqualify_logic` JSONB column — DROPPED / `questionnaire.disqualify_logic` JSONB列——已删除
- `cfg_disqualify_value` is kept as a convenience config but the real enforcement is via `research_logic` rules with `action = 'disqualify'` / `cfg_disqualify_value` 作为便利配置保留，但真正的执行是通过 `research_logic` 中 `action = 'disqualify'` 的规则

---

## 5b. TEMPLATES / 模板

A template is NOT a separate table or a JSONB blob. A template is a row in the SAME table as real data with `is_template = true`. Never create a separate template table. Never dump template data into JSONB.

模板不是单独的表或 JSONB blob。模板是与真实数据在同一表中的一行，带有 `is_template = true`。永远不要创建单独的模板表。永远不要将模板数据转储到 JSONB 中。

- **Project template / 项目模板** = a `research_project` row with `is_template = true` / 带有 `is_template = true` 的 `research_project` 行
- **Questionnaire template / 问卷模板** = a `questionnaire` row with `is_template = true` / 带有 `is_template = true` 的 `questionnaire` 行
- **Question template / 问题模板** = a `question` row with `is_template = true` / 带有 `is_template = true` 的 `question` 行

Template columns added to all three tables: `is_template` (bool), `template_is_public_or_private` (bool — true = public, false = private), `template_category` (text), `source_template_id` (uuid FK to self). One boolean column, no separate is_private.

添加到所有三个表的模板列：`is_template` (bool)、`template_is_public_or_private` (bool — true = 公开，false = 私有)、`template_category` (text)、`source_template_id` (uuid FK to self)。一个布尔列，没有单独的 is_private。

"Use template" = deep-clone the template row + its children into new rows with `is_template = false`. "Save as template" = deep-clone the real row + its children into new rows with `is_template = true`.

"使用模板" = 深度克隆模板行及其子项到带有 `is_template = false` 的新行。"保存为模板" = 深度克隆真实行及其子项到带有 `is_template = true` 的新行。

`template_is_public_or_private = true` → visible to all users. `template_is_public_or_private = false` → only visible to creator. Templates are NEVER hardcoded in frontend code — they always live in the database.

`template_is_public_or_private = true` → 对所有用户可见。`template_is_public_or_private = false` → 仅对创建者可见。模板永远不会在前端代码中硬编码——它们总是存在于数据库中。

## 6. USER PROFILE / 用户资料

User role is defined in profile table

用户角色在 profile 表中定义

## 7. USER ROLE / 用户角色

user role is defined in profile table's is_researcher toggle is_participant toggle, a users can be both, this should not overide if a user can sumbit or can join a research, a user can be both researcher and a participant (join another researcher's research), the actual dashboard display logic is defined by user setting what he wants to get displayed

用户角色在 profile 表的 is_researcher 开关 is_participant 开关中定义，用户可以同时是两者，这不应该覆盖用户是否可以提交或加入研究，用户可以同时是研究员和参与者（加入其他研究员的研究），实际的仪表板显示逻辑由用户设置他想要显示的内容来定义


---

## 10. PARTICIPANT TYPES / 参与者类型

Each participant type is a row in the `participant_type` table. It belongs to one project via `project_id` and defines a category of participant (e.g., "Primary Caregiver", "Family Member").

调研参与者类型储存在participant_type table。每个研究可以设置多个参与者类型，比如家人、护理者、病人，每个问卷、问题也可以单独设置对哪些参与者可见

参与者类型在研究项目(第一层级)进行设置，每个属于研究的问卷(第二层级)和问题(第三层级)均可以设置对哪些在研究项目中建立的参与者类型可见

每个参与者通过 `project_id` 关联到研究项目research_project

**Flat columns on `participant_type` / `participant_type` 上的扁平列:**
- `id` (uuid PK)
- `project_id` (uuid FK → research_project)
- `name` (text) — e.g. "Primary Caregiver" / 如"主要护理者"
- `description` (text)
- `color` (text) — hex color for UI display / UI显示的十六进制颜色
- `order_index` (int) — display order / 显示顺序
- `numbering_enabled` (bool) — whether participants of this type get auto-numbered / 此类型的参与者是否获得自动编号
- `number_prefix` (text) — prefix for auto-numbering, e.g. "CG" → CG001, CG002... / 自动编号前缀，如"CG" → CG001, CG002...
- `relations` (text[]) — relationship options participants can choose from / 参与者可以选择的关系选项

**Auto-numbering per participant type:** When a participant enrolls, the system counts existing enrollments of the same `participant_type_id` for that project and generates the next sequential number using the type's prefix. E.g., if 3 caregivers already enrolled with prefix "CG", the next gets "CG004". The number is stored in `enrollment.participant_number`.

**按参与者类型自动编号：** 当参与者注册时，系统计算该项目中相同 `participant_type_id` 的现有注册，并使用类型前缀生成下一个顺序号。例如，如果已有3个护理者以"CG"前缀注册，下一个获得"CG004"。编号存储在 `enrollment.participant_number` 中。

### 3-Level Participant Type Filtering / 三级参与者类型过滤

**Level 1 - Project:** Participant types are defined at the project level in `participant_type` table. / 第一层级 - 项目：参与者类型在项目级别的 `participant_type` 表中定义。

**Level 2 - Questionnaire:** Questionnaires are linked to participant types via the `questionnaire_participant_type` junction table (questionnaire_id, participant_type_id). A questionnaire can be assigned to multiple types. Only participants of the assigned types see those questionnaires. If no types assigned, all participants see it. / 第二层级 - 问卷：问卷通过 `questionnaire_participant_type` 连接表链接到参与者类型。一个问卷可以分配给多个类型。只有分配类型的参与者才能看到这些问卷。如果未分配类型，所有参与者都能看到。

**Level 3 - Question:** Questions are linked to participant types via the `question_participant_type` junction table (question_id, participant_type_id). A question can be assigned to multiple types. Only participants of the assigned types see those questions. If no types assigned, all participants see it. / 第三层级 - 问题：问题通过 `question_participant_type` 连接表链接到参与者类型。一个问题可以分配给多个类型。只有分配类型的参与者才能看到这些问题。如果未分配类型，所有参与者都能看到。

**Enrollment stores participant type:** Each enrollment has `participant_type_id` (uuid FK → participant_type). This determines which questionnaires and questions the participant sees. / 注册存储参与者类型：每个注册都有 `participant_type_id`。这决定了参与者看到哪些问卷和问题。

**Filtering logic:** Survey views (`ParticipantSurveyView`, `OneTimeSurveyView`) use `filterQuestionsByParticipantType()` and `filterQuestionnairesByParticipantType()` utilities to filter content based on `enrollment.participant_type_id`. / 过滤逻辑：调查视图使用过滤工具函数根据 `enrollment.participant_type_id` 过滤内容。

**UI:** Question editor in `QuestionnaireList.tsx` shows participant type checkboxes for each question. Questionnaire settings show participant type checkboxes for each questionnaire. / UI：问题编辑器显示每个问题的参与者类型复选框。问卷设置显示每个问卷的参与者类型复选框。



## 11. Layout and design / 布局和设计

There are only two layouts for this project, 1) desktop layout, for all desktop screen sizes, whether small or large; and we are using only one header, one footer, one siderbar for the entire desktop layout, the header and footer should be displayed on all public pages, and the sidebar should be displayed on all dashboard pages, 2) mobile layout, for all mobile and tablet screen sizes; and we are using only one mobile header, one mobile footer for all mobile pages, and they should persist on all pages, whether it's a research project or not

此项目只有两种布局，1）桌面布局，适用于所有桌面屏幕尺寸，无论大小；我们为整个桌面布局只使用一个标题、一个页脚、一个侧边栏，标题和页脚应在所有公共页面上显示，侧边栏应在所有仪表板页面上显示，2）移动布局，适用于所有移动和平板屏幕尺寸；我们为所有移动页面只使用一个移动标题、一个移动页脚，它们应在所有页面上持续存在，无论是否是研究项目

desktop/mobile homepage: homepage only serves as a static homepage, log in will direct to /dashboard and log out back to homepage

桌面/移动主页：主页仅作为静态主页，登录将定向到 /dashboard，注销返回主页

desktop footer: basic company info, not navigation footer, and make sure the footer is using the exact same size of icon, app name as the header, and position alighed with the header's icon, app name

桌面页脚：基本公司信息，不是导航页脚，确保页脚使用与标题完全相同大小的图标、应用名称，并与标题的图标、应用名称位置对齐

desktop footer should also always be displayed on all publish pages (not fixed, just shown at bottom) on all screen sizes, including even mobile screen

桌面页脚也应始终在所有发布页面上显示（不固定，只在底部显示），在所有屏幕尺寸上，甚至包括移动屏幕

desktop sidebar: 4 sidebars: research, discover, inbox and setting. the same logic and function as mobile footer.

桌面侧边栏：4个侧边栏：研究、发现、收件箱和设置。与移动页脚相同的逻辑和功能。

desktop header: left: Site logo, name; join studies (just for participants finding existing researches, and inform they may get paid, also display the money for each research), participants, features, templetes right: language switcher profile button (dropdown to handle auth, and a button to go to dashboard, no other bullshit)

桌面标题：左侧：网站标志、名称；加入研究（仅供参与者查找现有研究，并告知他们可能获得报酬，还显示每个研究的金钱），参与者、功能、模板 右侧：语言切换器配置文件按钮（下拉菜单处理认证，以及转到仪表板的按钮，没有其他废话）

mobile header: left: Site logo, name; participants, right: language switcher profile button (dropdown to handle auth, no other bullshit)

移动标题：左侧：网站标志、名称；参与者，右侧：语言切换器配置文件按钮（下拉菜单处理认证，没有其他废话）

mobile footer: 4 tabs: research, discover, inbox and setting. 1)research is the unified research project hub for researchers and participants to find or manage their researches, with edit button to dynamic display tabs for researchers or participants; 2) discover is for discovering research projects to join; 3) inbox is the unified inbox page to show both notifications and direct-message between and researcher and participant; 4) setting is the setting page for basic profile information and notification

移动页脚：4个标签：研究、发现、收件箱和设置。1）研究是研究员和参与者查找或管理其研究的统一研究项目中心，带有编辑按钮以动态显示研究员或参与者的标签；2）发现用于发现要加入的研究项目；3）收件箱是统一收件箱页面，显示研究员和参与者之间的通知和直接消息；4）设置是基本配置文件信息和通知的设置页面

remember: mobile footer should never be shown on public pages, to be precise, it should only show on /dashboard routes, and make sure the app either shows sidebar (on large screens), or mobile footer (on tablet/phone) on dashboard routes, it's one or the other, never neither or both, and make sure they only show on dashboard routes. and remember, the desktop header has join studies, templetes, participants, don't confuse them with the dashabord version of the same page or feature, these desktop versions are for public view, for visitors, they are not dashboard routes, they are just standard public routes, don't display mobile footer

记住：移动页脚永远不应在公共页面上显示，准确地说，它应该只在 /dashboard 路由上显示，并确保应用在仪表板路由上要么显示侧边栏（在大屏幕上），要么显示移动页脚（在平板/手机上），是其中之一，永远不是两者都不显示或都显示，并确保它们只在仪表板路由上显示。记住，桌面标题有加入研究、模板、参与者，不要将它们与同一页面或功能的仪表板版本混淆，这些桌面版本是供公众查看的，供访客使用，它们不是仪表板路由，它们只是标准公共路由，不显示移动页脚

## 12. Notification / 通知

每个研究项目可以设置所需要的推送，推送关联于研究项目(第一层级)和问卷(第二层级)，每个问卷(第二层级)可以设置多项推送，每项推送均可以设置独立的时间、频率、内容以及是否允许免打扰；研究项目(第一层级)也可以设置多项不与问卷关联的推送。每个研究项目和问卷均可以设置推送应用于哪一类参与者

用户的推送设置和研究项目的推送设置并不关联，用户在自己的设置页面设置：1）开启/关闭推送 2）多个免打扰时段。用户的推送设置决定研究项目的推送是否送达，设置页面显示请遵守你所参与研究的推送时间，下拉显示用户所参与的研究的推送时间，但研究的推送时间(包括是否允许免打扰) 只作为建议，不具有约束力，用户设置的开启/关闭和免打扰时间决定推送是否送达

### Data Model / 数据模型

All notification configs are stored in the unified `notification_config` table in `care_connector` schema. / 所有通知配置存储在 `care_connector` schema 的统一 `notification_config` 表中。

**`notification_config` table columns / 表字段:**
- `id` (uuid, PK)
- `project_id` (uuid, FK → research_project) — required / 必填
- `questionnaire_id` (uuid, FK → questionnaire, nullable) — null = project-level notification / null = 项目级通知
- `enabled` (bool) — researcher toggle / 研究员开关
- `title` (text) — notification title / 通知标题
- `body` (text) — notification body / 通知正文
- `notification_type` (text) — 'push', 'email', 'sms', 'push_email'
- `frequency` (text) — 'once', 'hourly', '2hours', '4hours', 'daily', 'twice_daily', 'weekly'
- `minutes_before` (int) — advance warning / 提前提醒分钟数
- `dnd_allowed` (bool) — whether participants can set DND for this notification / 是否允许参与者为此通知设置免打扰
- `order_index` (int) — display order / 显示顺序

**Multiple notifications per entity:** Each questionnaire and each project can have **multiple** notification configs. / 每个问卷和每个项目可以有**多个**通知配置。

**`notification_config_participant_type` junction table:** Links notification configs to specific participant types. / 将通知配置链接到特定的参与者类型。

**Time windows:** Still stored in `questionnaire_time_window` table (questionnaire_id, start_time, end_time, order_index). In-memory `[{start, end}]`. / 仍然存储在 `questionnaire_time_window` 表中。

### DND (Do Not Disturb) / 免打扰

**DND is per-questionnaire per-enrollment.** **FLATTENED** to `enrollment_dnd_period` table (enrollment_id, questionnaire_id, start_time, end_time, order_index). In-memory still `{ [questionnaire_id]: { dnd_periods: [{start, end}] } }`. If `dnd_allowed` is false on all notification configs for a questionnaire, participants cannot set DND for it.

**DND是按问卷按注册的。** **扁平化**到 `enrollment_dnd_period` 表。如果问卷所有通知配置的 `dnd_allowed` 都为false，参与者无法为其设置DND。

### Master Kill Switch / 主开关

`profiles.push_notifications_enabled` (bool). If false, no notifications fire regardless of notification_config settings. This is the participant's global opt-out.

`profiles.push_notifications_enabled` (bool)。如果为false，无论通知配置如何，都不会触发通知。这是参与者的全局退出。

### Delivery / 交付

`notificationScheduler.ts` runs client-side. On load, it queries all active enrollments → loads `notification_config` rows for enrolled projects (both project-level and questionnaire-level) → builds per-config notification schedule. Every 60 seconds it checks each config: is it enabled? is it within the time window? past the frequency cooldown? in DND? If all pass, fires a browser notification using the config's title/body. Time windows from `questionnaire_time_window`. Participant DND from `enrollment_dnd_period`.

`notificationScheduler.ts` 在客户端运行。加载时查询所有活动注册 → 从 `notification_config` 加载所有项目级和问卷级通知配置 → 构建按配置的通知计划。每60秒检查每个配置：是否启用？是否在时间窗口内？是否过了频率冷却？是否在DND中？如果全部通过，使用配置的标题/正文触发浏览器通知。

### Sync Utilities / 同步工具

- `notificationConfigSync.ts` — load/save `notification_config` rows, supports batch loading and per-questionnaire saving / 加载/保存通知配置行，支持批量加载和按问卷保存
- `loadNotificationConfigs(projectId)` — loads all configs for a project / 加载项目所有配置
- `saveNotificationConfigs(projectId, configs)` — saves all configs for a project / 保存项目所有配置
- `saveNotificationConfigsForQuestionnaire(projectId, questionnaireId, configs)` — saves configs for one questionnaire / 保存一个问卷的配置

### UI / 用户界面

- **Researcher:** `QuestionnaireList.tsx` — per-questionnaire notification cards with add/edit/delete/toggle; project-level notification section at top / 问卷级通知卡片和项目级通知部分
- **Participant:** `ParticipantNotificationSettings.tsx` — shows project-level notifications (read-only) and per-questionnaire DND controls / 显示项目级通知（只读）和按问卷DND控制

**Participant joins multiple researches:** Each enrollment is independent. Each project's notification configs have their own schedule and DND. The participant can set DND per-questionnaire from `ParticipantNotificationSettings`.

**参与者加入多个研究：** 每个注册都是独立的。每个项目的通知配置有自己的计划和DND。参与者可以从 `ParticipantNotificationSettings` 按问卷设置DND。

---

## 13. SURVEY BUILDER AND LAYOUT / 调查构建器和布局

The survey builder (`SurveyBuilder.tsx`) is the main researcher tool for creating and editing research projects. It has tabs: settings, questionnaires, components, logic, layout, preview, participants, responses.

调查构建器（`SurveyBuilder.tsx`）是研究员创建和编辑研究项目的主要工具。它有标签：设置、问卷、组件、逻辑、布局、预览、参与者、响应。

**How questions are saved:** The `syncQuestions` function in `SurveyBuilder.tsx` takes all questions from all questionnaires and upserts them into the `question` table. Each question gets a `questionnaire_id` FK linking it to its questionnaire. Question options go to `question_option` table. Deleted questions and stale options are cleaned up in the same sync.

**问题如何保存：** `SurveyBuilder.tsx` 中的 `syncQuestions` 函数从所有问卷中获取所有问题并将它们更新插入到 `question` 表中。每个问题获得一个 `questionnaire_id` FK 将其链接到其问卷。问题选项进入 `question_option` 表。删除的问题和过时的选项在同一同步中清理。

**Question config — ALL FLAT COLUMNS, ZERO JSONB.** The per-question type-specific config (e.g. `max_length` for text, `min_value`/`max_value` for sliders, `yes_label`/`no_label` for yes/no) is stored as flat `cfg_*` columns on the `question` table. There are 38 config keys, each mapped to a `cfg_` prefixed column. On save, `questionConfigToDbCols()` spreads the config object into flat columns. On load, `hydrateQuestionRows()` reconstructs the `question_config` object from flat columns. Both in `src/easyresearch/utils/questionConfigSync.ts`. Components keep using `question.question_config.xxx` — the hydration is transparent.

**问题配置——全部扁平列，零JSONB。** 每个问题类型特定的配置（如文本的 `max_length`，滑块的 `min_value`/`max_value`，是否的 `yes_label`/`no_label`）存储为 `question` 表上的扁平 `cfg_*` 列。有38个配置键，每个都映射到一个 `cfg_` 前缀列。保存时，`questionConfigToDbCols()` 将配置对象展开为扁平列。加载时，`hydrateQuestionRows()` 从扁平列重构 `question_config` 对象。两者都在 `src/easyresearch/utils/questionConfigSync.ts` 中。组件继续使用 `question.question_config.xxx` —— 水合是透明的。

**All cfg_* columns on `question` table / `question` 表上的所有 cfg_* 列:**
- `cfg_max_length` (int) — text max length / 文本最大长度
- `cfg_allow_other`, `cfg_allow_none`, `cfg_allow_multiple` (bool) — choice options / 选择选项
- `cfg_columns`, `cfg_custom_labels` (text) — matrix columns / likert labels (JSON string) / 矩阵列/李克特标签（JSON字符串）
- `cfg_min_value`, `cfg_max_value`, `cfg_min`, `cfg_max`, `cfg_step` (numeric) — scale range / 量表范围
- `cfg_min_label`, `cfg_max_label` (text) — scale endpoint labels / 量表端点标签
- `cfg_show_value_labels` (bool), `cfg_scale_type` (text) — scale display / 量表显示
- `cfg_yes_label`, `cfg_no_label` (text) — yes/no labels / 是/否标签
- `cfg_max_files` (int), `cfg_max_size_mb` (int), `cfg_accepted_types` (text) — file upload / 文件上传
- `cfg_image_url`, `cfg_alt_text`, `cfg_max_width`, `cfg_caption` (text) — image block / 图像块
- `cfg_section_color`, `cfg_section_icon` (text) — section header / 部分标题
- `cfg_content`, `cfg_content_type`, `cfg_font_size` (text) — text block / 文本块
- `cfg_color`, `cfg_thickness`, `cfg_style` (text) — divider/style / 分隔符/样式
- `cfg_disqualify_value` (text) — screening disqualification / 筛选取消资格
- `cfg_response_required` (text) — 'optional', 'required', etc.
- `cfg_questionnaire_id` (uuid) — questionnaire reference / 问卷引用
- `cfg_options` (text) — inline options (JSON string, rare) / 内联选项（JSON字符串，罕见）
- `cfg_allow_ai_assist`, `cfg_allow_ai_auto_answer`, `cfg_allow_voice` (bool) — AI/voice

**Question order:** Each question has an `order_index` (integer) that determines its position within the questionnaire. The builder lets researchers drag-and-drop to reorder, which updates `order_index` values.

**问题顺序：** 每个问题都有一个 `order_index`（整数），确定其在问卷中的位置。构建器让研究员拖放重新排序，这会更新 `order_index` 值。

**Display modes (flat columns on `questionnaire` table) / 显示模式（`questionnaire` 表上的扁平列）:**
- `display_mode` (text) — `'all_at_once'`, `'one_per_page'`, or `'section_per_page'`
- `questions_per_page` (int) — how many questions per page when in paged mode / 分页模式下每页多少问题

**Tab/section assignment:** Each questionnaire can have `tab_sections` stored in questionnaire config. Questions are grouped into sections by `section_name`. Layout question types (`section_header`, `divider`, `text_block`, `image_block`) create visual separators but don't collect data.

**标签/部分分配：** 每个问卷可以在问卷配置中存储 `tab_sections`。问题按 `section_name` 分组到部分。布局问题类型（`section_header`、`divider`、`text_block`、`image_block`）创建视觉分隔符但不收集数据。

**App layout — ALL FLAT TABLES, ZERO JSONB.** The participant-facing mobile app layout is stored across flat relational tables. No JSONB blobs anywhere.

**应用布局——全部扁平表，零JSONB。** 面向参与者的移动应用布局存储在扁平关系表中。任何地方都没有JSONB blob。

**`app_tab` table** — one row per tab in the participant app:

**`app_tab` 表** —— 参与者应用中每个标签一行：

- `id` (uuid PK)
- `project_id` (uuid FK → research_project)
- `label` (text) — tab display name, e.g. 'Home', 'Timeline' / 标签显示名称，如 'Home'、'Timeline'
- `icon` (text) — icon key, e.g. 'Home', 'FileText', 'Settings' / 图标键，如 'Home'、'FileText'、'Settings'
- `order_index` (int) — tab order / 标签顺序

**`app_tab_element` table** — one row per element within a tab:

**`app_tab_element` 表** —— 标签内每个元素一行：

- `id` (uuid PK)
- `tab_id` (uuid FK → app_tab)
- `project_id` (uuid FK → research_project)
- `type` (text) — element type: 'questionnaire', 'consent', 'screening', 'profile', 'ecogram', 'text_block', 'progress', 'timeline', 'help', 'custom', 'spacer', 'divider', 'image', 'button', 'todo_list' / 元素类型
- `order_index` (int) — element order within tab / 标签内元素顺序
- `questionnaire_id` (uuid FK, nullable) — which questionnaire this element shows (single) / 此元素显示哪个问卷（单个）
- `questionnaire_ids` (text[], nullable) — which questionnaires this element shows (multiple, used by timeline) / 此元素显示哪些问卷（多个，用于时间线）
- `title` (text) — element title / 元素标题
- `content` (text) — text content for text_block/custom elements / text_block/自定义元素的文本内容
- `visible` (bool) — whether element is visible / 元素是否可见
- `participant_types` (text[]) — which participant types can see this element / 哪些参与者类型可以看到此元素
- `width` (text) — '25%', '33%', '50%', '75%', '100%'
- `style_padding`, `style_background`, `style_border_radius`, `style_height` (text) — style overrides / 样式覆盖
- `button_action`, `button_label` (text) — button config / 按钮配置
- `image_url` (text) — image URL / 图像URL
- `show_question_count`, `show_estimated_time` (bool) — questionnaire display options / 问卷显示选项
- `consent_text`, `screening_criteria` (text) — consent/screening element text / 同意/筛选元素文本
- `progress_style` (text) — 'bar', 'ring', 'steps'
- `timeline_start_hour`, `timeline_end_hour` (int) — timeline display range (controls visible hour range ONLY, does NOT affect questionnaire schedules) / 时间线显示范围（仅控制可见小时范围，不影响问卷时间表）
- `timeline_days` (int) — how many days the timeline displays / 时间线显示多少天
- `todo_layout` (text) — 'horizontal' or 'vertical'
- `todo_auto_scroll` (bool) — auto-scroll todo list / 自动滚动待办事项列表

### Element Type Descriptions / 元素类型说明

- **`questionnaire`** — Renders a card linking to a specific questionnaire. Shows title, question count, estimated time. / 渲染链接到特定问卷的卡片。显示标题、问题数、预计时间。
- **`consent`** — Consent form element. / 知情同意书元素。
- **`screening`** — Screening questionnaire element. / 筛选问卷元素。
- **`profile`** — Profile questionnaire element. / 个人资料问卷元素。
- **`ecogram`** — Ecogram visualization element. / 生态图可视化元素。
- **`text_block`** — Static text content block. / 静态文本内容块。
- **`progress`** — Progress indicator (bar, ring, or steps). / 进度指示器（条形、圆环或步骤）。
- **`timeline`** — Displays selected questionnaires on a time axis. Links to MULTIPLE questionnaires via `questionnaire_ids`. The timeline inherits each questionnaire's scheduled answer times (from `frequency` and `questionnaire_time_window`) and shows whether each slot has been answered (submitted). `timeline_start_hour`/`timeline_end_hour`/`timeline_days` ONLY control the visible display range — they do NOT change when questionnaires are due. Config panel allows selecting multiple questionnaires belonging to this project. / 在时间轴上显示所选问卷。通过 `questionnaire_ids` 链接到多个问卷。时间线继承每个问卷的计划回答时间（来自 `frequency` 和 `questionnaire_time_window`），并显示每个时段是否已回答（已提交）。`timeline_start_hour`/`timeline_end_hour`/`timeline_days` 仅控制可见显示范围——不改变问卷的截止时间。配置面板允许选择属于此项目的多个问卷。
- **`help`** — Help/FAQ section with expandable sections stored in `app_element_help_section`. / 帮助/FAQ部分，展开式章节存储在 `app_element_help_section` 中。
- **`custom`** — Custom content element. / 自定义内容元素。
- **`spacer`** — Empty space for layout padding. / 用于布局填充的空白空间。
- **`divider`** — Visual separator line. / 视觉分隔线。
- **`image`** — Image display element. / 图像显示元素。
- **`button`** — Action button with configurable label and action. / 带有可配置标签和动作的按钮。
- **`todo_list`** — Task checklist with cards stored in `app_element_todo_card`. Supports manual and auto-complete (questionnaire_complete) triggers. / 任务清单，卡片存储在 `app_element_todo_card` 中。支持手动和自动完成触发器。

**`app_element_todo_card` table** — child of `app_tab_element` for todo_list elements:

**`app_element_todo_card` 表** —— `app_tab_element` 的子表，用于 todo_list 元素：

- `id` (uuid PK)
- `element_id` (uuid FK → app_tab_element)
- `type` (text) — 'questionnaire' or 'custom'
- `questionnaire_id` (uuid FK, nullable) — which questionnaire this card represents / 此卡片代表哪个问卷
- `title`, `description` (text)
- `completion_trigger` (text) — 'manual', 'time', 'questionnaire_complete'
- `order_index` (int)

**`app_element_help_section` table** — child of `app_tab_element` for help elements:

**`app_element_help_section` 表** —— `app_tab_element` 的子表，用于帮助元素：

- `id` (uuid PK)
- `element_id` (uuid FK → app_tab_element)
- `title`, `content` (text)
- `order_index` (int)

**`app_element_tab_section` table** — child of `app_tab_element` for questionnaire tab sections:

**`app_element_tab_section` 表** —— `app_tab_element` 的子表，用于问卷标签部分：

- `id` (uuid PK)
- `element_id` (uuid FK → app_tab_element)
- `label` (text)
- `question_ids` (text[]) — ordered list of question IDs in this section / 此部分中问题ID的有序列表
- `order_index` (int)

**Layout theme/header** stored as flat columns on `research_project`: `layout_show_header`, `layout_header_title`, `layout_theme_primary_color`, `layout_theme_background_color`, `layout_theme_card_style`.

**布局主题/标题** 存储为 `research_project` 上的扁平列：`layout_show_header`、`layout_header_title`、`layout_theme_primary_color`、`layout_theme_background_color`、`layout_theme_card_style`。

**Bottom nav** is derived from `app_tab` rows (each tab = one nav item). No separate storage needed.

**底部导航** 从 `app_tab` 行派生（每个标签 = 一个导航项）。不需要单独存储。

Auto-saved to flat tables with 1.5s debounce via `saveLayoutToDb()`. Loaded via `loadLayoutFromDb()`. Both in `src/easyresearch/utils/layoutSync.ts`.

通过 `saveLayoutToDb()` 以1.5秒防抖自动保存到扁平表。通过 `loadLayoutFromDb()` 加载。两者都在 `src/easyresearch/utils/layoutSync.ts` 中。

**EVERYTHING is flat columns or relational tables.** Questions, options, questionnaires, participant types, enrollments, layout tabs, layout elements — all stored in proper tables with flat columns.

**一切都是扁平列或关系表。** 问题、选项、问卷、参与者类型、注册、布局标签、布局元素——全部存储在带有扁平列的适当表中。

---
