export const caregivers = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    profilePicture: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    bio: "Experienced caregiver with 8 years of experience specializing in dementia care and medication management. Passionate about providing compassionate care to seniors.",
    yearsOfExperience: 8,
    backgroundCheckStatus: "verified",
    skillIds: ["1", "2", "3"],
    hourlyRate: 25,
    rating: 4.8,
    totalReviews: 127
  },
  {
    id: "2",
    firstName: "Michael",
    lastName: "Chen",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    bio: "Certified nursing assistant with 5 years of experience in home care. Specializes in mobility assistance and personal care services.",
    yearsOfExperience: 5,
    backgroundCheckStatus: "verified",
    skillIds: ["1", "4", "5"],
    hourlyRate: 22,
    rating: 4.6,
    totalReviews: 89
  },
  {
    id: "3",
    firstName: "Emily",
    lastName: "Rodriguez",
    profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    bio: "Licensed practical nurse with 10 years of experience. Expert in wound care, medication administration, and chronic disease management.",
    yearsOfExperience: 10,
    backgroundCheckStatus: "verified",
    skillIds: ["2", "3", "6"],
    hourlyRate: 30,
    rating: 4.9,
    totalReviews: 203
  },
  {
    id: "4",
    firstName: "David",
    lastName: "Thompson",
    profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    bio: "Physical therapy assistant with 6 years of experience. Specializes in rehabilitation exercises and mobility training for seniors.",
    yearsOfExperience: 6,
    backgroundCheckStatus: "verified",
    skillIds: ["4", "5", "7"],
    hourlyRate: 28,
    rating: 4.7,
    totalReviews: 156
  },
  {
    id: "5",
    firstName: "Lisa",
    lastName: "Williams",
    profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    bio: "Certified home health aide with 7 years of experience. Provides comprehensive personal care and companionship services.",
    yearsOfExperience: 7,
    backgroundCheckStatus: "verified",
    skillIds: ["1", "2", "8"],
    hourlyRate: 24,
    rating: 4.5,
    totalReviews: 94
  },
  {
    id: "6",
    firstName: "James",
    lastName: "Brown",
    profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    bio: "Registered nurse with 12 years of experience in geriatric care. Expert in medication management and health monitoring.",
    yearsOfExperience: 12,
    backgroundCheckStatus: "verified",
    skillIds: ["2", "3", "6", "9"],
    hourlyRate: 35,
    rating: 4.9,
    totalReviews: 178
  }
];

export const skills = [
  {
    id: "1",
    name: "Personal Care",
    description: "Assistance with bathing, dressing, and grooming"
  },
  {
    id: "2",
    name: "Medication Management",
    description: "Administering and monitoring medications"
  },
  {
    id: "3",
    name: "Dementia Care",
    description: "Specialized care for patients with dementia"
  },
  {
    id: "4",
    name: "Mobility Assistance",
    description: "Help with walking, transfers, and exercises"
  },
  {
    id: "5",
    name: "Meal Preparation",
    description: "Preparing nutritious meals and dietary planning"
  },
  {
    id: "6",
    name: "Wound Care",
    description: "Basic wound care and dressing changes"
  },
  {
    id: "7",
    name: "Physical Therapy",
    description: "Rehabilitation exercises and mobility training"
  },
  {
    id: "8",
    name: "Companionship",
    description: "Social interaction and emotional support"
  },
  {
    id: "9",
    name: "Health Monitoring",
    description: "Vital signs monitoring and health assessments"
  }
];

export const caregiverAvailability = [
  {
    id: "1",
    caregiverId: "1",
    date: "2024-01-15",
    startTime: "08:00",
    endTime: "16:00",
    isAvailable: true
  },
  {
    id: "2",
    caregiverId: "1",
    date: "2024-01-16",
    startTime: "08:00",
    endTime: "16:00",
    isAvailable: true
  },
  {
    id: "3",
    caregiverId: "2",
    date: "2024-01-15",
    startTime: "12:00",
    endTime: "20:00",
    isAvailable: true
  },
  {
    id: "4",
    caregiverId: "3",
    date: "2024-01-15",
    startTime: "06:00",
    endTime: "14:00",
    isAvailable: true
  }
]; 