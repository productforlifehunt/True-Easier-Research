export const translations = {
  en: {
    // App Title
    appTitle: 'A Week in the Life of Dementia Caregivers',
    
    // Bottom Navigation
    home: 'Home',
    survey: 'Survey',
    add: 'Add',
    summary: 'Summary',
    settings: 'Settings',
    
    // Homepage
    welcomeBack: 'Welcome Back',
    dailySummary: 'Daily Summary',
    recentEntries: 'Recent Entries',
    quickActions: 'Quick Actions',
    addNewEntry: 'Add New Entry',
    viewTimeline: 'View Timeline',
    viewSummary: 'View Summary',
    noEntriesYet: 'No entries yet',
    startTracking: 'Start tracking your caregiving journey',
    
    // Timeline
    timeline: 'Timeline',
    careLog: 'Care Log',
    allEntries: 'All Entries',
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
    
    // Summary
    weeklySummary: 'Weekly Summary',
    monthlySummary: 'Monthly Summary',
    careActivities: 'Care Activities',
    careNeeds: 'Care Needs',
    struggles: 'Struggles',
    totalEntries: 'Total Entries',
    
    // Settings
    profile: 'Profile',
    notifications: 'Notifications',
    language: 'Language',
    english: 'English',
    chinese: '中文',
    dailyReminders: 'Daily Reminders',
    researchUpdates: 'Research Updates',
    pushNotifications: 'Push Notifications',
    editProfile: 'Edit Profile',
    saveProfile: 'Save Profile',
    logout: 'Logout',
    fullName: 'Full Name',
    introduction: 'Introduction',
    relationship: 'Relationship to Patient',
    primaryCaregiver: 'Primary Caregiver',
    participantNumber: 'Participant Number',
    
    // Add Entry
    addEntry: 'Add Entry',
    careActivity: 'Care Activity',
    careNeed: 'Care Need',
    struggle: 'Struggle',
    selectType: 'Select Type',
    description: 'Description',
    save: 'Save',
    cancel: 'Cancel',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    entries: 'entries',
    noEntries: 'No entries',
    noEntriesForTime: 'No entries for this time',
    selectCategoryToView: 'Select a category above to view entries',
    day: 'Day',
    week: 'Week'
  },
  zh: {
    // App Title
    appTitle: '痴呆症照护者的一周生活',
    
    // Bottom Navigation
    home: '首页',
    survey: '调查',
    add: '添加',
    summary: '总结',
    settings: '设置',
    
    // Homepage
    welcomeBack: '欢迎回来',
    dailySummary: '每日总结',
    recentEntries: '最近记录',
    quickActions: '快捷操作',
    addNewEntry: '添加新记录',
    viewTimeline: '查看时间线',
    viewSummary: '查看总结',
    noEntriesYet: '暂无记录',
    startTracking: '开始记录您的照护旅程',
    
    // Timeline
    timeline: '时间线',
    careLog: '照护日志',
    allEntries: '所有记录',
    today: '今天',
    yesterday: '昨天',
    thisWeek: '本周',
    morning: '上午',
    afternoon: '下午',
    evening: '晚上',
    night: '深夜',
    
    // Summary
    weeklySummary: '每周总结',
    monthlySummary: '每月总结',
    careActivities: '照护活动',
    careNeeds: '照护需求',
    struggles: '困难挑战',
    totalEntries: '总记录数',
    
    // Settings
    profile: '个人资料',
    notifications: '通知设置',
    language: '语言',
    english: 'English',
    chinese: '中文',
    dailyReminders: '每日提醒',
    researchUpdates: '研究更新',
    pushNotifications: '推送通知',
    editProfile: '编辑资料',
    saveProfile: '保存资料',
    logout: '退出登录',
    fullName: '姓名',
    introduction: '自我介绍',
    relationship: '与患者关系',
    primaryCaregiver: '主要照护者',
    participantNumber: '参与者编号',
    
    // Add Entry
    addEntry: '添加记录',
    careActivity: '照护活动',
    careNeed: '照护需求',
    struggle: '困难挑战',
    selectType: '选择类型',
    description: '描述',
    save: '保存',
    cancel: '取消',
    
    // Common
    loading: '加载中...',
    error: '错误',
    success: '成功',
    close: '关闭',
    back: '返回',
    next: '下一步',
    submit: '提交',
    edit: '编辑',
    delete: '删除',
    confirm: '确认',
    entries: '条记录',
    noEntries: '暂无记录',
    noEntriesForTime: '此时间段暂无记录',
    selectCategoryToView: '请在上方选择类别以查看记录',
    day: '天',
    week: '周'
  }
};

export type Language = 'en' | 'zh';

export const getTranslation = (lang: Language, key: keyof typeof translations.en): string => {
  return translations[lang][key] || translations.en[key];
};

export const t = (lang: Language, key: keyof typeof translations.en): string => {
  return getTranslation(lang, key);
};
