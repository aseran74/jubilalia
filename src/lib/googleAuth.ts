import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App as CapApp } from '@capacitor/app';
import { supabase } from './supabase';

export const NATIVE_OAUTH_REDIRECT = 'com.jubilalia://auth/callback';

export function getAuthRedirectUrl() {
  if (Capacitor.isNativePlatform()) {
    return NATIVE_OAUTH_REDIRECT;
  }

  if (window.location.hostname.includes('jubilalia.com')) {
    return 'https://jubilalia.com/auth/callback';
  }

  return `${window.location.origin}/auth/callback`;
}

export async function startGoogleOAuth() {
  const redirectTo = getAuthRedirectUrl();
  const isNative = Capacitor.isNativePlatform();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: isNative,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });

  if (error) throw error;

  if (isNative) {
    if (!data.url) {
      throw new Error('No se pudo abrir el inicio de sesión de Google.');
    }
    await Browser.open({ url: data.url });
  }
}

function getCodeFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('code');
  } catch {
    const match = url.match(/[?&]code=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
}

function getErrorFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('error_description') || parsed.searchParams.get('error');
  } catch {
    return null;
  }
}

export function listenForNativeOAuthReturn() {
  if (!Capacitor.isNativePlatform()) {
    return () => undefined;
  }

  const listenerPromise = CapApp.addListener('appUrlOpen', async ({ url }) => {
    try {
      const oauthError = getErrorFromUrl(url);
      if (oauthError) {
        console.error('Error OAuth nativo:', oauthError);
        return;
      }

      const code = getCodeFromUrl(url);
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('Error intercambiando código OAuth:', error);
          return;
        }
        const target = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register')
          ? '/'
          : window.location.pathname;
        window.location.replace(target === '/auth/callback' ? '/' : target || '/');
      }
    } finally {
      try {
        await Browser.close();
      } catch {
        // El navegador in-app puede haberse cerrado solo
      }
    }
  });

  return () => {
    listenerPromise.then((listener) => listener.remove()).catch(() => undefined);
  };
}
