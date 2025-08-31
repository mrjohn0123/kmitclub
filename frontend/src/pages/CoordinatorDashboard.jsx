"use client"

import { useState, useEffect } from "react"
import { Routes, Route, Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./Dashboard.module.css"
import CoordinatorFeedback from "./CoordinatorFeedback"
import CoordinatorPolls from "./CoordinatorPolls"

const CoordinatorDashboard = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [membershipRequests, setMembershipRequests] = useState([])
  const [clubMembers, setClubMembers] = useState([])
  const [clubEvents, setClubEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Get the coordinator's club ID
      const clubId = user.coordinatingClub
      
      if (!clubId) {
        console.error('No club assigned to coordinator')
        setLoading(false)
        return
      }

      // Fetch all required data in parallel
      const [requestsRes, membersRes, eventsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/clubs/${clubId}/enrollment-requests`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`http://localhost:5000/api/clubs/${clubId}/members`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`http://localhost:5000/api/events/coordinator/my-events`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ])

      setMembershipRequests(requestsRes.data)
      setClubMembers(membersRes.data)
      setClubEvents(eventsRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
      // Set empty arrays on error to avoid undefined errors
      setMembershipRequests([])
      setClubMembers([])
      setClubEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleMembershipRequest = async (requestId, action) => {
    try {
      await axios.put(`http://localhost:5000/api/clubs/enrollment-requests/${requestId}`, { 
        action,
        message: action === 'approve' ? 'Request approved' : 'Request rejected'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      alert(`Request ${action}d successfully!`)
      fetchData() // Refresh data
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${action} request`)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className={styles.dashboardHome}>
      <div className={styles.welcomeSection}>
        <h1>Coordinator Dashboard</h1>
        <p>Welcome, {user.name}! Manage your club activities here.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>{membershipRequests.length}</h3>
          <p>Pending Requests</p>
        </div>
        <div className={styles.statCard}>
          <h3>{clubMembers.length}</h3>
          <p>Club Members</p>
        </div>
        <div className={styles.statCard}>
          <h3>{clubEvents.length}</h3>
          <p>Club Events</p>
        </div>
      </div>

      <div className={styles.functionalityGrid}>
        <Link to="/coordinator/members" className={styles.functionCard}>
          <div className={styles.cardContent}>
            <h3>Member Management</h3>
            <p>View and manage club members</p>
            <div className={styles.cardIcon}>👥</div>
          </div>
        </Link>

        <Link to="/coordinator/events" className={styles.functionCard}>
          <div className={styles.cardContent}>
            <h3>Event Management</h3>
            <p>Create and manage club events</p>
            <div className={styles.cardIcon}>📅</div>
          </div>
        </Link>

        <Link to="/coordinator/feedback" className={styles.functionCard}>
          <div className={styles.cardContent}>
            <h3>Feedback Management</h3>
            <p>Review and forward feedback to admin</p>
            <div className={styles.cardIcon}>💬</div>
          </div>
        </Link>

        <Link to="/coordinator/polls" className={styles.functionCard}>
          <div className={styles.cardContent}>
            <h3>Poll Management</h3>
            <p>Create polls for your club members</p>
            <div className={styles.cardIcon}>📊</div>
          </div>
        </Link>

        <Link to={`/coordinator/enrollment-requests/${user.coordinatingClub}`} className={styles.functionCard}>
          <div className={styles.cardContent}>
            <h3>Enrollment Requests</h3>
            <p>Review and manage student enrollment requests</p>
            <div className={styles.cardIcon}>📝</div>
          </div>
        </Link>
      </div>

      <div className={styles.section}>
        <h2>Recent Enrollment Requests</h2>
        {membershipRequests.length > 0 ? (
          <div className={styles.requestsList}>
            {membershipRequests.slice(0, 5).map((request) => (
              <div key={request._id} className={styles.requestItem}>
                <div className={styles.requestInfo}>
                  <h4>{request.student.name}</h4>
                  <p>
                    {request.student.rollNo} - {request.student.branch || 'N/A'} {request.student.year || 'N/A'}
                  </p>
                  <p><strong>Status:</strong> {request.status}</p>
                  <p><strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleDateString()}</p>
                </div>
                <div className={styles.requestActions}>
                  {request.status === 'pending' && (
                    <>
                      <button className={styles.approveBtn} onClick={() => handleMembershipRequest(request._id, "approve")}>
                        Approve
                      </button>
                      <button className={styles.rejectBtn} onClick={() => handleMembershipRequest(request._id, "reject")}>
                        Reject
                      </button>
                    </>
                  )}
                  {request.status !== 'pending' && (
                    <span className={styles.statusBadge}>
                      {request.status === 'accepted' ? '✅ Approved' : '❌ Rejected'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No pending enrollment requests.</p>
        )}
      </div>
    </div>
  )
}

export default CoordinatorDashboard
