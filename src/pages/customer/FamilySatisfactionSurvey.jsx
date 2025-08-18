import React, { useState } from 'react';
import { Star, Heart, MessageCircle, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { familyPortalAPI } from '../../services/api';

const FamilySatisfactionSurvey = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Overall satisfaction
    overallSatisfaction: 0,
    careQuality: 0,
    communicationRating: 0,
    staffProfessionalism: 0,
    responseTime: 0,
    
    // Specific feedback
    mostSatisfiedWith: '',
    improvementAreas: '',
    additionalComments: '',
    
    // Would recommend
    wouldRecommend: '',
    likelihood: 0,
    
    // Contact preferences
    followUpPreferred: false,
    contactMethod: 'email'
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = 4;

  const handleRatingChange = (field, rating) => {
    setFormData(prev => ({
      ...prev,
      [field]: rating
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await familyPortalAPI.submitSatisfactionSurvey({
        customerId: 'cust_001', // Mock customer ID
        ratings: {
          overallSatisfaction: formData.overallSatisfaction,
          careQuality: formData.careQuality,
          communicationRating: formData.communicationRating,
          staffProfessionalism: formData.staffProfessionalism,
          responseTime: formData.responseTime,
          likelihood: formData.likelihood
        },
        feedback: {
          mostSatisfiedWith: formData.mostSatisfiedWith,
          improvementAreas: formData.improvementAreas,
          additionalComments: formData.additionalComments,
          wouldRecommend: formData.wouldRecommend
        },
        preferences: {
          followUpPreferred: formData.followUpPreferred,
          contactMethod: formData.contactMethod
        }
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting survey:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, label, required = false }) => {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              className={`p-1 transition-colors ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
              }`}
            >
              <Star className="w-8 h-8 fill-current" />
            </button>
          ))}
          <span className="ml-3 text-sm text-gray-600">
            {rating === 0 ? 'Not rated' : `${rating} star${rating !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted successfully. We appreciate you taking the time to help us improve our care services.
          </p>
          <button
            onClick={() => window.close()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close Survey
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Family Satisfaction Survey</h1>
              <p className="text-gray-600">Help us improve our care services</p>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-red-500" />
              <span className="text-sm text-gray-500">VERON Care</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Step 1: Overall Ratings */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Overall Care Experience</h2>
              <p className="text-gray-600 mb-8">
                Please rate your overall satisfaction with our care services on a scale of 1 to 5 stars.
              </p>

              <StarRating
                rating={formData.overallSatisfaction}
                onRatingChange={(rating) => handleRatingChange('overallSatisfaction', rating)}
                label="Overall satisfaction with care services"
                required
              />

              <StarRating
                rating={formData.careQuality}
                onRatingChange={(rating) => handleRatingChange('careQuality', rating)}
                label="Quality of care provided"
                required
              />

              <StarRating
                rating={formData.communicationRating}
                onRatingChange={(rating) => handleRatingChange('communicationRating', rating)}
                label="Communication with care team"
                required
              />
            </div>
          )}

          {/* Step 2: Staff and Service Ratings */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Staff and Service Quality</h2>
              <p className="text-gray-600 mb-8">
                Please rate the professionalism of our staff and response times.
              </p>

              <StarRating
                rating={formData.staffProfessionalism}
                onRatingChange={(rating) => handleRatingChange('staffProfessionalism', rating)}
                label="Staff professionalism and competence"
                required
              />

              <StarRating
                rating={formData.responseTime}
                onRatingChange={(rating) => handleRatingChange('responseTime', rating)}
                label="Response time to requests and concerns"
                required
              />

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Would you recommend our services to other families?
                </label>
                <div className="space-y-2">
                  {['Yes, definitely', 'Yes, probably', 'Not sure', 'Probably not', 'Definitely not'].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="wouldRecommend"
                        value={option}
                        checked={formData.wouldRecommend === option}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <StarRating
                rating={formData.likelihood}
                onRatingChange={(rating) => handleRatingChange('likelihood', rating)}
                label="How likely are you to recommend us? (1 = Very unlikely, 5 = Very likely)"
              />
            </div>
          )}

          {/* Step 3: Written Feedback */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Feedback</h2>
              <p className="text-gray-600 mb-8">
                Please share your thoughts to help us understand what we're doing well and where we can improve.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What are you most satisfied with about our care services?
                </label>
                <textarea
                  name="mostSatisfiedWith"
                  value={formData.mostSatisfiedWith}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us what we're doing well..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What areas do you think we could improve?
                </label>
                <textarea
                  name="improvementAreas"
                  value={formData.improvementAreas}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Help us understand how we can serve you better..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Any additional comments or suggestions?
                </label>
                <textarea
                  name="additionalComments"
                  value={formData.additionalComments}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Share any other thoughts you'd like us to know..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Follow-up Preferences */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Follow-up Preferences</h2>
              <p className="text-gray-600 mb-8">
                Let us know if you'd like us to follow up on your feedback.
              </p>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="followUpPreferred"
                    checked={formData.followUpPreferred}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">
                    I would like someone to follow up with me about my feedback
                  </span>
                </label>
              </div>

              {formData.followUpPreferred && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred contact method:
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'email', label: 'Email' },
                      { value: 'phone', label: 'Phone call' },
                      { value: 'text', label: 'Text message' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="contactMethod"
                          value={option.value}
                          checked={formData.contactMethod === option.value}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">Survey Summary</h3>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>Overall Satisfaction: {formData.overallSatisfaction}/5 stars</p>
                      <p>Would Recommend: {formData.wouldRecommend || 'Not specified'}</p>
                      <p>Follow-up Requested: {formData.followUpPreferred ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>Next</span>
                <MessageCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Survey</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilySatisfactionSurvey;
