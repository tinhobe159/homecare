import React, { useState, useEffect } from 'react';
import { FileText, Mic, MicOff, Brain, CheckCircle, AlertTriangle, TrendingUp, Eye, Download, Share, MessageSquare, Sparkles, Zap, Search } from 'lucide-react';
import { documentationAI } from '../../services/aiServices';

const AIDocumentationAssistant = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState('');
  const [generatedNotes, setGeneratedNotes] = useState(null);
  const [documentAnalysis, setDocumentAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  // Sample input text for demonstration
  const sampleInput = `Visit with Mrs. Johnson today went really well. She was alert and in good spirits throughout the visit. We completed her morning personal care routine - she needed minimal assistance with bathing and was able to dress herself independently. Her blood pressure was 138 over 82, heart rate was 72, and temperature was normal at 98.6. 

She took all her medications as prescribed including the morning blood pressure medication and vitamins. We did a 15-minute walk around the house and she showed good balance, much better than last week. I helped her prepare lunch and she had a good appetite.

I did notice some mild swelling in her ankles which wasn't there before, so I elevated her legs during rest time. She mentioned feeling more tired in the afternoons lately. Overall she's doing very well and was happy with the care provided today.`;

  useEffect(() => {
    loadDocumentAnalysis();
  }, [selectedTimeframe]);

  const loadDocumentAnalysis = async () => {
    setLoading(true);
    try {
      const analysis = await documentationAI.analyzeDocumentation([], selectedTimeframe);
      setDocumentAnalysis(analysis.data);
    } catch (error) {
      console.error('Error loading document analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNotes = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    try {
      const result = await documentationAI.generateCareNotes(inputText, {});
      setGeneratedNotes(result.data);
    } catch (error) {
      console.error('Error generating notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseSample = () => {
    setInputText(sampleInput);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // In a real implementation, this would start speech recognition
    setTimeout(() => {
      setIsRecording(false);
      setInputText(sampleInput);
    }, 3000);
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment === 'positive') return 'text-green-600 bg-green-50';
    if (sentiment === 'negative') return 'text-red-600 bg-red-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const tabs = [
    { id: 'generate', label: 'Generate Notes', icon: FileText },
    { id: 'analyze', label: 'Document Analysis', icon: TrendingUp },
    { id: 'insights', label: 'AI Insights', icon: Brain }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Brain className="w-8 h-8 text-purple-600 mr-3" />
                AI Documentation Assistant
              </h1>
              <p className="text-gray-600">Natural language processing for intelligent care documentation</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <Share className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Generate Notes Tab */}
            {activeTab === 'generate' && (
              <div className="space-y-6">
                {/* Input Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Voice or Text Input</h3>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleUseSample}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Use Sample Text
                      </button>
                      <button
                        onClick={handleStartRecording}
                        disabled={isRecording}
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                          isRecording
                            ? 'bg-red-100 text-red-600'
                            : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                        }`}
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="w-4 h-4 mr-2" />
                            Recording...
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4 mr-2" />
                            Start Recording
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Describe the care visit in your own words, or use voice recording..."
                    rows={8}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-purple-500 focus:border-purple-500"
                  />
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      {inputText.length} characters • AI will structure and enhance your notes
                    </div>
                    <button
                      onClick={handleGenerateNotes}
                      disabled={!inputText.trim() || loading}
                      className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate AI Notes
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Generated Notes */}
                {generatedNotes && (
                  <div className="space-y-6">
                    {/* Quality Score */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">AI Processing Results</h3>
                        <div className="flex items-center space-x-4">
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                            Quality Score: {Math.round(generatedNotes.qualityScore * 100)}%
                          </span>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className={`p-3 rounded-lg ${generatedNotes.completenessCheck.hasVitals ? 'bg-green-50' : 'bg-red-50'}`}>
                          <div className="flex items-center">
                            {generatedNotes.completenessCheck.hasVitals ? 
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" /> :
                              <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                            }
                            <span className="text-sm font-medium">Vitals</span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-lg ${generatedNotes.completenessCheck.hasActivities ? 'bg-green-50' : 'bg-red-50'}`}>
                          <div className="flex items-center">
                            {generatedNotes.completenessCheck.hasActivities ? 
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" /> :
                              <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                            }
                            <span className="text-sm font-medium">Activities</span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-lg ${generatedNotes.completenessCheck.hasConcerns ? 'bg-green-50' : 'bg-red-50'}`}>
                          <div className="flex items-center">
                            {generatedNotes.completenessCheck.hasConcerns ? 
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" /> :
                              <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                            }
                            <span className="text-sm font-medium">Concerns</span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-lg ${generatedNotes.completenessCheck.hasRecommendations ? 'bg-green-50' : 'bg-red-50'}`}>
                          <div className="flex items-center">
                            {generatedNotes.completenessCheck.hasRecommendations ? 
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" /> :
                              <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                            }
                            <span className="text-sm font-medium">Recommendations</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Structured Notes */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column - Structured Data */}
                      <div className="space-y-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Client Condition
                          </h4>
                          <p className="text-gray-700">{generatedNotes.processedNotes.structured.clientCondition}</p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Activities Completed</h4>
                          <ul className="space-y-2">
                            {generatedNotes.processedNotes.structured.activitiesCompleted.map((activity, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-gray-700 text-sm">{activity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Vital Signs</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-600">Blood Pressure:</span>
                              <p className="text-gray-900">{generatedNotes.processedNotes.structured.vitalSigns.bloodPressure}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Heart Rate:</span>
                              <p className="text-gray-900">{generatedNotes.processedNotes.structured.vitalSigns.heartRate}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Temperature:</span>
                              <p className="text-gray-900">{generatedNotes.processedNotes.structured.vitalSigns.temperature}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-3">{generatedNotes.processedNotes.structured.vitalSigns.notes}</p>
                        </div>
                      </div>

                      {/* Right Column - Concerns & Recommendations */}
                      <div className="space-y-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                            Concerns Noted
                          </h4>
                          <ul className="space-y-2">
                            {generatedNotes.processedNotes.structured.concerns.map((concern, index) => (
                              <li key={index} className="flex items-start">
                                <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5" />
                                <span className="text-gray-700 text-sm">{concern}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Recommendations</h4>
                          <ul className="space-y-2">
                            {generatedNotes.processedNotes.structured.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start">
                                <TrendingUp className="w-4 h-4 text-blue-500 mr-2 mt-0.5" />
                                <span className="text-gray-700 text-sm">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Key Metrics</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-600">Duration:</span>
                              <p className="text-gray-900">{generatedNotes.processedNotes.keyMetrics.duration}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Satisfaction:</span>
                              <p className="text-gray-900">{generatedNotes.processedNotes.keyMetrics.clientSatisfaction}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Goal Progress:</span>
                              <p className="text-gray-900">{generatedNotes.processedNotes.keyMetrics.goalProgress}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Narrative Summary */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">AI-Generated Narrative Summary</h4>
                      <p className="text-gray-700 leading-relaxed">{generatedNotes.processedNotes.narrative}</p>
                    </div>

                    {/* Suggested Improvements */}
                    {generatedNotes.suggestedImprovements.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Zap className="w-4 h-4 mr-2 text-blue-500" />
                          AI Suggestions for Next Time
                        </h4>
                        <ul className="space-y-2">
                          {generatedNotes.suggestedImprovements.map((suggestion, index) => (
                            <li key={index} className="flex items-start">
                              <Sparkles className="w-4 h-4 text-blue-500 mr-2 mt-0.5" />
                              <span className="text-blue-800 text-sm">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Document Analysis Tab */}
            {activeTab === 'analyze' && (
              <div className="space-y-6">
                {/* Timeframe Selector */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Document Analysis & Insights</h3>
                  <select
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-gray-600">Analyzing documentation patterns...</span>
                  </div>
                ) : documentAnalysis ? (
                  <div className="space-y-6">
                    {/* Sentiment Analysis */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Sentiment Analysis</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className={`text-2xl font-bold mb-2 ${getSentimentColor(documentAnalysis.sentimentAnalysis.overall)}`}>
                            {documentAnalysis.sentimentAnalysis.overall.toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-600">Overall Sentiment</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-2">
                            {Math.round(documentAnalysis.sentimentAnalysis.caregiverSentiment * 100)}%
                          </div>
                          <div className="text-sm text-gray-600">Caregiver Sentiment</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 mb-2">
                            {Math.round(documentAnalysis.sentimentAnalysis.clientSatisfaction * 100)}%
                          </div>
                          <div className="text-sm text-gray-600">Client Satisfaction</div>
                        </div>
                      </div>
                    </div>

                    {/* Key Topics */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Most Discussed Topics</h4>
                      <div className="space-y-3">
                        {documentAnalysis.keyTopics.map((topic, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <span className="font-medium text-gray-900 capitalize">
                                {topic.topic.replace(/_/g, ' ')}
                              </span>
                              <span className={`ml-3 px-2 py-1 rounded-full text-xs ${getSentimentColor(topic.sentiment)}`}>
                                {topic.sentiment}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm text-gray-600 mr-3">{topic.frequency} mentions</span>
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{ width: `${(topic.frequency / 50) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Patterns */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">AI-Detected Patterns</h4>
                      <div className="space-y-4">
                        {documentAnalysis.patterns.map((pattern, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <h5 className="font-medium text-gray-900 capitalize">
                                {pattern.pattern.replace(/_/g, ' ')}
                              </h5>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                {Math.round(pattern.confidence * 100)}% confidence
                              </span>
                            </div>
                            <p className="text-gray-700 mb-2">{pattern.description}</p>
                            <p className="text-sm text-gray-600">
                              <strong>Supporting Data:</strong> {pattern.supportingData}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actionable Items */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-blue-500" />
                        AI-Recommended Actions
                      </h4>
                      <ul className="space-y-2">
                        {documentAnalysis.actionableItems.map((item, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-blue-500 mr-3" />
                            <span className="text-blue-800">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* AI Insights Tab */}
            {activeTab === 'insights' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-8 border border-purple-200">
                  <div className="text-center">
                    <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Documentation Insights</h3>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      Our natural language processing AI continuously learns from documentation patterns to improve 
                      care quality, identify trends, and enhance communication between caregivers, clients, and families.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h4 className="font-semibold text-gray-900 mb-2">Smart Documentation</h4>
                    <p className="text-gray-600 text-sm">
                      AI converts natural speech and text into structured, compliant care documentation automatically.
                    </p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h4 className="font-semibold text-gray-900 mb-2">Pattern Recognition</h4>
                    <p className="text-gray-600 text-sm">
                      Identifies trends and patterns in care documentation to improve outcomes and prevent issues.
                    </p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <h4 className="font-semibold text-gray-900 mb-2">Quality Enhancement</h4>
                    <p className="text-gray-600 text-sm">
                      Suggests improvements and ensures documentation completeness for regulatory compliance.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDocumentationAssistant;
