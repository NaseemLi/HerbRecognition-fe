import { defineStore } from 'pinia'
import { ref } from 'vue'

interface User {
  id: number
  username: string
  role: string
  avatar: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const savedUser = localStorage.getItem('user')
  const user = ref<User | null>(savedUser ? JSON.parse(savedUser) : null)

  function setAuth(newToken: string, newUser: User) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, setAuth, logout }
})
