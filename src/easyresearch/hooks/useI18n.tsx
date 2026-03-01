// i18n support for Easier Research
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Language = 'en' | 'zh' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'pt' | 'ar' | 'hi' | 'ru' | 'it';

export const LANGUAGES: { code: Language; name: string; nativeName: string; dir?: 'rtl' | 'ltr' }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
];

type TranslationDict = Record<string, Record<Language, string>>;

const translations: TranslationDict = {
  // Landing page
  'landing.hero.title1': { en: 'Research made', zh: '让研究变得', es: 'Investigación', fr: 'La recherche', de: 'Forschung', ja: 'リサーチを', ko: '연구를', pt: 'Pesquisa', ar: 'البحث أصبح', hi: 'शोध को बनाएं', ru: 'Исследования', it: 'La ricerca' },
  'landing.hero.title2': { en: 'easier', zh: '更简单', es: 'más fácil', fr: 'simplifiée', de: 'leicht gemacht', ja: 'もっと簡単に', ko: '더 쉽게', pt: 'mais fácil', ar: 'أسهل', hi: 'आसान', ru: 'проще', it: 'più facile' },
  'landing.hero.subtitle': { en: 'Create surveys, collect quality data, and analyze results — all in one place.', zh: '创建问卷、收集高质量数据并分析结果——尽在一处。', es: 'Crea encuestas, recopila datos de calidad y analiza resultados, todo en un solo lugar.', fr: 'Créez des sondages, collectez des données de qualité et analysez les résultats — tout en un seul endroit.', de: 'Erstellen Sie Umfragen, sammeln Sie qualitative Daten und analysieren Sie Ergebnisse — alles an einem Ort.', ja: 'アンケートを作成し、質の高いデータを収集し、結果を分析 — すべてを一か所で。', ko: '설문조사를 만들고, 양질의 데이터를 수집하고, 결과를 분석하세요 — 모든 것을 한 곳에서.', pt: 'Crie pesquisas, colete dados de qualidade e analise resultados — tudo em um só lugar.', ar: 'أنشئ استطلاعات، واجمع بيانات عالية الجودة، وحلل النتائج — كل ذلك في مكان واحد.', hi: 'सर्वेक्षण बनाएं, गुणवत्तापूर्ण डेटा एकत्र करें, और परिणामों का विश्लेषण करें — सब एक ही जगह।', ru: 'Создавайте опросы, собирайте качественные данные и анализируйте результаты — всё в одном месте.', it: 'Crea sondaggi, raccogli dati di qualità e analizza i risultati — tutto in un unico posto.' },
  'landing.getStarted': { en: 'Get started', zh: '开始使用', es: 'Comenzar', fr: 'Commencer', de: 'Loslegen', ja: '始める', ko: '시작하기', pt: 'Começar', ar: 'ابدأ الآن', hi: 'शुरू करें', ru: 'Начать', it: 'Inizia' },
  'landing.browseTemplates': { en: 'Browse templates', zh: '浏览模板', es: 'Ver plantillas', fr: 'Voir les modèles', de: 'Vorlagen ansehen', ja: 'テンプレートを見る', ko: '템플릿 보기', pt: 'Ver modelos', ar: 'تصفح القوالب', hi: 'टेम्पलेट देखें', ru: 'Шаблоны', it: 'Sfoglia modelli' },
  'landing.freeForever': { en: 'Free forever · No credit card required', zh: '永久免费 · 无需信用卡', es: 'Gratis para siempre · Sin tarjeta de crédito', fr: 'Gratuit pour toujours · Aucune carte de crédit requise', de: 'Für immer kostenlos · Keine Kreditkarte erforderlich', ja: '永久無料・クレジットカード不要', ko: '영원히 무료 · 신용카드 불필요', pt: 'Grátis para sempre · Sem cartão de crédito', ar: 'مجاني للأبد · لا حاجة لبطاقة ائتمان', hi: 'हमेशा मुफ्त · क्रेडिट कार्ड की आवश्यकता नहीं', ru: 'Бесплатно навсегда · Кредитная карта не нужна', it: 'Gratis per sempre · Nessuna carta di credito' },
  'landing.features.title': { en: 'Everything you need', zh: '您需要的一切', es: 'Todo lo que necesitas', fr: 'Tout ce dont vous avez besoin', de: 'Alles was Sie brauchen', ja: '必要なものすべて', ko: '필요한 모든 것', pt: 'Tudo o que você precisa', ar: 'كل ما تحتاجه', hi: 'आपको जो कुछ भी चाहिए', ru: 'Всё, что вам нужно', it: 'Tutto ciò di cui hai bisogno' },
  'landing.features.subtitle': { en: 'Powerful tools, zero complexity.', zh: '强大的工具，零复杂度。', es: 'Herramientas poderosas, cero complejidad.', fr: 'Des outils puissants, zéro complexité.', de: 'Leistungsstarke Tools, null Komplexität.', ja: '強力なツール、ゼロの複雑さ。', ko: '강력한 도구, 제로 복잡성.', pt: 'Ferramentas poderosas, complexidade zero.', ar: 'أدوات قوية، صفر تعقيد.', hi: 'शक्तिशाली उपकरण, शून्य जटिलता।', ru: 'Мощные инструменты, ноль сложности.', it: 'Strumenti potenti, zero complessità.' },
  'landing.howItWorks': { en: 'Three steps', zh: '三个步骤', es: 'Tres pasos', fr: 'Trois étapes', de: 'Drei Schritte', ja: '3つのステップ', ko: '세 단계', pt: 'Três passos', ar: 'ثلاث خطوات', hi: 'तीन चरण', ru: 'Три шага', it: 'Tre passaggi' },
  'landing.useCases.title': { en: 'Built for every field', zh: '为每个领域而建', es: 'Creado para cada campo', fr: 'Conçu pour tous les domaines', de: 'Für jedes Fachgebiet', ja: 'あらゆる分野に対応', ko: '모든 분야를 위해', pt: 'Feito para todos os campos', ar: 'مصمم لكل مجال', hi: 'हर क्षेत्र के लिए बनाया गया', ru: 'Для любой области', it: 'Per ogni settore' },
  'landing.cta.title': { en: 'Ready to start?', zh: '准备开始了吗？', es: '¿Listo para comenzar?', fr: 'Prêt à commencer ?', de: 'Bereit loszulegen?', ja: '始める準備はできましたか？', ko: '시작할 준비가 되셨나요?', pt: 'Pronto para começar?', ar: 'مستعد للبدء؟', hi: 'शुरू करने के लिए तैयार?', ru: 'Готовы начать?', it: 'Pronto per iniziare?' },
  'landing.cta.subtitle': { en: 'Join researchers who trust Easier for their studies.', zh: '加入信赖 Easier 的研究人员。', es: 'Únete a investigadores que confían en Easier.', fr: 'Rejoignez les chercheurs qui font confiance à Easier.', de: 'Schließen Sie sich Forschern an, die Easier vertrauen.', ja: 'Easierを信頼する研究者に加わりましょう。', ko: 'Easier를 신뢰하는 연구자들과 함께하세요.', pt: 'Junte-se a pesquisadores que confiam no Easier.', ar: 'انضم إلى الباحثين الذين يثقون بـ Easier.', hi: 'Easier पर भरोसा करने वाले शोधकर्ताओं से जुड़ें।', ru: 'Присоединяйтесь к исследователям, которые доверяют Easier.', it: 'Unisciti ai ricercatori che si fidano di Easier.' },
  'landing.cta.button': { en: 'Create your first survey', zh: '创建您的第一个问卷', es: 'Crea tu primera encuesta', fr: 'Créez votre premier sondage', de: 'Erstellen Sie Ihre erste Umfrage', ja: '最初のアンケートを作成', ko: '첫 설문조사를 만드세요', pt: 'Crie sua primeira pesquisa', ar: 'أنشئ استطلاعك الأول', hi: 'अपना पहला सर्वेक्षण बनाएं', ru: 'Создайте свой первый опрос', it: 'Crea il tuo primo sondaggio' },

  // AI Features section
  'landing.ai.title': { en: 'AI-Powered Research', zh: 'AI驱动的研究', es: 'Investigación con IA', fr: 'Recherche alimentée par l\'IA', de: 'KI-gestützte Forschung', ja: 'AI搭載リサーチ', ko: 'AI 기반 연구', pt: 'Pesquisa com IA', ar: 'بحث مدعوم بالذكاء الاصطناعي', hi: 'AI-संचालित अनुसंधान', ru: 'Исследования с ИИ', it: 'Ricerca potenziata dall\'IA' },
  'landing.ai.subtitle': { en: 'Let AI handle the heavy lifting so you can focus on insights.', zh: '让AI处理繁重工作，让您专注于洞察。', es: 'Deja que la IA haga el trabajo pesado para que puedas enfocarte en los insights.', fr: 'Laissez l\'IA faire le gros du travail pour vous concentrer sur les insights.', de: 'Lassen Sie KI die schwere Arbeit erledigen, damit Sie sich auf Erkenntnisse konzentrieren können.', ja: 'AIに面倒な作業を任せて、インサイトに集中しましょう。', ko: 'AI가 무거운 작업을 처리하여 인사이트에 집중하세요.', pt: 'Deixe a IA fazer o trabalho pesado para que você possa focar nos insights.', ar: 'دع الذكاء الاصطناعي يتولى الأعمال الشاقة حتى تتمكن من التركيز على الرؤى.', hi: 'AI को भारी काम करने दें ताकि आप अंतर्दृष्टि पर ध्यान दे सकें।', ru: 'Пусть ИИ выполняет тяжёлую работу, а вы сосредоточитесь на аналитике.', it: 'Lascia che l\'IA faccia il lavoro pesante per concentrarti sugli insight.' },

  // Common
  'common.back': { en: 'Back', zh: '返回', es: 'Atrás', fr: 'Retour', de: 'Zurück', ja: '戻る', ko: '뒤로', pt: 'Voltar', ar: 'رجوع', hi: 'वापस', ru: 'Назад', it: 'Indietro' },
  'common.next': { en: 'Next', zh: '下一步', es: 'Siguiente', fr: 'Suivant', de: 'Weiter', ja: '次へ', ko: '다음', pt: 'Próximo', ar: 'التالي', hi: 'अगला', ru: 'Далее', it: 'Avanti' },
  'common.submit': { en: 'Submit', zh: '提交', es: 'Enviar', fr: 'Soumettre', de: 'Absenden', ja: '送信', ko: '제출', pt: 'Enviar', ar: 'إرسال', hi: 'जमा करें', ru: 'Отправить', it: 'Invia' },
  'common.cancel': { en: 'Cancel', zh: '取消', es: 'Cancelar', fr: 'Annuler', de: 'Abbrechen', ja: 'キャンセル', ko: '취소', pt: 'Cancelar', ar: 'إلغاء', hi: 'रद्द करें', ru: 'Отмена', it: 'Annulla' },
  'common.save': { en: 'Save', zh: '保存', es: 'Guardar', fr: 'Enregistrer', de: 'Speichern', ja: '保存', ko: '저장', pt: 'Salvar', ar: 'حفظ', hi: 'सहेजें', ru: 'Сохранить', it: 'Salva' },
  'common.loading': { en: 'Loading...', zh: '加载中...', es: 'Cargando...', fr: 'Chargement...', de: 'Laden...', ja: '読み込み中...', ko: '로딩 중...', pt: 'Carregando...', ar: 'جاري التحميل...', hi: 'लोड हो रहा है...', ru: 'Загрузка...', it: 'Caricamento...' },

  // Dashboard
  'dashboard.myStudies': { en: 'My Studies', zh: '我的研究', es: 'Mis Estudios', fr: 'Mes Études', de: 'Meine Studien', ja: 'マイスタディ', ko: '내 연구', pt: 'Meus Estudos', ar: 'دراساتي', hi: 'मेरे अध्ययन', ru: 'Мои исследования', it: 'I miei studi' },
  'dashboard.newProject': { en: 'New Project', zh: '新项目', es: 'Nuevo Proyecto', fr: 'Nouveau Projet', de: 'Neues Projekt', ja: '新規プロジェクト', ko: '새 프로젝트', pt: 'Novo Projeto', ar: 'مشروع جديد', hi: 'नया प्रोजेक्ट', ru: 'Новый проект', it: 'Nuovo progetto' },
  'dashboard.aiCreate': { en: 'AI Create', zh: 'AI创建', es: 'Crear con IA', fr: 'Créer avec IA', de: 'KI erstellen', ja: 'AI作成', ko: 'AI 생성', pt: 'Criar com IA', ar: 'إنشاء بالذكاء الاصطناعي', hi: 'AI बनाएं', ru: 'ИИ создание', it: 'Crea con IA' },
  'dashboard.noProjects': { en: 'No projects yet', zh: '还没有项目', es: 'Aún no hay proyectos', fr: 'Pas encore de projets', de: 'Noch keine Projekte', ja: 'まだプロジェクトがありません', ko: '아직 프로젝트가 없습니다', pt: 'Nenhum projeto ainda', ar: 'لا توجد مشاريع بعد', hi: 'अभी कोई प्रोजेक्ट नहीं', ru: 'Пока нет проектов', it: 'Nessun progetto ancora' },

  // Nav
  'nav.home': { en: 'Home', zh: '首页', es: 'Inicio', fr: 'Accueil', de: 'Startseite', ja: 'ホーム', ko: '홈', pt: 'Início', ar: 'الرئيسية', hi: 'होम', ru: 'Главная', it: 'Home' },
  'nav.discover': { en: 'Discover', zh: '发现', es: 'Descubrir', fr: 'Découvrir', de: 'Entdecken', ja: '探す', ko: '탐색', pt: 'Descobrir', ar: 'اكتشف', hi: 'खोजें', ru: 'Обзор', it: 'Scopri' },
  'nav.settings': { en: 'Settings', zh: '设置', es: 'Configuración', fr: 'Paramètres', de: 'Einstellungen', ja: '設定', ko: '설정', pt: 'Configurações', ar: 'الإعدادات', hi: 'सेटिंग्स', ru: 'Настройки', it: 'Impostazioni' },

  // Feature names for landing page
  'feature.questionTypes': { en: '13+ Question Types', zh: '13+题型', es: '13+ Tipos de Preguntas', fr: '13+ Types de Questions', de: '13+ Fragetypen', ja: '13以上の質問タイプ', ko: '13+ 질문 유형', pt: '13+ Tipos de Perguntas', ar: '13+ نوع من الأسئلة', hi: '13+ प्रश्न प्रकार', ru: '13+ типов вопросов', it: '13+ Tipi di Domande' },
  'feature.skipLogic': { en: 'Skip Logic', zh: '跳转逻辑', es: 'Lógica de salto', fr: 'Logique de saut', de: 'Sprunglogik', ja: 'スキップロジック', ko: '건너뛰기 로직', pt: 'Lógica de pulo', ar: 'منطق التخطي', hi: 'स्किप लॉजिक', ru: 'Логика пропуска', it: 'Logica di salto' },
  'feature.webBased': { en: 'Web-Based', zh: '网页版', es: 'Basado en Web', fr: 'En ligne', de: 'Web-basiert', ja: 'ウェブベース', ko: '웹 기반', pt: 'Baseado na Web', ar: 'على الويب', hi: 'वेब-आधारित', ru: 'Веб-версия', it: 'Web-Based' },
  'feature.mobileFriendly': { en: 'Mobile-First', zh: '移动优先', es: 'Móvil Primero', fr: 'Mobile-First', de: 'Mobile-First', ja: 'モバイルファースト', ko: '모바일 우선', pt: 'Mobile-First', ar: 'الهاتف أولاً', hi: 'मोबाइल-फर्स्ट', ru: 'Мобильная версия', it: 'Mobile-First' },
  'feature.secure': { en: 'Secure', zh: '安全', es: 'Seguro', fr: 'Sécurisé', de: 'Sicher', ja: 'セキュア', ko: '보안', pt: 'Seguro', ar: 'آمن', hi: 'सुरक्षित', ru: 'Безопасно', it: 'Sicuro' },
  'feature.analytics': { en: 'Real-Time Analytics', zh: '实时分析', es: 'Análisis en Tiempo Real', fr: 'Analyses en Temps Réel', de: 'Echtzeit-Analysen', ja: 'リアルタイム分析', ko: '실시간 분석', pt: 'Análise em Tempo Real', ar: 'تحليلات فورية', hi: 'रीयल-टाइम एनालिटिक्स', ru: 'Аналитика в реальном времени', it: 'Analisi in Tempo Reale' },
  'feature.export': { en: 'Data Export', zh: '数据导出', es: 'Exportar Datos', fr: 'Export de Données', de: 'Datenexport', ja: 'データエクスポート', ko: '데이터 내보내기', pt: 'Exportar Dados', ar: 'تصدير البيانات', hi: 'डेटा निर्यात', ru: 'Экспорт данных', it: 'Esportazione Dati' },
  'feature.templates': { en: '14 Templates', zh: '14个模板', es: '14 Plantillas', fr: '14 Modèles', de: '14 Vorlagen', ja: '14テンプレート', ko: '14개 템플릿', pt: '14 Modelos', ar: '14 قالب', hi: '14 टेम्पलेट', ru: '14 шаблонов', it: '14 Modelli' },

  // AI feature names
  'ai.projectBuilder': { en: 'AI Project Builder', zh: 'AI项目构建器', es: 'Constructor de Proyectos IA', fr: 'Constructeur de Projets IA', de: 'KI-Projektersteller', ja: 'AIプロジェクトビルダー', ko: 'AI 프로젝트 빌더', pt: 'Construtor de Projetos IA', ar: 'منشئ المشاريع بالذكاء الاصطناعي', hi: 'AI प्रोजेक्ट बिल्डर', ru: 'ИИ-конструктор проектов', it: 'Costruttore Progetti IA' },
  'ai.projectBuilder.desc': { en: 'Describe your research and AI creates the entire project with questionnaires and questions.', zh: '描述您的研究，AI将自动创建包含问卷和问题的完整项目。', es: 'Describe tu investigación y la IA crea todo el proyecto con cuestionarios y preguntas.', fr: 'Décrivez votre recherche et l\'IA crée le projet entier avec questionnaires et questions.', de: 'Beschreiben Sie Ihre Forschung und KI erstellt das gesamte Projekt mit Fragebögen und Fragen.', ja: '研究を説明するだけで、AIがアンケートと質問を含むプロジェクト全体を作成します。', ko: '연구를 설명하면 AI가 설문지와 질문을 포함한 전체 프로젝트를 생성합니다.', pt: 'Descreva sua pesquisa e a IA cria o projeto inteiro com questionários e perguntas.', ar: 'صف بحثك وسيقوم الذكاء الاصطناعي بإنشاء المشروع بالكامل مع الاستبيانات والأسئلة.', hi: 'अपने शोध का वर्णन करें और AI प्रश्नावली और प्रश्नों के साथ पूरा प्रोजेक्ट बनाएगा।', ru: 'Опишите своё исследование, и ИИ создаст весь проект с анкетами и вопросами.', it: 'Descrivi la tua ricerca e l\'IA crea l\'intero progetto con questionari e domande.' },
  'ai.autoAnswer': { en: 'AI Auto-Answer', zh: 'AI自动回答', es: 'Respuesta Automática IA', fr: 'Réponse Auto IA', de: 'KI Auto-Antwort', ja: 'AI自動回答', ko: 'AI 자동 답변', pt: 'Resposta Automática IA', ar: 'إجابة تلقائية بالذكاء الاصطناعي', hi: 'AI ऑटो-उत्तर', ru: 'ИИ авто-ответ', it: 'Risposta Automatica IA' },
  'ai.autoAnswer.desc': { en: 'AI predicts likely answers for participants to review and correct, speeding up completion.', zh: 'AI预测可能的答案供参与者审查和修正，加快完成速度。', es: 'La IA predice respuestas probables para que los participantes revisen y corrijan.', fr: 'L\'IA prédit les réponses probables pour que les participants vérifient et corrigent.', de: 'KI sagt wahrscheinliche Antworten voraus, die Teilnehmer überprüfen und korrigieren können.', ja: 'AIが回答を予測し、参加者が確認・修正できるため、回答が速くなります。', ko: 'AI가 참가자가 검토하고 수정할 수 있는 답변을 예측하여 완료 속도를 높입니다.', pt: 'A IA prevê respostas prováveis para os participantes revisarem e corrigirem.', ar: 'يتنبأ الذكاء الاصطناعي بالإجابات المحتملة ليراجعها المشاركون ويصححوها.', hi: 'AI संभावित उत्तरों की भविष्यवाणी करता है ताकि प्रतिभागी समीक्षा और सुधार कर सकें।', ru: 'ИИ предсказывает вероятные ответы для проверки и коррекции участниками.', it: 'L\'IA prevede risposte probabili per i partecipanti da rivedere e correggere.' },
  'ai.chatbot': { en: 'AI Survey Chatbot', zh: 'AI问卷聊天机器人', es: 'Chatbot IA para Encuestas', fr: 'Chatbot IA pour Sondages', de: 'KI-Umfrage-Chatbot', ja: 'AIアンケートチャットボット', ko: 'AI 설문 챗봇', pt: 'Chatbot IA para Pesquisas', ar: 'روبوت محادثة ذكي للاستطلاعات', hi: 'AI सर्वेक्षण चैटबॉट', ru: 'ИИ-чатбот для опросов', it: 'Chatbot IA per Sondaggi' },
  'ai.chatbot.desc': { en: 'Participants chat naturally and AI fills in survey answers automatically from the conversation.', zh: '参与者自然聊天，AI从对话中自动填写问卷答案。', es: 'Los participantes chatean naturalmente y la IA completa las respuestas automáticamente.', fr: 'Les participants discutent naturellement et l\'IA remplit automatiquement les réponses.', de: 'Teilnehmer chatten natürlich und KI füllt Antworten automatisch aus dem Gespräch.', ja: '参加者が自然に会話し、AIが会話からアンケートの回答を自動入力します。', ko: '참가자가 자연스럽게 대화하면 AI가 대화에서 자동으로 답변을 채웁니다.', pt: 'Os participantes conversam naturalmente e a IA preenche as respostas automaticamente.', ar: 'يتحدث المشاركون بشكل طبيعي ويملأ الذكاء الاصطناعي الإجابات تلقائياً من المحادثة.', hi: 'प्रतिभागी स्वाभाविक रूप से चैट करते हैं और AI बातचीत से स्वचालित रूप से उत्तर भरता है।', ru: 'Участники общаются естественно, а ИИ автоматически заполняет ответы из разговора.', it: 'I partecipanti chattano naturalmente e l\'IA compila automaticamente le risposte.' },
  'ai.voiceInput': { en: 'Voice Input', zh: '语音输入', es: 'Entrada de Voz', fr: 'Saisie Vocale', de: 'Spracheingabe', ja: '音声入力', ko: '음성 입력', pt: 'Entrada de Voz', ar: 'إدخال صوتي', hi: 'वॉइस इनपुट', ru: 'Голосовой ввод', it: 'Input Vocale' },
  'ai.voiceInput.desc': { en: 'Speak your answers — perfect for accessibility and hands-free completion.', zh: '语音回答——非常适合无障碍访问和免提完成。', es: 'Dicta tus respuestas — perfecto para accesibilidad y uso manos libres.', fr: 'Dictez vos réponses — parfait pour l\'accessibilité et la complétion mains libres.', de: 'Sprechen Sie Ihre Antworten — perfekt für Barrierefreiheit und freihändige Eingabe.', ja: '音声で回答 — アクセシビリティとハンズフリー入力に最適。', ko: '음성으로 답변 — 접근성과 핸즈프리 완료에 완벽합니다.', pt: 'Fale suas respostas — perfeito para acessibilidade e preenchimento mãos livres.', ar: 'انطق إجاباتك — مثالي لإمكانية الوصول والإكمال بدون استخدام اليدين.', hi: 'अपने उत्तर बोलें — पहुंच और हैंड्स-फ्री पूर्णता के लिए बिल्कुल सही।', ru: 'Говорите ответы — идеально для доступности и работы без рук.', it: 'Parla le tue risposte — perfetto per l\'accessibilità e il completamento a mani libere.' },
  'ai.assist': { en: 'AI Assist & Enhance', zh: 'AI辅助与增强', es: 'Asistente IA y Mejora', fr: 'Assistance IA et Amélioration', de: 'KI-Assistenz & Verbesserung', ja: 'AIアシスト＆エンハンス', ko: 'AI 어시스트 & 향상', pt: 'Assistente IA e Melhoria', ar: 'مساعدة وتحسين بالذكاء الاصطناعي', hi: 'AI सहायता और सुधार', ru: 'ИИ-помощь и улучшение', it: 'Assistente IA e Miglioramento' },
  'ai.assist.desc': { en: 'Get contextual help understanding questions and enhance text answers with AI.', zh: '获取理解问题的上下文帮助，并使用AI增强文本答案。', es: 'Obtén ayuda contextual para entender preguntas y mejora respuestas de texto con IA.', fr: 'Obtenez de l\'aide contextuelle pour comprendre les questions et améliorez les réponses textuelles avec l\'IA.', de: 'Erhalten Sie kontextbezogene Hilfe beim Verstehen von Fragen und verbessern Sie Textantworten mit KI.', ja: '質問を理解するためのコンテキストヘルプを取得し、AIでテキスト回答を向上させます。', ko: '질문 이해를 위한 상황별 도움을 받고 AI로 텍스트 답변을 개선하세요.', pt: 'Obtenha ajuda contextual para entender perguntas e melhore respostas de texto com IA.', ar: 'احصل على مساعدة سياقية لفهم الأسئلة وتحسين الإجابات النصية بالذكاء الاصطناعي.', hi: 'प्रश्नों को समझने के लिए संदर्भित सहायता प्राप्त करें और AI के साथ पाठ उत्तरों को बेहतर बनाएं।', ru: 'Получайте контекстную помощь в понимании вопросов и улучшайте текстовые ответы с помощью ИИ.', it: 'Ottieni aiuto contestuale per capire le domande e migliora le risposte testuali con l\'IA.' },
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
  dir: 'ltr',
});

export const useI18n = () => useContext(I18nContext);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('easyresearch_lang') as Language;
    return saved && LANGUAGES.some(l => l.code === saved) ? saved : 'en';
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('easyresearch_lang', newLang);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[key]?.[lang] || translations[key]?.en || key;
  }, [lang]);

  const dir = LANGUAGES.find(l => l.code === lang)?.dir || 'ltr';

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
};
