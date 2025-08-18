import React, { useState, useEffect } from 'react';
import { Clock, Heart, Camera, MessageCircle, Phone, Shield, Star, User, Activity, Pill, AlertTriangle, Bell, Send, Download, Eye, CheckCircle } from 'lucide-react';
import { familyPortalAPI } from '../../services/api';

const FamilyDashboard = () => {
  const [activeTab, setActiveTab] = useState('updates');
  const [careUpdates, setCareUpdates] = useState([]);
  const [messages, setMessages] = useState([]);
  const [carePhotos, setCarePhotos] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState('');

  // Mock customer ID - in real app, this would come from auth context
  const customerId = "cust_001";

  useEffect(() => {
    loadFamilyPortalData();
  }, []);

  const loadFamilyPortalData = async () => {
    try {
      setLoading(true);
      const [updatesRes, messagesRes, photosRes, contactsRes, membersRes] = await Promise.all([
        familyPortalAPI.getCareUpdates(customerId),
        familyPortalAPI.getMessages(customerId),
        familyPortalAPI.getCarePhotos(customerId),
        familyPortalAPI.getEmergencyContacts(customerId),
        familyPortalAPI.getFamilyMembers(customerId)
      ]);

      setCareUpdates(updatesRes.data);
      setMessages(messagesRes.data);
      setCarePhotos(photosRes.data);
      setEmergencyContacts(contactsRes.data);
      setFamilyMembers(membersRes.data);
    } catch (error) {
      console.error('Error loading family portal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    try {
      const messageData = {
        customerId,
        recipientId: selectedContact,
        subject: "Family Message",
        message: newMessage,
        senderType: "family"
      };

      await familyPortalAPI.sendMessage(messageData);
      setNewMessage('');
      // Reload messages
      const messagesRes = await familyPortalAPI.getMessages(customerId);
      setMessages(messagesRes.data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getUpdateIcon = (type) => {
    switch (type) {
      case 'care_note': return <Heart className="w-5 h-5 text-blue-500" />;
      case 'medication': return <Pill className="w-5 h-5 text-green-500" />;
      case 'emergency': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'vitals': return <Activity className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading family portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Family Portal</h1>
              <p className="text-gray-600">Stay connected with your loved one's care</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-400" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {careUpdates.filter(u => !u.isRead).length}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Connected as Family Member</p>
                <p className="text-xs text-gray-500">Last updated: {formatTimeAgo(new Date())}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'updates', label: 'Care Updates', icon: Heart },
              { id: 'photos', label: 'Photos', icon: Camera },
              { id: 'messages', label: 'Messages', icon: MessageCircle },
              { id: 'contacts', label: 'Emergency Contacts', icon: Phone }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'updates' && careUpdates.filter(u => !u.isRead).length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {careUpdates.filter(u => !u.isRead).length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Care Updates Tab */}
        {activeTab === 'updates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Care Updates</h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Mark all as read
              </button>
            </div>

            <div className="space-y-4">
              {careUpdates.map(update => (
                <div key={update.id} className={`bg-white rounded-lg shadow-sm border ${!update.isRead ? 'border-l-4 border-l-blue-500' : 'border-gray-200'} p-6`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {getUpdateIcon(update.updateType)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{update.title}</h3>
                          {!update.isRead && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">New</span>
                          )}
                          {update.severity && (
                            <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(update.severity)}`}>
                              {update.severity}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{update.message}</p>
                        
                        {/* Vitals Display */}
                        {update.vitals && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <h4 className="font-medium text-gray-900 mb-2">Vital Signs</h4>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Blood Pressure:</span>
                                <span className="ml-2 font-medium">{update.vitals.bloodPressure}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Heart Rate:</span>
                                <span className="ml-2 font-medium">{update.vitals.heartRate} bpm</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Temperature:</span>
                                <span className="ml-2 font-medium">{update.vitals.temperature}°F</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Medications Display */}
                        {update.medications && (
                          <div className="bg-green-50 rounded-lg p-3 mb-3">
                            <h4 className="font-medium text-gray-900 mb-2">Medications Administered</h4>
                            <div className="space-y-2">
                              {update.medications.map((med, index) => (
                                <div key={index} className="flex items-center space-x-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="font-medium">{med.name}</span>
                                  <span className="text-gray-500">({med.dosage})</span>
                                  <span className="text-gray-400">at {new Date(med.administeredAt).toLocaleTimeString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Activities and Mood */}
                        {update.activities && (
                          <div className="flex items-center space-x-4 mb-3">
                            <div>
                              <span className="text-gray-500 text-sm">Activities:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {update.activities.map((activity, index) => (
                                  <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                    {activity}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {update.mood && (
                              <div>
                                <span className="text-gray-500 text-sm">Mood:</span>
                                <span className="ml-2 font-medium text-green-600">{update.mood}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Photos */}
                        {update.photos && update.photos.length > 0 && (
                          <div className="mt-3">
                            <h4 className="font-medium text-gray-900 mb-2">Photos</h4>
                            <div className="flex space-x-2">
                              {update.photos.map(photo => (
                                <div key={photo.id} className="relative">
                                  <img
                                    src={photo.url}
                                    alt={photo.caption}
                                    className="w-20 h-20 object-cover rounded-lg"
                                    onError={(e) => {
                                      e.target.src = '/api/placeholder/80/80?text=Photo';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                    <Eye className="w-4 h-4 text-white opacity-0 hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{formatTimeAgo(update.timestamp)}</p>
                      <p className="text-xs">by {update.caregiverName}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Care Photos</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Download All</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {carePhotos.map(photo => (
                <div key={photo.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/400/300?text=Care+Photo';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-gray-900 mb-2">{photo.caption}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>by {photo.caregiverName}</span>
                      <span>{formatTimeAgo(photo.uploadedAt)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {photo.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Messages</h2>

            {/* Send Message Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Send a Message</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send to:
                  </label>
                  <select
                    value={selectedContact}
                    onChange={(e) => setSelectedContact(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select recipient...</option>
                    <option value="caregiver_primary">Primary Caregiver</option>
                    <option value="care_coordinator">Care Coordinator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message:
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Type your message here..."
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || !selectedContact}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </div>
            </div>

            {/* Message History */}
            <div className="space-y-4">
              {messages.map(message => (
                <div key={message.id} className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${!message.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{message.subject}</h3>
                      <p className="text-sm text-gray-500">
                        {message.senderType === 'family' ? 'You' : message.senderName} → {message.recipientName}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{formatTimeAgo(message.timestamp)}</p>
                      {!message.isRead && (
                        <span className="text-blue-600 font-medium">Unread</span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700">{message.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Emergency Contacts</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {emergencyContacts.map(contact => (
                <div key={contact.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-full ${contact.is_primary ? 'bg-red-100' : 'bg-gray-100'}`}>
                        {contact.is_primary ? (
                          <Shield className="w-6 h-6 text-red-600" />
                        ) : (
                          <User className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                          {contact.is_primary && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Primary</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{contact.relationship}</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{contact.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MessageCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{contact.email}</span>
                          </div>
                        </div>
                        {contact.lastContactedAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Last contacted: {formatTimeAgo(contact.lastContactedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800">
                      <Phone className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Family Members */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Members</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {familyMembers.map(member => (
                  <div key={member.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.relationship}</p>
                        <p className="text-xs text-gray-500">Last login: {formatTimeAgo(member.last_login_at)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {member.is_primary_contact && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                        <div className={`w-3 h-3 rounded-full ${member.last_login_at ? 'bg-green-500' : 'bg-gray-300'}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyDashboard;
