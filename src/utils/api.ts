// src/utils/api.ts
import { jwtDecode } from 'jwt-decode';

export function getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift();
    }
    return undefined;
  }
  
  export async function setCookie(name: string, value: string) {
    document.cookie = `${name}=${value}; path=/; secure; samesite=strict`;
  }

  // Function to decode JWT token and extract user ID
  export function getUserIdFromToken(): string | null {
    const accessToken = getCookie('access_token');
    if (!accessToken) {
      return null;
    }
    
    try {
      // Use jwt-decode library for proper JWT decoding
      const decoded = jwtDecode<any>(accessToken);
      
      // Microsoft JWT format uses this specific claim for user ID
      return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || null;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }
  
  export async function tryRefreshToken(): Promise<boolean> {
    const refreshToken = getCookie('refresh_token');
    if (!refreshToken) {
      window.location.href = '/auth-error';
      return false;
    }
  
    const API_URL = import.meta.env.VITE_API_URL;
  
    const refreshRes = await fetch(`${API_URL}/Auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      await setCookie('access_token', data.access_token);
      await setCookie('refresh_token', data.refresh_token);
      return true;  // Refresh thành công
    } else {
      window.location.href = '/auth-error';
      return false; // Refresh thất bại
    }
  }
  
  // Hàm gọi API với access token, tự động refresh nếu bị 401/403
  export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    // Lấy access token từ cookie
    const accessToken = getCookie('access_token');
  
    // Kết hợp headers: giữ headers ban đầu + ghi đè Authorization
    const headers = new Headers(options.headers || {});
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  
    // Gọi API lần 1 với headers đã set
    let res = await fetch(url, { ...options, headers });
  
    if (res.status === 401 || res.status === 403) {
      // Nếu lỗi, thử refresh token
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        const newAccessToken = getCookie('access_token');
        const newHeaders = new Headers(options.headers || {});
        if (newAccessToken) {
          newHeaders.set('Authorization', `Bearer ${newAccessToken}`);
        }
  
        // Gọi lại API với token mới và giữ nguyên options cũ
        res = await fetch(url, { ...options, headers: newHeaders });
      }
    }
  
    return res;
  }
  
  