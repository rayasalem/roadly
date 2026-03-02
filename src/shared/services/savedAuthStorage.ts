/**
 * تخزين آخر بيانات تسجيل الدخول والتسجيل لعرضها عند فتح التطبيق.
 * يستخدم localStorage على الويب، والذاكرة على الموبايل حتى إضافة AsyncStorage.
 */

const KEY_LAST_LOGIN_EMAIL = 'mechnow_last_login_email';
const KEY_LAST_REGISTER = 'mechnow_last_register';

const memory: Record<string, string> = {};

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  return null;
}

function getItem(key: string): string | null {
  try {
    const st = getStorage();
    if (st) return st.getItem(key);
    return memory[key] ?? null;
  } catch {
    return memory[key] ?? null;
  }
}

function setItem(key: string, value: string): void {
  try {
    const st = getStorage();
    if (st) st.setItem(key, value);
    memory[key] = value;
  } catch {
    memory[key] = value;
  }
}

export interface LastRegisterInfo {
  name: string;
  email: string;
}

export const savedAuthStorage = {
  getLastLoginEmail(): string | null {
    return getItem(KEY_LAST_LOGIN_EMAIL);
  },
  setLastLoginEmail(email: string): void {
    if (email.trim()) setItem(KEY_LAST_LOGIN_EMAIL, email.trim());
  },
  getLastRegister(): LastRegisterInfo | null {
    const raw = getItem(KEY_LAST_REGISTER);
    if (!raw) return null;
    try {
      const o = JSON.parse(raw) as LastRegisterInfo;
      if (o && typeof o.name === 'string' && typeof o.email === 'string') return o;
    } catch {}
    return null;
  },
  setLastRegister(info: LastRegisterInfo): void {
    if (info.name?.trim() && info.email?.trim()) {
      setItem(KEY_LAST_REGISTER, JSON.stringify({ name: info.name.trim(), email: info.email.trim() }));
    }
  },
};
