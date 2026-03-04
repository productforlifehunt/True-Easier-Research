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

Notification：

推送由具体的问卷决定，不是在research_project层面设置

帮助文件由研究者通过questionaire创建，不要储存在research_project

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

每个问卷是 `care_connector` schema 中 `questionnaire` table

- **survey** — A regular questionnaire with questions, schedule, frequency (once, daily, hourly, etc.), active time window, estimated duration, notification toggle, and Do Not Disturb settings. / 常规问卷，包含问题、时间表、频率（一次、每日、每小时等）、活动时间窗口、预计持续时间、通知开关和免打扰设置。
- **consent** — A consent form with consent text and consent URL fields. The participant must agree before proceeding. / 同意书，包含同意文本和同意URL字段。参与者必须同意才能继续。
- **screening** — A screening questionnaire containing questions that determine participant eligibility. Questions can have a disqualify value in their config that auto-rejects participants. / 筛选问卷，包含确定参与者资格的问题。问题可以在其配置中有一个取消资格值，自动拒绝参与者。

REMEMBER NOT to use a seperate consent of screening table,they are also defined as questionnaire in this project

记住不要使用单独的同意或筛选表，它们在此项目中也定义为问卷

Questionnaires are linked to participant types through the `questionnaire_participant_type` junction table — a many-to-many relationship. A questionnaire can be assigned to multiple participant types, and a participant type can have multiple questionnaires.

问卷通过 `questionnaire_participant_type` 连接表链接到参与者类型——多对多关系。一个问卷可以分配给多个参与者类型，一个参与者类型可以有多个问卷。

## 9. QUESTIONS / 问题

Each question is a row in the `question` table (renamed from the old `survey_question` — NEVER use `survey_question` anymore). A question belongs to one project via `project_id` and optionally to one questionnaire via `questionnaire_id`.

每个问题是 `question` 表中的一行（从旧的 `survey_question` 重命名——永远不要再使用 `survey_question`）。一个问题通过 `project_id` 属于一个项目，可选地通过 `questionnaire_id` 属于一个问卷。

:**
- `id` (uuid PK)
- `project_id` (uuid FK → research_project)
- `questionnaire_id` (uuid FK → questionnaire) — links the question to a specific questionnaire / 将问题链接到特定问卷
- `question_type` (text) — the type string, e.g. `'single_choice'`, `'likert_scale'`, `'matrix'`, `'slider'`. The canonical list lives in `src/easyresearch/constants/questionTypes.ts` / 类型字符串，如 `'single_choice'`、`'likert_scale'`、`'matrix'`、`'slider'`。规范列表在 `src/easyresearch/constants/questionTypes.ts` 中
- `question_text` (text) — the actual question prompt shown to participants / 向参与者显示的实际问题提示
- `question_description` (text) — optional help text or description / 可选的帮助文本或描述
- `order_index` (int) — position within the questionnaire / 在问卷中的位置
- `required` (bool) — whether the participant must answer / 参与者是否必须回答
- `section_name` (text) — groups questions into sections for display / 将问题分组到部分以供显示
- `allow_voice` (bool) — voice input allowed / 允许语音输入
- `allow_ai_assist` (bool) — AI assistant allowed / 允许AI助手
- `allow_other` (bool) — adds an "Other" free-text option (for choice types) / 添加"其他"自由文本选项（用于选择类型）
- `allow_none` (bool) — adds a "None of the above" option (for choice types) / 添加"以上都不是"选项（用于选择类型）

**Flat config columns on `question` / `question` 上的扁平配置列:**
- `cfg_*` (38 columns) — type-specific settings stored as flat columns. For a slider: `cfg_min_value`, `cfg_max_value`, `cfg_step`. For text: `cfg_max_length`. For matrix: `cfg_columns` (JSON string). Each question type has its own config shape defined in `QUESTION_TYPE_DEFINITIONS`. Hydrated to in-memory `question_config` object via `questionConfigSync.ts`. / 类型特定设置存储为扁平列。对于滑块：`cfg_min_value`、`cfg_max_value`、`cfg_step`。对于文本：`cfg_max_length`。对于矩阵：`cfg_columns`（JSON字符串）。每个问题类型在 `QUESTION_TYPE_DEFINITIONS` 中定义自己的配置形状。通过 `questionConfigSync.ts` 水合到内存中的 `question_config` 对象。
- `vr_*` (8 columns) — validation rules: `vr_min_length`, `vr_max_length`, `vr_min_value`, `vr_max_value`, `vr_min`, `vr_max`, `vr_allow_future_dates`, `vr_allow_past_dates`. Hydrated to in-memory `validation_rule` object. / 验证规则：`vr_min_length`、`vr_max_length`、`vr_min_value`、`vr_max_value`、`vr_min`、`vr_max`、`vr_allow_future_dates`、`vr_allow_past_dates`。水合到内存中的 `validation_rule` 对象。
- `logic_rules` — DROPPED. All logic is now in the `research_logic` table (see section 5). / 已删除。所有逻辑现在在 `research_logic` 表中（见第5节）。
- `ai_config` — AI-related settings (reserved, not yet implemented) / AI相关设置（保留，尚未实现）
- `scoring_config` — scoring/weighting for analytics / 分析的评分/权重
- `piping_config` — answer piping into later questions / 答案传递到后续问题

**Question options** are stored in the `question_option` table (one row per option), NOT in JSONB:

**问题选项** 存储在 `question_option` 表中（每个选项一行），不在 JSONB 中：

- `id` (uuid PK)
- `question_id` (uuid FK → question)
- `option_text` (text) — display text / 显示文本
- `option_value` (text) — programmatic value / 程序值
- `order_index` (int) — position / 位置
- `is_other` (bool) — whether this is the "Other" free-text option / 这是否是"其他"自由文本选项

**Responses** are stored in `survey_response` with typed columns:

**响应** 存储在 `survey_response` 中，带有类型化列：

- `answer_text` (text) — for text, email, phone, date, time, single_choice, yes_no / 用于文本、电子邮件、电话、日期、时间、单选、是否
- `answer_number` (numeric) — for number, slider, rating, likert_scale, NPS / 用于数字、滑块、评级、李克特量表、NPS
- `answer_array` (text[]) — for multiple_choice, checkbox_group, ranking / 用于多选、复选框组、排名
- `answer_json` (JSONB) — for matrix and complex types only / 仅用于矩阵和复杂类型

**Questions can be shown per participant type.** Each questionnaire is linked to participant types via the `questionnaire_participant_type` junction table. When a questionnaire is assigned to specific participant types, only participants of those types see the questionnaire and its questions. This is a many-to-many relationship — one questionnaire can serve multiple participant types, and one participant type can have multiple questionnaires.

**问题可以按参与者类型显示。** 每个问卷通过 `questionnaire_participant_type` 连接表链接到参与者类型。当问卷分配给特定参与者类型时，只有这些类型的参与者才能看到问卷及其问题。这是多对多关系——一个问卷可以服务多个参与者类型，一个参与者类型可以有多个问卷。

**Supported question types** (defined in `questionTypes.ts`):

**支持的问题类型**（在 `questionTypes.ts` 中定义）：

- Text: `text_short`, `text_long`
- Choice: `single_choice`, `multiple_choice`, `dropdown`, `checkbox_group`
- Scale: `slider`, `bipolar_scale`, `rating`, `likert_scale`, `nps`
- Data: `number`, `date`, `time`, `email`, `phone`
- Advanced: `matrix`, `ranking`, `file_upload`, `image_choice`, `yes_no`, `instruction`
- Layout: `section_header`, `text_block`, `divider`, `image_block` (these don't collect responses / 这些不收集响应)


## 5. LOGIC / 逻辑规则

All conditional logic (skip, show, hide, disqualify, end survey) lives in ONE table: `research_logic`. No JSONB. No per-question `logic_rules` column. No per-questionnaire `disqualify_logic` column. One flat relational table rules them all.

所有条件逻辑（跳过、显示、隐藏、取消资格、结束调查）都存储在一个表中：`research_logic`。没有JSONB。没有每个问题的 `logic_rules` 列。没有每个问卷的 `disqualify_logic` 列。一个扁平关系表统治一切。

**`research_logic` table — one row per logic rule / 每条逻辑规则一行:**

- `id` (uuid PK)
- `project_id` (uuid FK → research_project) — always set, for easy bulk load / 始终设置，便于批量加载
- `questionnaire_id` (uuid FK → questionnaire) — scopes the rule to one questionnaire / 将规则范围限定到一个问卷
- `source_question_id` (uuid FK → question) — IF this question... / 如果这个问题...
- `condition` (text) — comparison operator / 比较运算符
- `value` (text) — ...has this value / ...有这个值
- `action` (text) — THEN do this / 那么执行此操作
- `target_question_id` (uuid FK → question, nullable) — ...to this question (null for disqualify/end_survey) / ...对这个问题（取消资格/结束调查时为null）
- `order_index` (int) — evaluation order within the questionnaire / 问卷内的评估顺序
- `enabled` (bool, default true) — soft toggle without deleting / 软开关，无需删除
- `created_at` (timestamptz)

**Supported conditions / 支持的条件:**

- `equals` — exact match (case insensitive) / 精确匹配（不区分大小写）
- `not_equals` — not equal / 不等于
- `contains` — substring match / 子字符串匹配
- `greater_than` — numeric > / 数字大于
- `less_than` — numeric < / 数字小于
- `is_empty` — null or empty string / 空值或空字符串
- `is_not_empty` — has a value / 有值
- `any_selected` — for multiple choice: value is in the selected array / 多选：值在选中数组中
- `none_selected` — for multiple choice: value is NOT in the selected array / 多选：值不在选中数组中

**Supported actions / 支持的操作:**

- `skip` — jump to `target_question_id`, skipping everything in between / 跳转到目标问题，跳过中间所有内容
- `show` — show `target_question_id` only if condition matches (hidden by default) / 仅当条件匹配时显示目标问题（默认隐藏）
- `hide` — hide `target_question_id` if condition matches / 条件匹配时隐藏目标问题
- `disqualify` — end the survey and mark participant as disqualified (screening questionnaires) / 结束调查并将参与者标记为不合格（筛选问卷）。`target_question_id` is null.
- `end_survey` — end the survey early with a completion status / 提前结束调查并标记完成状态。`target_question_id` is null.

**Key design rules / 关键设计规则:**

1. Rules are **per-questionnaire**, not per-project. A rule in Questionnaire A cannot reference questions in Questionnaire B. / 规则是**按问卷**的，不是按项目的。问卷A中的规则不能引用问卷B中的问题。
2. `source_question_id` and `target_question_id` must both belong to the same `questionnaire_id`. The frontend enforces this. / `source_question_id` 和 `target_question_id` 必须属于同一个 `questionnaire_id`。前端强制执行。
3. Multiple rules can exist for the same source question. They are evaluated in `order_index` order. First matching `skip` wins. All matching `show`/`hide` are applied. First matching `disqualify`/`end_survey` wins. / 同一源问题可以有多条规则。按 `order_index` 顺序评估。第一个匹配的 `skip` 生效。所有匹配的 `show`/`hide` 都应用。第一个匹配的 `disqualify`/`end_survey` 生效。
4. `enabled = false` rules are ignored during evaluation but preserved in the builder. / `enabled = false` 的规则在评估时被忽略，但在构建器中保留。
5. Old `cfg_disqualify_value` on question config is replaced by a `disqualify` action rule. / 旧的问题配置中的 `cfg_disqualify_value` 被 `disqualify` 操作规则替代。

**Evaluation engine / 评估引擎:**

A shared `evaluateLogic()` function in `src/easyresearch/utils/logicEngine.ts` is used by ALL survey views (ParticipantSurveyView, OneTimeSurveyView, LongitudinalSurveyView). It takes the questionnaire's logic rules and the current responses, and returns: `{ visibleQuestionIds, skipTarget, disqualified, endSurvey }`.

共享的 `evaluateLogic()` 函数在 `src/easyresearch/utils/logicEngine.ts` 中，被所有调查视图使用（ParticipantSurveyView、OneTimeSurveyView、LongitudinalSurveyView）。它接收问卷的逻辑规则和当前响应，返回：`{ visibleQuestionIds, skipTarget, disqualified, endSurvey }`。

**Builder UI / 构建器UI:**

The Logic tab in SurveyBuilder shows rules scoped to the currently selected questionnaire. The inline QuestionLogicEditor under each question in QuestionnaireList also creates rules in the same `research_logic` table. Both are just different views of the same data.

SurveyBuilder中的Logic标签显示当前选中问卷范围内的规则。QuestionnaireList中每个问题下的内联QuestionLogicEditor也在同一个 `research_logic` 表中创建规则。两者只是同一数据的不同视图。

**What was removed / 删除了什么:**

- Old `logic_rule` table (project-scoped, no questionnaire_id) — DROPPED / 旧的 `logic_rule` 表（项目范围，无questionnaire_id）——已删除
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

每个参与者类型是 `participant_type` 表中的一行。它通过 `project_id` 属于一个项目，并定义参与者类别（如"主要护理者"、"家庭成员"）。

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

**Questionnaires and questions are displayed per participant type.** Questionnaires are linked to participant types via the `questionnaire_participant_type` junction table. A questionnaire can be assigned to multiple types, and a type can have multiple questionnaires. Only participants of the assigned types see those questionnaires.

**问卷和问题按参与者类型显示。** 问卷通过 `questionnaire_participant_type` 连接表链接到参与者类型。一个问卷可以分配给多个类型，一个类型可以有多个问卷。只有分配类型的参与者才能看到这些问卷。

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

Notification is set at **questionnaire level**, not project level. Each questionnaire has its own notification config:

通知设置在**问卷级别**，不是项目级别。每个问卷都有自己的通知配置：

- `notification_enabled` (bool) — researcher toggles per questionnaire / 研究员按问卷切换
- `notification_title`, `notification_body` (text) — custom content / 自定义内容
- `notification_type` (text) — 'push', 'email', 'sms', 'push_email'
- `notification_minutes_before` (int) — advance warning / 提前警告
- `frequency` (text) — 'hourly', '2hours', '4hours', 'daily', 'twice_daily', 'weekly', 'once'
- `time_windows` — **FLATTENED** to `questionnaire_time_window` table (questionnaire_id, start_time, end_time, order_index). In-memory still `[{start, end}]`. / **扁平化**到 `questionnaire_time_window` 表（questionnaire_id, start_time, end_time, order_index）。内存中仍然是 `[{start, end}]`。
- `dnd_allowed` (bool) — whether researcher allows participants to set DND for this questionnaire / 研究员是否允许参与者为此问卷设置DND

**DND is per-questionnaire per-enrollment.** **FLATTENED** to `enrollment_dnd_period` table (enrollment_id, questionnaire_id, start_time, end_time, order_index). In-memory still `{ [questionnaire_id]: { dnd_periods: [{start, end}] } }`. If `dnd_allowed` is false on the questionnaire, participants cannot set DND for it.

**DND是按问卷按注册的。** **扁平化**到 `enrollment_dnd_period` 表（enrollment_id, questionnaire_id, start_time, end_time, order_index）。内存中仍然是 `{ [questionnaire_id]: { dnd_periods: [{start, end}] } }`。如果问卷上的 `dnd_allowed` 为false，参与者无法为其设置DND。

**Master kill switch:** `profiles.push_notifications_enabled` (bool). If false, no notifications fire regardless of questionnaire config. This is the participant's global opt-out. The Settings page shows this toggle and informs the participant about the notification agreements of their enrolled research projects — but it does NOT override the master kill switch.

**主开关：** `profiles.push_notifications_enabled` (bool)。如果为false，无论问卷配置如何，都不会触发通知。这是参与者的全局退出。设置页面显示此开关并告知参与者其注册研究项目的通知协议——但它不会覆盖主开关。

**How delivery works:** `notificationScheduler.ts` runs client-side. On load, it queries all active enrollments → their questionnaires with `notification_enabled=true` → builds a per-questionnaire notification schedule. Every 60 seconds it checks each questionnaire: is it within the time window? Is it past the frequency cooldown? Is it in DND? If all pass, fires a browser notification using the questionnaire's custom title/body. Time windows are read from `questionnaire_time_window` table. Participant DND is read from `enrollment_dnd_period` table keyed by enrollment + questionnaire ID.

**交付如何工作：** `notificationScheduler.ts` 在客户端运行。加载时，它查询所有活动注册 → 其 `notification_enabled=true` 的问卷 → 构建按问卷的通知计划。每60秒检查每个问卷：是否在时间窗口内？是否过了频率冷却？是否在DND中？如果全部通过，使用问卷的自定义标题/正文触发浏览器通知。时间窗口从 `questionnaire_time_window` 表读取。参与者DND从 `enrollment_dnd_period` 表读取，按注册 + 问卷ID键控。

**Participant joins multiple researches:** Each enrollment is independent. Research A's questionnaire notifications have their own schedule and DND. Research B's are separate. The participant can set DND per-questionnaire from the notification settings modal (`ParticipantNotificationSettings`).

**参与者加入多个研究：** 每个注册都是独立的。研究A的问卷通知有自己的计划和DND。研究B的是分开的。参与者可以从通知设置模态（`ParticipantNotificationSettings`）按问卷设置DND。

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
- `questionnaire_id` (uuid FK, nullable) — which questionnaire this element shows / 此元素显示哪个问卷
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
- `timeline_start_hour`, `timeline_end_hour`, `timeline_days` (int) — timeline config / 时间线配置
- `todo_layout` (text) — 'horizontal' or 'vertical'
- `todo_auto_scroll` (bool) — auto-scroll todo list / 自动滚动待办事项列表

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
