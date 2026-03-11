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
  'common.signIn': { en: 'Sign In', zh: '登录', es: 'Iniciar sesión', fr: 'Se connecter', de: 'Anmelden', ja: 'サインイン', ko: '로그인', pt: 'Entrar', ar: 'تسجيل الدخول', hi: 'साइन इन', ru: 'Войти', it: 'Accedi' },
  'common.signOut': { en: 'Sign Out', zh: '登出', es: 'Cerrar sesión', fr: 'Se déconnecter', de: 'Abmelden', ja: 'サインアウト', ko: '로그아웃', pt: 'Sair', ar: 'تسجيل الخروج', hi: 'साइन आउट', ru: 'Выйти', it: 'Esci' },
  'common.save': { en: 'Save', zh: '保存', es: 'Guardar', fr: 'Enregistrer', de: 'Speichern', ja: '保存', ko: '저장', pt: 'Salvar', ar: 'حفظ', hi: 'सहेजें', ru: 'Сохранить', it: 'Salva' },
  'common.cancel': { en: 'Cancel', zh: '取消', es: 'Cancelar', fr: 'Annuler', de: 'Abbrechen', ja: 'キャンセル', ko: '취소', pt: 'Cancelar', ar: 'إلغاء', hi: 'रद्द करें', ru: 'Отмена', it: 'Annulla' },
  'common.edit': { en: 'Edit', zh: '编辑', es: 'Editar', fr: 'Modifier', de: 'Bearbeiten', ja: '編集', ko: '편집', pt: 'Editar', ar: 'تعديل', hi: 'संपादित करें', ru: 'Редактировать', it: 'Modifica' },
  'common.delete': { en: 'Delete', zh: '删除', es: 'Eliminar', fr: 'Supprimer', de: 'Löschen', ja: '削除', ko: '삭제', pt: 'Excluir', ar: 'حذف', hi: 'हटाएं', ru: 'Удалить', it: 'Elimina' },
  'common.confirm': { en: 'Confirm', zh: '确认', es: 'Confirmar', fr: 'Confirmer', de: 'Bestätigen', ja: '確認', ko: '확인', pt: 'Confirmar', ar: 'تأكيد', hi: 'पुष्टि करें', ru: 'Подтвердить', it: 'Conferma' },
  'common.loading': { en: 'Loading...', zh: '加载中...', es: 'Cargando...', fr: 'Chargement...', de: 'Laden...', ja: '読み込み中...', ko: '로드 중...', pt: 'Carregando...', ar: 'تحميل...', hi: 'लोड हो रहा है...', ru: 'Загрузка...', it: 'Caricamento...' },
  'common.search': { en: 'Search', zh: '搜索', es: 'Buscar', fr: 'Rechercher', de: 'Suchen', ja: '検索', ko: '검색', pt: 'Pesquisar', ar: 'بحث', hi: 'खोजें', ru: 'Поиск', it: 'Cerca' },
  'common.next': { en: 'Next', zh: '下一步', es: 'Siguiente', fr: 'Suivant', de: 'Weiter', ja: '次へ', ko: '다음', pt: 'Próximo', ar: 'التالي', hi: 'अगला', ru: 'Далее', it: 'Avanti' },
  'common.back': { en: 'Back', zh: '返回', es: 'Atrás', fr: 'Retour', de: 'Zurück', ja: '戻る', ko: '뒤로', pt: 'Voltar', ar: 'الخلف', hi: 'पिछला', ru: 'Назад', it: 'Indietro' },
  'common.done': { en: 'Done', zh: '完成', es: 'Hecho', fr: 'Terminé', de: 'Fertig', ja: '完了', ko: '완료', pt: 'Concluído', ar: 'تم', hi: 'पूर्ण', ru: 'Готово', it: 'Fatto' },
  'common.close': { en: 'Close', zh: '关闭', es: 'Cerrar', fr: 'Fermer', de: 'Schließen', ja: '閉じる', ko: '닫기', pt: 'Fechar', ar: 'إغلاق', hi: 'बंद करें', ru: 'Закрыть', it: 'Chiudi' },
  'common.open': { en: 'Open', zh: '打开', es: 'Abrir', fr: 'Ouvrir', de: 'Öffnen', ja: '開く', ko: '열기', pt: 'Abrir', ar: 'فتح', hi: 'खोलें', ru: 'Открыть', it: 'Apri' },
  'common.more': { en: 'More', zh: '更多', es: 'Más', fr: 'Plus', de: 'Mehr', ja: 'もっと見る', ko: '더보기', pt: 'Mais', ar: 'المزيد', hi: 'और', ru: 'Больше', it: 'Altro' },
  'common.less': { en: 'Less', zh: '更少', es: 'Menos', fr: 'Moins', de: 'Weniger', ja: 'もっと少なく', ko: '덜', pt: 'Menos', ar: 'أقل', hi: 'कम', ru: 'Меньше', it: 'Meno' },
  'common.yes': { en: 'Yes', zh: '是', es: 'Sí', fr: 'Oui', de: 'Ja', ja: 'はい', ko: '예', pt: 'Sim', ar: 'نعم', hi: 'हाँ', ru: 'Да', it: 'Sì' },
  'common.no': { en: 'No', zh: '否', es: 'No', fr: 'Non', de: 'Nein', ja: 'いいえ', ko: '아니요', pt: 'Não', ar: 'لا', hi: 'नहीं', ru: 'Нет', it: 'No' },
  'common.all': { en: 'All', zh: '所有', es: 'Todos', fr: 'Tous', de: 'Alle', ja: 'すべて', ko: '모두', pt: 'Todos', ar: 'الكل', hi: 'सभी', ru: 'Все', it: 'Tutti' },

  // Settings
  'settings.title': { en: 'Settings', zh: '设置', es: 'Configuración', fr: 'Paramètres', de: 'Einstellungen', ja: '設定', ko: '설정', pt: 'Configurações', ar: 'الإعدادات', hi: 'सेटिंग्स', ru: 'Настройки', it: 'Impostazioni' },
  'settings.subtitle': { en: 'Manage your account settings and preferences', zh: '管理您的帐户设置和偏好设置', es: 'Administra la configuración y preferencias de tu cuenta', fr: 'Gérez les paramètres et préférences de votre compte', de: 'Verwalten Sie Ihre Kontoeinstellungen und Präferenzen', ja: 'アカウント設定とプリファレンスを管理します', ko: '계정 설정 및 환경 설정을 관리합니다', pt: 'Gerencie as configurações e preferências da sua conta', ar: 'إدارة إعدادات حسابك وتفضيلاتك', hi: 'अपने खाते की सेटिंग्स और प्राथमिकताओं को प्रबंधित करें', ru: 'Управляйте настройками своей учетной записи', it: 'Gestisci le impostazioni e le preferenze del tuo account' },
  'settings.profile': { en: 'Profile', zh: '个人资料', es: 'Perfil', fr: 'Profil', de: 'Profil', ja: 'プロフィール', ko: '프로필', pt: 'Perfil', ar: 'الملف الشخصي', hi: 'प्रोफ़ाइल', ru: 'Профиль', it: 'Profilo' },
  'settings.fullName': { en: 'Full Name', zh: '姓名', es: 'Nombre completo', fr: 'Nom complet', de: 'Vollständiger Name', ja: '氏名', ko: '이름', pt: 'Nome completo', ar: 'الاسم الكامل', hi: 'पूरा नाम', ru: 'Полное имя', it: 'Nome completo' },
  'settings.email': { en: 'Email', zh: '电子邮件', es: 'Correo electrónico', fr: 'Adresse e-mail', de: 'E-Mail', ja: 'メールアドレス', ko: '이메일', pt: 'E-mail', ar: 'البريد الإلكتروني', hi: 'ईमेल', ru: 'Электронная почта', it: 'Email' },
  'settings.phone': { en: 'Phone', zh: '电话', es: 'Teléfono', fr: 'Téléphone', de: 'Telefon', ja: '電話', ko: '전화', pt: 'Telefone', ar: 'الهاتف', hi: 'फ़ोन', ru: 'Телефон', it: 'Telefono' },
  'settings.introduction': { en: 'Introduction', zh: '简介', es: 'Introducción', fr: 'Introduction', de: 'Einleitung', ja: '自己紹介', ko: '소개', pt: 'Introdução', ar: 'مقدمة', hi: 'परिचय', ru: 'Введение', it: 'Introduzione' },
  'settings.introPlaceholder': { en: 'Tell us a bit about yourself', zh: '简单介绍一下自己吧', es: 'Cuéntanos un poco sobre ti', fr: 'Parlez-nous un peu de vous', de: 'Erzählen Sie uns etwas über sich', ja: '自己紹介をお願いします', ko: '자신에 대해 간단히 소개해 주세요', pt: 'Conte-nos um pouco sobre você', ar: 'أخبرنا قليلاً عن نفسك', hi: 'अपने बारे में थोड़ा बताएं', ru: 'Расскажите немного о себе', it: 'Raccontaci qualcosa di te' },
  'settings.edit': { en: 'Edit', zh: '编辑', es: 'Editar', fr: 'Modifier', de: 'Bearbeiten', ja: '編集', ko: '편집', pt: 'Editar', ar: 'تعديل', hi: 'संपादित करें', ru: 'Редактировать', it: 'Modifica' },
  'settings.saving': { en: 'Saving...', zh: '保存中...', es: 'Guardando...', fr: 'Enregistrement...', de: 'Speichern...', ja: '保存中...', ko: '저장 중...', pt: 'Salvando...', ar: 'جاري الحفظ...', hi: 'सहेजा जा रहा है...', ru: 'Сохранение...', it: 'Salvataggio...' },
  'settings.profileSaved': { en: 'Profile saved!', zh: '个人资料已保存！', es: '¡Perfil guardado!', fr: 'Profil enregistré !', de: 'Profil gespeichert!', ja: 'プロフィールを保存しました！', ko: '프로필이 저장되었습니다!', pt: 'Perfil salvo!', ar: 'تم حفظ الملف الشخصي!', hi: 'प्रोफ़ाइल सहेजी गई!', ru: 'Профиль сохранен!', it: 'Profilo salvato!' },
  'settings.notifications': { en: 'Notifications', zh: '通知', es: 'Notificaciones', fr: 'Notifications', de: 'Benachrichtigungen', ja: '通知', ko: '알림', pt: 'Notificações', ar: 'الإشعارات', hi: 'सूचनाएं', ru: 'Уведомления', it: 'Notifiche' },
  'settings.webNotifications': { en: 'Web Notifications', zh: '网页通知', es: 'Notificaciones web', fr: 'Notifications web', de: 'Web-Benachrichtigungen', ja: 'ウェブ通知', ko: '웹 알림', pt: 'Notificações da web', ar: 'إشعارات الويب', hi: 'वेब सूचनाएं', ru: 'Веб-уведомления', it: 'Notifiche web' },
  'settings.webNotificationsDesc': { en: 'Receive notifications in your browser', zh: '在浏览器中接收通知', es: 'Recibe notificaciones en tu navegador', fr: 'Recevez des notifications dans votre navigateur', de: 'Erhalten Sie Benachrichtigungen in Ihrem Browser', ja: 'ブラウザで通知を受信する', ko: '브라우저에서 알림을 받습니다', pt: 'Receba notificações no seu navegador', ar: 'تلقي الإشعارات في متصفحك', hi: 'अपने ब्राउज़र में सूचनाएं प्राप्त करें', ru: 'Получайте уведомления в своем браузере', it: 'Ricevi notifiche nel tuo browser' },
  'settings.pushNotifications': { en: 'Push Notifications', zh: '推送通知', es: 'Notificaciones push', fr: 'Notifications push', de: 'Push-Benachrichtigungen', ja: 'プッシュ通知', ko: '푸시 알림', pt: 'Notificações push', ar: 'إشعارات الدفع', hi: 'पुश सूचनाएं', ru: 'Push-уведомления', it: 'Notifiche push' },
  'settings.pushNotificationsDesc': { en: 'Receive notifications on your mobile device', zh: '在移动设备上接收通知', es: 'Recibe notificaciones en tu dispositivo móvil', fr: 'Recevez des notifications sur votre appareil mobile', de: 'Erhalten Sie Benachrichtigungen auf Ihrem Mobilgerät', ja: 'モバイルデバイスで通知を受信する', ko: '모바일 장치에서 알림을 받습니다', pt: 'Receba notificações no seu dispositivo móvel', ar: 'تلقي الإشعارات على جهازك المحمول', hi: 'अपने मोबाइल डिवाइस पर सूचनाएं प्राप्त करें', ru: 'Получайте уведомления на своем мобильном устройстве', it: 'Ricevi notifiche sul tuo dispositivo mobile' },
  'settings.emailNotifications': { en: 'Email Notifications', zh: '电子邮件通知', es: 'Notificaciones por correo electrónico', fr: 'Notifications par e-mail', de: 'E-Mail-Benachrichtigungen', ja: 'メール通知', ko: '이메일 알림', pt: 'Notificações por e-mail', ar: 'إشعارات البريد الإلكتروني', hi: 'ईमेल सूचनाएं', ru: 'Уведомления по электронной почте', it: 'Notifiche email' },
  'settings.emailNotificationsDesc': { en: 'Receive notifications via email', zh: '通过电子邮件接收通知', es: 'Recibe notificaciones por correo electrónico', fr: 'Recevez des notifications par e-mail', de: 'Erhalten Sie Benachrichtigungen per E-Mail', ja: 'メールで通知を受信する', ko: '이메일을 통해 알림을 받습니다', pt: 'Receba notificações por e-mail', ar: 'تلقي الإشعارات عبر البريد الإلكتروني', hi: 'ईमेल के माध्यम से सूचनाएं प्राप्त करें', ru: 'Получайте уведомления по электронной почте', it: 'Ricevi notifiche via email' },
  'settings.security': { en: 'Security', zh: '安全', es: 'Seguridad', fr: 'Sécurité', de: 'Sicherheit', ja: 'セキュリティ', ko: '보안', pt: 'Segurança', ar: 'الأمان', hi: 'सुरक्षा', ru: 'Безопасность', it: 'Sicurezza' },
  'settings.changePassword': { en: 'Change Password', zh: '更改密码', es: 'Cambiar contraseña', fr: 'Changer le mot de passe', de: 'Passwort ändern', ja: 'パスワードを変更する', ko: '비밀번호 변경', pt: 'Alterar senha', ar: 'تغيير كلمة المرور', hi: 'पासवर्ड बदलें', ru: 'Изменить пароль', it: 'Cambia password' },
  'settings.changePasswordDesc': { en: 'Update your password to keep your account secure', zh: '更新密码以保证帐户安全', es: 'Actualiza tu contraseña para mantener tu cuenta segura', fr: 'Mettez à jour votre mot de passe pour protéger votre compte', de: 'Aktualisieren Sie Ihr Passwort, um Ihr Konto sicher zu halten', ja: 'アカウントを安全に保つためにパスワードを更新してください', ko: '계정을 안전하게 유지하려면 비밀번호를 업데이트하세요', pt: 'Atualize sua senha para manter sua conta segura', ar: 'تحديث كلمة المرور للحفاظ على أمان حسابك', hi: 'अपने खाते को सुरक्षित रखने के लिए अपना पासवर्ड अपडेट करें', ru: 'Обновите свой пароль, чтобы обеспечить безопасность своей учетной записи', it: 'Aggiorna la tua password per proteggere il tuo account' },
  'settings.signOut': { en: 'Sign Out', zh: '登出', es: 'Cerrar sesión', fr: 'Se déconnecter', de: 'Abmelden', ja: 'サインアウト', ko: '로그아웃', pt: 'Sair', ar: 'تسجيل الخروج', hi: 'साइन आउट', ru: 'Выйти', it: 'Esci' },
  'settings.pleaseSignIn': { en: 'Please Sign In', zh: '请登录', es: 'Por favor, inicia sesión', fr: 'Veuillez vous connecter', de: 'Bitte anmelden', ja: 'サインインしてください', ko: '로그인하십시오', pt: 'Por favor, entre', ar: 'يرجى تسجيل الدخول', hi: 'कृपया साइन इन करें', ru: 'Пожалуйста, войдите', it: 'Per favore, accedi' },
  'settings.signInManage': { en: 'Sign in to manage your settings', zh: '登录以管理您的设置', es: 'Inicia sesión para administrar tu configuración', fr: 'Connectez-vous pour gérer vos paramètres', de: 'Melden Sie sich an, um Ihre Einstellungen zu verwalten', ja: 'サインインして設定を管理してください', ko: '로그인하여 설정을 관리하십시오', pt: 'Entre para gerenciar suas configurações', ar: 'سجل الدخول لإدارة إعداداتك', hi: 'अपनी सेटिंग्स प्रबंधित करने के लिए साइन इन करें', ru: 'Войдите, чтобы управлять своими настройками', it: 'Accedi per gestire le tue impostazioni' },
  'settings.countryRegion': { en: 'Country / Region', zh: '国家/地区', es: 'País / Región', fr: 'Pays / Région', de: 'Land / Region', ja: '国/地域', ko: '국가/지역', pt: 'País / Região', ar: 'الدولة / المنطقة', hi: 'देश/प्रदेश', ru: 'Страна / Регион', it: 'Paese / Regione' },
  'settings.age': { en: 'Age', zh: '年龄', es: 'Edad', fr: 'Âge', de: 'Alter', ja: '年齢', ko: '나이', pt: 'Idade', ar: 'العمر', hi: 'आयु', ru: 'Возраст', it: 'Età' },
  'settings.gender': { en: 'Gender', zh: '性别', es: 'Género', fr: 'Genre', de: 'Geschlecht', ja: '性別', ko: '성별', pt: 'Gênero', ar: 'الجنس', hi: 'लिंग', ru: 'Пол', it: 'Genere' },
  'settings.occupation': { en: 'Occupation', zh: '职业', es: 'Ocupación', fr: 'Profession', de: 'Beruf', ja: '職業', ko: '직업', pt: 'Ocupação', ar: 'الوظيفة', hi: 'व्यवसाय', ru: 'Профессия', it: 'Occupazione' },

  // Participant Library
  'participantLibrary.title': { en: 'Participant Library', zh: '参与者库', es: 'Biblioteca de participantes', fr: 'Bibliothèque de participants', de: 'Teilnehmerbibliothek', ja: '参加者ライブラリ', ko: '참가자 라이브러리', pt: 'Biblioteca de participantes', ar: 'مكتبة المشاركين', hi: 'प्रतिभागी पुस्तकालय', ru: 'Библиотека участников', it: 'Libreria dei partecipanti' },
  'settings.joinLibrary': { en: 'Join the Participant Library', zh: '加入参与者库', es: 'Unirse a la Biblioteca de Participantes', fr: 'Rejoindre la Bibliothèque de Participants', de: 'Der Teilnehmerbibliothek beitreten', ja: '参加者ライブラリに参加する', ko: '참가자 라이브러리 가입', pt: 'Junte-se à Biblioteca de Participantes', ar: 'انضم إلى مكتبة المشاركين', hi: 'प्रतिभागी पुस्तकालय में शामिल हों', ru: 'Присоединиться к библиотеке участников', it: 'Iscriviti alla Libreria dei Partecipanti' },
  'settings.joinLibraryDesc': { en: 'Make your profile visible to researchers for potential study invitations', zh: '让研究人员可以看到您的个人资料，以便邀请您参与研究', es: 'Haz que tu perfil sea visible para los investigadores para posibles invitaciones a estudios', fr: 'Rendez votre profil visible aux chercheurs pour d\'éventuelles invitations à des études', de: 'Machen Sie Ihr Profil für Forscher sichtbar, um potenziell zu Studien eingeladen zu werden', ja: '研究者があなたのプロフィールを見て、研究への招待状を送る可能性を高めます', ko: '연구자들이 귀하의 프로필을 보고 연구 초대를 보낼 수 있도록 합니다', pt: 'Torne seu perfil visível para pesquisadores para possíveis convites para estudos', ar: 'اجعل ملفك الشخصي مرئيًا للباحثين لتلقي دعوات محتملة للدراسة', hi: 'अपनी प्रोफ़ाइल को शोधकर्ताओं के लिए संभावित अध्ययन आमंत्रणों के लिए दृश्यमान बनाएं', ru: 'Сделайте свой профиль видимым для исследователей для потенциальных приглашений на исследования', it: 'Rendi il tuo profilo visibile ai ricercatori per potenziali inviti a studi' },
  'settings.editPublicProfile': { en: 'Edit Public Profile', zh: '编辑公开资料', es: 'Editar perfil público', fr: 'Modifier le profil public', de: 'Öffentliches Profil bearbeiten', ja: '公開プロフィールを編集', ko: '공개 프로필 편집', pt: 'Editar perfil público', ar: 'تعديل الملف الشخصي العام', hi: 'सार्वजनिक प्रोफ़ाइल संपादित करें', ru: 'Редактировать публичный профиль', it: 'Modifica il profilo pubblico' },
  'settings.hideDetails': { en: 'Hide Details', zh: '隐藏详细信息', es: 'Ocultar detalles', fr: 'Masquer les détails', de: 'Details ausblenden', ja: '詳細を隠す', ko: '세부 정보 숨기기', pt: 'Ocultar detalhes', ar: 'إخفاء التفاصيل', hi: 'विवरण छिपाएं', ru: 'Скрыть детали', it: 'Nascondi dettagli' },

  // Do Not Disturb
  'settings.doNotDisturb': { en: 'Do Not Disturb', zh: '请勿打扰', es: 'No molestar', fr: 'Ne pas déranger', de: 'Nicht stören', ja: 'おやすみモード', ko: '방해 금지 모드', pt: 'Não perturbe', ar: 'عدم الإزعاج', hi: 'परेशान न करें', ru: 'Не беспокоить', it: 'Non disturbare' },
  'settings.dndDesc': { en: 'Silence notifications during specific periods', zh: '在特定时间段内静音通知', es: 'Silenciar las notificaciones durante períodos específicos', fr: 'Désactiver les notifications pendant des périodes spécifiques', de: 'Benachrichtigungen während bestimmter Zeiträume stummschalten', ja: '特定の時間帯に通知をミュートにする', ko: '특정 시간 동안 알림을 음소거합니다', pt: 'Silenciar notificações durante períodos específicos', ar: 'كتم الإشعارات خلال فترات محددة', hi: 'विशिष्ट अवधियों के दौरान सूचनाओं को मौन करें', ru: 'Отключить уведомления в определенные периоды', it: 'Disattiva le notifiche durante periodi specifici' },
  'settings.all': { en: 'All', zh: '全部', es: 'Todos', fr: 'Tous', de: 'Alle', ja: 'すべて', ko: '모두', pt: 'Todos', ar: 'الكل', hi: 'सभी', ru: 'Все', it: 'Tutti' },
  'settings.to': { en: 'to', zh: '至', es: 'a', fr: 'à', de: 'bis', ja: '〜', ko: '에', pt: 'para', ar: 'إلى', hi: 'से', ru: 'до', it: 'a' },
  'settings.addQuietPeriod': { en: 'Add Quiet Period', zh: '添加静音时段', es: 'Agregar período de silencio', fr: 'Ajouter une période de silence', de: 'Ruhezeit hinzufügen', ja: '安静期間を追加', ko: '소음 없는 시간 추가', pt: 'Adicionar período de silêncio', ar: 'إضافة فترة هدوء', hi: 'शांत अवधि जोड़ें', ru: 'Добавить период тишины', it: 'Aggiungi periodo di silenzio' },

  // Toast messages
  'toast.saveFailed': { en: 'Failed to save settings', zh: '保存设置失败', es: 'Error al guardar la configuración', fr: 'Échec de la sauvegarde des paramètres', de: 'Einstellungen konnten nicht gespeichert werden', ja: '設定の保存に失敗しました', ko: '설정 저장에 실패했습니다', pt: 'Falha ao salvar as configurações', ar: 'فشل حفظ الإعدادات', hi: 'सेटिंग्स सहेजने में विफल', ru: 'Не удалось сохранить настройки', it: 'Impossibile salvare le impostazioni' },
  'toast.saveProfileFailed': { en: 'Failed to save profile', zh: '保存个人资料失败', es: 'Error al guardar el perfil', fr: 'Échec de la sauvegarde du profil', de: 'Profil konnte nicht gespeichert werden', ja: 'プロフィールの保存に失敗しました', ko: '프로필 저장에 실패했습니다', pt: 'Falha ao salvar o perfil', ar: 'فشل حفظ الملف الشخصي', hi: 'प्रोफ़ाइल सहेजने में विफल', ru: 'Не удалось сохранить профиль', it: 'Impossibile salvare il profilo' },
  'toast.sessionExpired': { en: 'Session expired, please sign in again', zh: '会话已过期，请重新登录', es: 'Sesión expirada, por favor, inicia sesión de nuevo', fr: 'Session expirée, veuillez vous reconnecter', de: 'Sitzung abgelaufen, bitte melden Sie sich erneut an', ja: 'セッションが期限切れです。もう一度サインインしてください', ko: '세션이 만료되었습니다. 다시 로그인하십시오', pt: 'Sessão expirada, por favor, entre novamente', ar: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى', hi: 'सत्र समाप्त हो गया, कृपया फिर से साइन इन करें', ru: 'Время сеанса истекло, пожалуйста, войдите снова', it: 'Sessione scaduta, per favore, accedi di nuovo' },
  'toast.researcherNotFound': { en: 'Researcher profile not found', zh: '未找到研究员档案', es: 'Perfil de investigador no encontrado', fr: 'Profil de chercheur introuvable', de: 'Forscherprofil nicht gefunden', ja: '研究者プロフィールが見つかりません', ko: '연구자 프로필을 찾을 수 없습니다', pt: 'Perfil de pesquisador não encontrado', ar: 'لم يتم العثور على ملف الباحث', hi: 'शोधकर्ता प्रोफ़ाइल नहीं मिली', ru: 'Профиль исследователя не найден', it: 'Profilo ricercatore non trovato' },

  // Button actions
  'action.duplicate': { en: 'Duplicate', zh: '复制', es: 'Duplicar', fr: 'Dupliquer', de: 'Duplizieren', ja: '複製', ko: '복제', pt: 'Duplicar', ar: 'نسخ', hi: 'डुप्लिकेट', ru: 'Дублировать', it: 'Duplica' },
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

  const dir: 'ltr' | 'rtl' = LANGUAGES.find(l => l.code === lang)?.dir || 'ltr';

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
};
