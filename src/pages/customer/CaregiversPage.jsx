import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { caregiversAPI, skillsAPI } from '../../services/api';
import CaregiverCard from '../../components/common/CaregiverCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CaregiversPage = () => {
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [caregivers, setCaregivers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredCaregivers, setFilteredCaregivers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSkill === 'all') {
      setFilteredCaregivers(caregivers);
    } else {
      setFilteredCaregivers(
        caregivers.filter(caregiver => 
          caregiver.skillIds && Array.isArray(caregiver.skillIds) && 
          caregiver.skillIds.includes(selectedSkill)
        )
      );
    }
  }, [selectedSkill, caregivers]);

  const fetchData = async () => {
    try {
      const [caregiversResponse, skillsResponse] = await Promise.all([
        caregiversAPI.getAll(),
        skillsAPI.getAll()
      ]);
      
      setCaregivers(caregiversResponse.data);
      setSkills(skillsResponse.data);
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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filter by Skill</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedSkill === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedSkill('all')}
              >
                All Caregivers
              </Button>
              {skills.map((skill) => (
                <Button
                  key={skill.id}
                  variant={selectedSkill === skill.id ? 'default' : 'outline'}
                  onClick={() => setSelectedSkill(skill.id)}
                >
                  {skill.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Caregivers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCaregivers.map((caregiver) => (
            <CaregiverCard key={caregiver.id} caregiver={caregiver} skills={skills} />
          ))}
        </div>

        {/* Empty State */}
        {filteredCaregivers.length === 0 && (
          <Card className="text-center py-16">
            <CardContent>
              <p className="text-xl text-muted-foreground">
                No caregivers found with this skill.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CaregiversPage; 