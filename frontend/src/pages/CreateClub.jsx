"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./Dashboard.module.css"

const CreateClub = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    logoUrl: "",
    instagram: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const categories = [
    "Technical",
    "Cultural",
    "Sports",
    "Literary",
    "Social Service",
    "Entrepreneurship",
    "Other"
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('/api/clubs', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      alert('Club created successfully!')
      navigate('/admin/clubs')
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create club')
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'admin') {
    return <div>Access denied. Admin only.</div>
  }

  return (
    <div className={styles.dashboardHome}>
      <div className={styles.welcomeSection}>
        <h1>Create New Club</h1>
        <p>Add a new club to the KMIT Club Hub</p>
      </div>

      <div className={styles.section}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="name">Club Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter club name"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe the club's purpose and activities"
              rows="4"
              className={styles.textarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className={styles.select}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="logoUrl">Logo URL (Optional)</label>
            <input
              type="url"
              id="logoUrl"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="instagram">Instagram Handle (Optional)</label>
            <input
              type="text"
              id="instagram"
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              placeholder="@clubhandle"
              className={styles.input}
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => navigate('/admin/clubs')}
              className={styles.secondaryButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Club'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateClub
