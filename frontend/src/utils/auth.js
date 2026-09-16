import axios from 'axios'

const TOKEN_KEY = 'admin_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function isLoggedIn() {
  return !!getToken()
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
  axios.defaults.headers.common.Authorization = `Bearer ${token}`
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  delete axios.defaults.headers.common.Authorization
}

export function initAuth() {
  const token = getToken()
  if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`
}
