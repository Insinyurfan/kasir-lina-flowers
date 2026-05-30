const USER_SESSION_KEY = "user_lina";

const parseSavedUser = <T>(savedUser: string | null): T | null => {
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser) as T;
  } catch {
    clearSavedUserSession(false);
    return null;
  }
};

export const getSavedUserSession = <T>() => {
  if (typeof window === "undefined") return null;

  return parseSavedUser<T>(
    localStorage.getItem(USER_SESSION_KEY) || sessionStorage.getItem(USER_SESSION_KEY)
  );
};

export const saveUserSession = (user: unknown, remember: boolean) => {
  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;

  storage.setItem(USER_SESSION_KEY, JSON.stringify(user));
  otherStorage.removeItem(USER_SESSION_KEY);
  window.dispatchEvent(new Event("user_lina_updated"));
};

export const updateSavedUserSession = (user: unknown) => {
  const storage = localStorage.getItem(USER_SESSION_KEY) ? localStorage : sessionStorage;

  storage.setItem(USER_SESSION_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("user_lina_updated"));
};

export const clearSavedUserSession = (shouldBroadcast = true) => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(USER_SESSION_KEY);
  sessionStorage.removeItem(USER_SESSION_KEY);
  if (shouldBroadcast) window.dispatchEvent(new Event("user_lina_updated"));
};
