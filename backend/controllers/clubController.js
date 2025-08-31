const Club = require('../models/Club');
const User = require('../models/User');
const EnrollmentRequest = require('../models/EnrollmentRequest');

// Create a new club (admin only)
exports.createClub = async (req, res) => {
  try {
    const { name, description, category, logoUrl } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    // Generate a unique club key
    const clubKey = `CLUB_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const club = await Club.create({
      name,
      description,
      category: category || 'General',
      logoUrl: logoUrl || '',
      clubKey,
      enrollmentOpen: true,
      coordinators: []
    });

    res.status(201).json(club);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a club (admin only)
exports.updateClub = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, logoUrl, coordinators } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    
    // Handle coordinator assignment
    if (coordinators && Array.isArray(coordinators)) {
      // Find users by roll numbers and get their IDs
      const coordinatorUsers = await User.find({ rollNo: { $in: coordinators } });
      const coordinatorIds = coordinatorUsers.map(user => user._id);
      
      // Update the club with new coordinators
      updateData.coordinators = coordinatorIds;
      
      // Update the coordinatingClub field for these users
      await User.updateMany(
        { _id: { $in: coordinatorIds } },
        { coordinatingClub: id }
      );
    }

    const club = await Club.findByIdAndUpdate(id, updateData, { new: true });
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    res.json(club);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    res.json(club);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all members of a club
exports.getClubMembers = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Find all users who are members of this club
    const members = await User.find({ clubs: club._id })
      .select('name email rollNo branch year')
      .sort({ name: 1 });

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all club keys (admin only)
exports.getAllClubKeys = async (req, res) => {
  try {
    const clubs = await Club.find({}, 'name clubKey');
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a club's key (admin only)
exports.updateClubKey = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { clubKey } = req.body;
    if (!clubKey) return res.status(400).json({ message: 'clubKey is required' });
    const club = await Club.findByIdAndUpdate(clubId, { clubKey }, { new: true });
    if (!club) return res.status(404).json({ message: 'Club not found' });
    res.json({ message: 'Club key updated', club });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Toggle enrollment (coordinator or admin)
exports.toggleEnrollment = async (req, res) => {
  try {
    const { clubId } = req.params;
    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    // Only admin or coordinator of this club
    const { role, userId } = req.user;
    if (role !== 'admin') {
      if (role !== 'coordinator') return res.status(403).json({ message: 'Forbidden' });
      const isCoordinator = club.coordinators.some((id) => String(id) === String(userId));
      if (!isCoordinator) return res.status(403).json({ message: 'Not this club coordinator' });
    }

    club.enrollmentOpen = !club.enrollmentOpen;
    await club.save();
    res.json({ message: 'Enrollment status updated', enrollmentOpen: club.enrollmentOpen });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Enroll current user (student) into a club, now creates enrollment request
exports.enrollInClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { userId, role } = req.user;
    const { year, branch } = req.body;

    if (role !== 'student') return res.status(403).json({ message: 'Only students can enroll' });

    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    if (!club.enrollmentOpen) return res.status(400).json({ message: 'Enrollment is closed for this club' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if user is already enrolled in this club
    const alreadyMember = user.clubs.some((c) => String(c) === String(clubId));
    if (alreadyMember) {
      return res.status(400).json({ message: 'You are already enrolled in this club' });
    }

    // Check if there's already a pending request
    const existingRequest = await EnrollmentRequest.findOne({
      student: userId,
      club: clubId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending enrollment request for this club' });
    }

    // Update year/branch if provided
    if (year !== undefined) user.year = year;
    if (branch !== undefined) user.branch = branch;
    await user.save();

    // Create enrollment request
    const enrollmentRequest = new EnrollmentRequest({
      student: userId,
      club: clubId,
      status: 'pending'
    });

    await enrollmentRequest.save();

    res.json({ 
      message: 'Enrollment request sent successfully', 
      requestId: enrollmentRequest._id,
      status: 'pending'
    });
  } catch (err) {
    console.error('Enrollment request error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get enrollment requests for a club (coordinator only)
exports.getEnrollmentRequests = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { userId, role } = req.user;

    if (role !== 'coordinator') {
      return res.status(403).json({ message: 'Only coordinators can view enrollment requests' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check if user is coordinator of this club
    const isCoordinator = club.coordinators.some((id) => String(id) === String(userId));
    if (!isCoordinator) {
      return res.status(403).json({ message: 'You are not a coordinator of this club' });
    }

    const requests = await EnrollmentRequest.find({ club: clubId })
      .populate('student', 'name email rollNo branch year')
      .sort({ submittedAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Handle enrollment request (approve/reject)
exports.handleEnrollmentRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, message } = req.body;
    const { userId, role } = req.user;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject"' });
    }

    const enrollmentRequest = await EnrollmentRequest.findById(requestId)
      .populate('student')
      .populate('club');

    if (!enrollmentRequest) {
      return res.status(404).json({ message: 'Enrollment request not found' });
    }

    if (role !== 'coordinator') {
      return res.status(403).json({ message: 'Only coordinators can handle enrollment requests' });
    }

    // Check if user is coordinator of this club
    const isCoordinator = enrollmentRequest.club.coordinators.some((id) => String(id) === String(userId));
    if (!isCoordinator) {
      return res.status(403).json({ message: 'You are not a coordinator of this club' });
    }

    if (enrollmentRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }

    // Update request status
    enrollmentRequest.status = action === 'approve' ? 'accepted' : 'rejected';
    enrollmentRequest.message = message || '';
    enrollmentRequest.reviewedAt = new Date();
    enrollmentRequest.reviewedBy = userId;

    if (action === 'approve') {
      // Add student to club
      const student = enrollmentRequest.student;
      student.clubs.push(enrollmentRequest.club._id);
      await student.save();
    }

    await enrollmentRequest.save();

    res.json({ 
      message: `Enrollment request ${action}d successfully`,
      status: enrollmentRequest.status
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get student's enrollment status for a club
exports.getEnrollmentStatus = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { userId, role } = req.user;

    if (role !== 'student') {
      return res.status(403).json({ message: 'Only students can check enrollment status' });
    }

    // Check if already enrolled
    const user = await User.findById(userId);
    const isEnrolled = user.clubs.some((c) => String(c) === String(clubId));

    if (isEnrolled) {
      return res.json({ 
        status: 'enrolled',
        message: 'You are enrolled for this club'
      });
    }

    // Check for pending request
    const pendingRequest = await EnrollmentRequest.findOne({
      student: userId,
      club: clubId,
      status: 'pending'
    });

    if (pendingRequest) {
      return res.json({ 
        status: 'pending',
        message: 'Request sent'
      });
    }

    // Check for rejected request
    const rejectedRequest = await EnrollmentRequest.findOne({
      student: userId,
      club: clubId,
      status: 'rejected'
    });

    if (rejectedRequest) {
      return res.json({ 
        status: 'rejected',
        message: 'You are rejected'
      });
    }

    // No request found
    return res.json({ 
      status: 'none',
      message: 'No enrollment request found'
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get pending membership requests for coordinator's club
exports.getPendingMembershipRequests = async (req, res) => {
  try {
    const { userId, coordinatingClub } = req.user;
    
    if (!coordinatingClub) {
      return res.status(400).json({ message: 'No club assigned to this coordinator' });
    }

    // Find all users who have this club in their clubs array (pending approval)
    // This is a simplified approach - in a real system you'd have a separate MembershipRequest model
    const pendingMembers = await User.find({ 
      clubs: coordinatingClub,
      role: 'student'
    })
      .select('name email rollNo branch year')
      .sort({ createdAt: -1 });

    res.json(pendingMembers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Handle membership request (approve/reject)
exports.handleMembershipRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body;
    const { userId, coordinatingClub } = req.user;

    if (!coordinatingClub) {
      return res.status(400).json({ message: 'No club assigned to this coordinator' });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject"' });
    }

    // Find the user making the request
    const user = await User.findById(requestId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (action === 'approve') {
      // User is already in the club (as per current simplified model)
      res.json({ message: 'Membership request approved' });
    } else {
      // Remove user from club
      user.clubs = user.clubs.filter(clubId => String(clubId) !== String(coordinatingClub));
      await user.save();
      res.json({ message: 'Membership request rejected' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};