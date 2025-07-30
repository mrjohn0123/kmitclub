"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem("token"))

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common["Authorization"]
    }
  }, [token])

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get("/api/auth/profile")
          setUser(response.data)
        } catch (error) {
          console.error("Error fetching user:", error)
          // Clear invalid token
          localStorage.removeItem("token")
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [token])

  const login = async (email, password, role) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password, role })
      const { token: newToken, user: userData } = response.data

      // Store token and update state
      localStorage.setItem("token", newToken)
      setToken(newToken)
      setUser(userData)
      
      // Update axios headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`

      return { success: true, user: userData }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Login failed. Please check your credentials.",
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post("/api/auth/register", userData)
      const { token: newToken, user: userInfo } = response.data

      // Store token and update state
      localStorage.setItem("token", newToken)
      setToken(newToken)
      setUser(userInfo)
      
      // Update axios headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`

      return { success: true, user: userInfo }
    } catch (error) {
      console.error("Registration error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed. Please try again.",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common["Authorization"]
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
