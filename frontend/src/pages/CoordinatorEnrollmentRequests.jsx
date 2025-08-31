"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./Dashboard.module.css"

const CoordinatorEnrollmentRequests = () => {
  const { id: clubId } = useParams()
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [processing, setProcessing] = useState({})

  useEffect(() => {
    if (clubId) {
      fetchEnrollmentRequests()
    }
  }, [clubId])

  const fetchEnrollmentRequests = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/clubs/${clubId}/enrollment-requests`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setRequests(response.data)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch enrollment requests')
    } finally {
      setLoading(false)
    }
  }

  const handleRequest = async (requestId, action) => {
    setProcessing(prev => ({ ...prev, [requestId]: true }))
    try {
      await axios.put(`http://localhost:5000/api/clubs/enrollment-requests/${requestId}`, {
        action,
        message: action === 'approve' ? 'Request approved' : 'Request rejected'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })

      // Update local state
      setRequests(prev => prev.map(req => 
        req._id === requestId 
          ? { ...req, status: action === 'approve' ? 'accepted' : 'rejected' }
          : req
      ))

      alert(`Request ${action}d successfully!`)
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${action} request`)
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }))
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Pending', class: 'pending' },
      accepted: { text: 'Accepted', class: 'accepted' },
      rejected: { text: 'Rejected', class: 'rejected' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return <span className={`${styles.statusBadge} ${styles[config.class]}`}>{config.text}</span>
  }

  if (loading) {
    return <div className="loading">Loading enrollment requests...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className={styles.dashboardHome}>
      <div className={styles.welcomeSection}>
        <h1>Enrollment Requests</h1>
        <p>Manage student enrollment requests for your club</p>
      </div>

      <div className={styles.section}>
        <h2>Student Requests</h2>
        
        {requests.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No enrollment requests found.</p>
          </div>
        ) : (
          <div className={styles.requestsList}>
            {requests.map((request) => (
              <div key={request._id} className={styles.requestItem}>
                <div className={styles.requestInfo}>
                  <h4>{request.student.name}</h4>
                  <p><strong>Email:</strong> {request.student.email}</p>
                  <p><strong>Roll No:</strong> {request.student.rollNo}</p>
                  <p><strong>Branch:</strong> {request.student.branch || 'Not specified'}</p>
                  <p><strong>Year:</strong> {request.student.year || 'Not specified'}</p>
                  <p><strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleDateString()}</p>
                </div>
                
                <div className={styles.requestActions}>
                  <div className={styles.statusSection}>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  {request.status === 'pending' && (
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.approveBtn}
                        onClick={() => handleRequest(request._id, 'approve')}
                        disabled={processing[request._id]}
                      >
                        {processing[request._id] ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() => handleRequest(request._id, 'reject')}
                        disabled={processing[request._id]}
                      >
                        {processing[request._id] ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  )}
                  
                  {request.status !== 'pending' && (
                    <div className={styles.processedInfo}>
                      <p><strong>Processed:</strong> {new Date(request.reviewedAt).toLocaleDateString()}</p>
                      {request.message && <p><strong>Message:</strong> {request.message}</p>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CoordinatorEnrollmentRequests
