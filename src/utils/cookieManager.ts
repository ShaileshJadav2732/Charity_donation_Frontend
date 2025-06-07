// Cookie management utilities

export interface CookieOptions {
  path?: string;
  maxAge?: number;
  sameSite?: 'Strict' | 'Lax' | 'None';
  secure?: boolean;
  httpOnly?: boolean;
}

const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  path: '/',
  maxAge: 3600, // 1 hour
  sameSite: 'Strict',
  secure: process.env.NODE_ENV === 'production',
};

export class CookieManager {
  private static formatCookieString(
    name: string, 
    value: string, 
    options: CookieOptions = {}
  ): string {
    const opts = { ...DEFAULT_COOKIE_OPTIONS, ...options };
    let cookieString = `${name}=${value}`;
    
    if (opts.path) cookieString += `; path=${opts.path}`;
    if (opts.maxAge) cookieString += `; max-age=${opts.maxAge}`;
    if (opts.sameSite) cookieString += `; SameSite=${opts.sameSite}`;
    if (opts.secure) cookieString += `; Secure`;
    if (opts.httpOnly) cookieString += `; HttpOnly`;
    
    return cookieString;
  }

  static setAuthToken(token: string, options?: CookieOptions): void {
    if (typeof window === 'undefined') return;
    
    const cookieString = this.formatCookieString('authToken', token, options);
    document.cookie = cookieString;
  }

  static getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => 
      cookie.trim().startsWith('authToken=')
    );
    
    return authCookie ? authCookie.split('=')[1] : null;
  }

  static removeAuthToken(): void {
    if (typeof window === 'undefined') return;
    
    document.cookie = 'authToken=; path=/; max-age=0; SameSite=Strict';
  }

  static setCookie(name: string, value: string, options?: CookieOptions): void {
    if (typeof window === 'undefined') return;
    
    const cookieString = this.formatCookieString(name, value, options);
    document.cookie = cookieString;
  }

  static getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => 
      c.trim().startsWith(`${name}=`)
    );
    
    return cookie ? cookie.split('=')[1] : null;
  }

  static removeCookie(name: string, path: string = '/'): void {
    if (typeof window === 'undefined') return;
    
    document.cookie = `${name}=; path=${path}; max-age=0; SameSite=Strict`;
  }

  static clearAllCookies(): void {
    if (typeof window === 'undefined') return;
    
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name) {
        this.removeCookie(name);
      }
    });
  }

  // Refresh auth token with new expiration
  static refreshAuthToken(token: string): void {
    this.setAuthToken(token, {
      maxAge: 3600, // 1 hour
    });
  }

  // Check if auth token exists and is not expired
  static hasValidAuthToken(): boolean {
    const token = this.getAuthToken();
    return !!token;
  }
}
