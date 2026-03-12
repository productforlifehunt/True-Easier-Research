// Bilingual toast helper / 双语 toast 工具
// Usage: bToast.success('Saved', '已保存') or bToast.error('Failed', '失败')
import toast from 'react-hot-toast';

const getLang = (): string => {
  return localStorage.getItem('easyresearch_lang') || 'en';
};

export const bToast = {
  success: (en: string, zh: string) => {
    toast.success(getLang() === 'zh' ? zh : en);
  },
  error: (en: string, zh: string) => {
    toast.error(getLang() === 'zh' ? zh : en);
  },
  info: (en: string, zh: string) => {
    toast(getLang() === 'zh' ? zh : en);
  },
};
