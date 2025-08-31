"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./ClubDetail.module.css"

const ClubDetail = () => {
  const { id } = useParams()
  const { user, token, updateUser } = useAuth()
  const navigate = useNavigate()
  const [club, setClub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [enrollForm, setEnrollForm] = useState({ year: "", branch: "" })
  const [enrollMsg, setEnrollMsg] = useState("")
  const [enrollmentStatus, setEnrollmentStatus] = useState(null)

  useEffect(() => {
    fetchClub()
    if (user && user.role === 'student') {
      fetchEnrollmentStatus()
    }
    // eslint-disable-next-line
  }, [id, user])

  const fetchClub = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/clubs/${id}`)
      setClub(response.data)
    } catch (error) {
      setError("Failed to load club details")
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrollmentStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/clubs/${id}/enrollment-status`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setEnrollmentStatus(response.data)
    } catch (error) {
      console.error('Failed to fetch enrollment status:', error)
    }
  }

  const handleEnrollChange = (e) => {
    setEnrollForm({ ...enrollForm, [e.target.name]: e.target.value })
  }

  const submitEnrollment = async (e) => {
    e.preventDefault()
    setEnrollMsg("")
    try {
      const res = await axios.post(`http://localhost:5000/api/clubs/${id}/enroll`, {
        year: enrollForm.year ? Number(enrollForm.year) : undefined,
        branch: enrollForm.branch || undefined
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      
      if (res.data.status === 'pending') {
        setEnrollMsg('Request sent')
        setEnrollForm({ year: "", branch: "" })
        setEnrollOpen(false)
        // Refresh enrollment status
        fetchEnrollmentStatus()
      }
    } catch (err) {
      setEnrollMsg(err.response?.data?.message || 'Enrollment failed')
    }
  }

  if (loading) return <div className="loading">Loading club details...</div>
  if (error && !club) return <div className="error">{error}</div>

  const isStudent = user && user.role === 'student'
  const enrollmentEnabled = club?.enrollmentOpen
  const isAlreadyEnrolled = enrollmentStatus?.status === 'enrolled'

  const renderEnrollmentStatus = () => {
    if (!isStudent) {
      return <p className={styles.note}>Login as student to enroll.</p>
    }

    if (isAlreadyEnrolled) {
      return (
        <div className={styles.enrollmentStatus}>
          <p className={styles.success}>✅ You are enrolled for this club!</p>
        </div>
      )
    }

    if (enrollmentStatus?.status === 'pending') {
      return (
        <div className={styles.enrollmentStatus}>
          <p className={styles.pending}>⏳ Request sent</p>
        </div>
      )
    }

    if (enrollmentStatus?.status === 'rejected') {
      return (
        <div className={styles.enrollmentStatus}>
          <p className={styles.rejected}>❌ You are rejected</p>
        </div>
      )
    }

    if (!enrollmentEnabled) {
      return <p className={styles.note}>Enrollment is currently closed for this club.</p>
    }

    return (
      <>
        <p>Status: Open</p>
        <button
          className={styles.enrollBtn}
          onClick={() => setEnrollOpen(!enrollOpen)}
        >
          {enrollOpen ? 'Hide Form' : 'Enroll in Club'}
        </button>
        {enrollOpen && (
          <form onSubmit={submitEnrollment} className={styles.enrollForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Year</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  name="year"
                  value={enrollForm.year}
                  onChange={handleEnrollChange}
                  className={styles.input}
                  placeholder="Enter your year"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Branch</label>
                <input
                  type="text"
                  name="branch"
                  value={enrollForm.branch}
                  onChange={handleEnrollChange}
                  className={styles.input}
                  placeholder="Enter your branch"
                />
              </div>
            </div>
            <button type="submit" className={styles.submitBtn}>Submit Enrollment</button>
            {enrollMsg && <div className={styles.note}>{enrollMsg}</div>}
          </form>
        )}
      </>
    )
  }

  return (
    <div className={styles.clubDetail}>
      <div className="container">
        {/* Club Header */}
        <div className={styles.clubHeader}>
          <div className={styles.clubLogo}>
            <img src={club.logoUrl || "/placeholder.svg"} alt={club.name} />
          </div>
          <div className={styles.clubInfo}>
            <h1 className={styles.clubName}>{club.name}</h1>
            <p className={styles.clubDescription}>{club.description}</p>
          </div>
        </div>

        {/* Enrollment section */}
        <div className={styles.section}>
          <h2>Enrollment</h2>
          {renderEnrollmentStatus()}
        </div>

        {/* Team Heads */}
        {club.teamHeads && club.teamHeads.length > 0 && (
          <div className={styles.section}>
            <h2>Team Heads</h2>
            <ul>
              {club.teamHeads.map((head, idx) => (
                <li key={idx}>
                  <strong>{head.name}</strong> ({head.rollNumber}) - {head.designation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Past Events */}
        {club.eventsConducted && club.eventsConducted.length > 0 && (
          <div className={styles.section}>
            <h2>Past Events</h2>
            <ul>
              {club.eventsConducted.map((event, idx) => (
                <li key={idx}>{event}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Upcoming Events */}
        {club.upcomingEvents && club.upcomingEvents.length > 0 && (
          <div className={styles.section}>
            <h2>Upcoming Events</h2>
            <ul>
              {club.upcomingEvents.map((event, idx) => (
                <li key={idx}>{event}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClubDetail
