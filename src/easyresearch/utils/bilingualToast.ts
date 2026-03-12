// Bilingual toast helper / 双语 toast 工具
// Usage: bToast.success('Saved', '已保存') or bToast.error('Failed', '失败')
// Fallback: toast.success('msg') / toast.error('msg') — auto-selects language
import hotToast from 'react-hot-toast';

const getLang = (): string => {
  return localStorage.getItem('easyresearch_lang') || 'en';
};

export const bToast = {
  success: (en: string, zh: string) => {
    hotToast.success(getLang() === 'zh' ? zh : en);
  },
  error: (en: string, zh: string) => {
    hotToast.error(getLang() === 'zh' ? zh : en);
  },
  info: (en: string, zh: string) => {
    hotToast(getLang() === 'zh' ? zh : en);
  },
};

// Backward-compat: files that still call toast.success('msg') / toast.error('msg')
// These display the same string regardless of language (migration fallback)
export const toast = {
  success: (msg: string) => hotToast.success(msg),
  error: (msg: string) => hotToast.error(msg),
};
