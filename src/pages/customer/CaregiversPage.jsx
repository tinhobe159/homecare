import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { caregiversAPI, skillsAPI, caregiverSkillsAPI } from '../../services/api';
import CaregiverCard from '../../components/common/CaregiverCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const CaregiversPage = () => {
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [caregivers, setCaregivers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [caregiverSkills, setCaregiverSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredCaregivers, setFilteredCaregivers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSkill === 'all') {
      setFilteredCaregivers(caregivers);
    } else {
      // Convert selectedSkill to number for comparison
      const skillId = Number(selectedSkill);
      
      // Filter caregivers who have the selected skill
      const caregiversWithSkill = caregiverSkills
        .filter(cs => Number(cs.skill_id) === skillId)
        .map(cs => Number(cs.user_id));
      
      const filtered = caregivers.filter(caregiver => 
        caregiversWithSkill.includes(Number(caregiver.id))
      );
      
      setFilteredCaregivers(filtered);
    }
  }, [selectedSkill, caregivers, caregiverSkills]);

  const fetchData = async () => {
    try {
      const [caregiversResponse, skillsResponse, caregiverSkillsResponse] = await Promise.all([
        caregiversAPI.getAll(),
        skillsAPI.getAll(),
        caregiverSkillsAPI.getAll()
      ]);
      setCaregivers(caregiversResponse.data);
      setSkills(skillsResponse.data);
      setCaregiverSkills(caregiverSkillsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load caregivers data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Caregivers
          </h1>
          <p className="text-xl text-gray-600">
            Meet our team of qualified, compassionate healthcare professionals
          </p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Filter by Skill</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSkill('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedSkill === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Caregivers
            </button>
            {skills.map((skill) => (
              <button
                key={skill.id}
                onClick={() => setSelectedSkill(Number(skill.id))}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedSkill === Number(skill.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {skill.name}
              </button>
            ))}
          </div>
        </div>

        {/* Caregivers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCaregivers.map((caregiver) => (
            <CaregiverCard 
              key={caregiver.id} 
              caregiver={caregiver} 
              skills={skills} 
              caregiverSkills={caregiverSkills}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredCaregivers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">
              No caregivers found with this skill.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaregiversPage; 