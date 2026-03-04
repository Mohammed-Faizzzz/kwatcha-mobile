// utils/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = 'https://kwatcha-api.onrender.com';

export async function fetchStocks() {
  try {
    const res = await fetch(`${API_BASE}/stocks`);
    const data = await res.json();
    return data.stocks;
  } catch (err) {
    console.error('Failed to fetch stocks:', err);
    return null;
  }
}

export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || data?.error || 'Invalid username or password.');
  }
  await AsyncStorage.setItem('mse_user', JSON.stringify({ username, loggedIn: true }));
}

export async function logoutUser() {
  await AsyncStorage.removeItem('mse_user');
}

export async function getLoggedInUser() {
  const stored = await AsyncStorage.getItem('mse_user');
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed.loggedIn ? parsed.username : null;
  } catch {
    return null;
  }
}

export function calcMarketStatus() {
  const now = new Date();
  const malawiTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const isWeekday = malawiTime.getDay() !== 0 && malawiTime.getDay() !== 6;
  const isMarketOpen = malawiTime.getHours() >= 9 && malawiTime.getHours() < 17;
  return isWeekday && isMarketOpen ? 'Open' : 'Closed';
}