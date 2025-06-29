import React, { useState } from 'react';
import { X, Play, Brain, Loader, CheckCircle, AlertCircle, Upload, Cloud } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAIAnalysis } from '../../hooks/useAIAnalysis';
import { AIAnalysisRequest } from '../../types/ai-analysis';
import styles from './AnalysisModal.module.css';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    category: 'introduction' | 'skills' | 'project' | 'testimonial';
    duration: string;
    url?: string;
  };
  candidateId: string;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  onClose,
  video,
  candidateId
}) => {
  const { isAnalyzing, analysisProgress, currentStep, error, results, analyzeVideo } = useAIAnalysis();
  const [analysisOptions, setAnalysisOptions] = useState({
    includePersonality: true,
    includeBenchmarking: true,
    focusAreas: ['technical-skills', 'communication', 'presentation'],
    industryContext: 'software-development'
  });

  if (!isOpen) return null;

  const handleStartAnalysis = async () => {
    if (!video.url) {
      alert('Video URL is required for analysis. Please ensure the video is properly uploaded.');
      return;
    }

    const request: AIAnalysisRequest = {
      videoUrl: video.url,
      videoMetadata: {
        title: video.title,
        description: video.description,
        category: video.category,
        duration: parseDuration(video.duration),
        candidateId,
      },
      analysisOptions,
    };

    try {
      console.log('Starting AI analysis with AWS Bedrock...', request);
      await analyzeVideo(request);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const parseDuration = (duration: string): number => {
    const parts = duration.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <Brain size={24} className="mr-2" />
            AI Video Analysis with AWS Bedrock
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalContent}>
          {/* Video Preview */}
          <div className={styles.videoPreview}>
            <img src={video.thumbnail} alt={video.title} className={styles.thumbnail} />
            <div className={styles.videoInfo}>
              <h3 className={styles.videoTitle}>{video.title}</h3>
              <p className={styles.videoDescription}>{video.description}</p>
              <div className={styles.videoMeta}>
                <span className={styles.category}>{video.category}</span>
                <span className={styles.duration}>{video.duration}</span>
                {video.url && (
                  <span className="flex items-center gap-1 text-green-400">
                    <Cloud size={12} />
                    Ready for analysis
                  </span>
                )}
              </div>
            </div>
          </div>

          {!isAnalyzing && !results && !error && (
            <>
              {/* Analysis Options */}
              <div className={styles.analysisOptions}>
                <h4 className={styles.sectionTitle}>AI Analysis Configuration</h4>
                
                <div className={styles.optionGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={analysisOptions.includePersonality}
                      onChange={(e) => setAnalysisOptions(prev => ({
                        ...prev,
                        includePersonality: e.target.checked
                      }))}
                      className={styles.checkbox}
                    />
                    Include Personality Analysis
                  </label>
                  <p className={styles.optionDescription}>
                    Analyze communication style, work preferences, and personality traits using Claude AI
                  </p>
                </div>

                <div className={styles.optionGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={analysisOptions.includeBenchmarking}
                      onChange={(e) => setAnalysisOptions(prev => ({
                        ...prev,
                        includeBenchmarking: e.target.checked
                      }))}
                      className={styles.checkbox}
                    />
                    Industry Benchmarking
                  </label>
                  <p className={styles.optionDescription}>
                    Compare skills and performance against industry standards and similar profiles
                  </p>
                </div>

                <div className={styles.optionGroup}>
                  <label className={styles.label}>Analysis Focus Areas</label>
                  <div className={styles.focusAreas}>
                    {[
                      { id: 'technical-skills', label: 'Technical Skills' },
                      { id: 'communication', label: 'Communication' },
                      { id: 'presentation', label: 'Presentation' },
                      { id: 'problem-solving', label: 'Problem Solving' },
                      { id: 'leadership', label: 'Leadership' }
                    ].map(area => (
                      <label key={area.id} className={styles.focusAreaLabel}>
                        <input
                          type="checkbox"
                          checked={analysisOptions.focusAreas.includes(area.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAnalysisOptions(prev => ({
                                ...prev,
                                focusAreas: [...prev.focusAreas, area.id]
                              }));
                            } else {
                              setAnalysisOptions(prev => ({
                                ...prev,
                                focusAreas: prev.focusAreas.filter(id => id !== area.id)
                              }));
                            }
                          }}
                          className={styles.checkbox}
                        />
                        {area.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.optionGroup}>
                  <label className={styles.label}>Industry Context</label>
                  <select
                    value={analysisOptions.industryContext}
                    onChange={(e) => setAnalysisOptions(prev => ({
                      ...prev,
                      industryContext: e.target.value
                    }))}
                    className={styles.select}
                  >
                    <option value="software-development">Software Development</option>
                    <option value="data-science">Data Science</option>
                    <option value="product-management">Product Management</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
                  </select>
                </div>

                {/* AWS Services Info */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
                  <h5 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                    <Cloud size={16} />
                    AWS Services Used
                  </h5>
                  <ul className="text-sm text-blue-200 space-y-1">
                    <li>• <strong>S3:</strong> Secure video storage in your reelcv-website-bucket</li>
                    <li>• <strong>Transcribe:</strong> High-accuracy speech-to-text conversion</li>
                    <li>• <strong>Bedrock (Claude):</strong> Advanced AI analysis and insights</li>
                  </ul>
                </div>
              </div>

              <div className={styles.modalActions}>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleStartAnalysis} 
                  className={styles.analyzeButton}
                  disabled={!video.url}
                >
                  <Brain size={16} className="mr-2" />
                  Start AI Analysis
                </Button>
              </div>
            </>
          )}

          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className={styles.analysisProgress}>
              <div className={styles.progressHeader}>
                <Loader size={24} className={styles.spinner} />
                <h4>Analyzing Video with AWS AI...</h4>
              </div>
              
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              
              <p className={styles.progressText}>{currentStep}</p>
              <p className={styles.progressPercent}>{analysisProgress}% Complete</p>
              
              <div className="mt-4 text-sm text-slate-400 space-y-1">
                <p>• Uploading to S3: reelcv-website-bucket (us-west-2)</p>
                <p>• Transcribing with AWS Transcribe</p>
                <p>• Analyzing with Claude via AWS Bedrock</p>
                <p>• Generating insights and recommendations</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={styles.errorState}>
              <AlertCircle size={48} className={styles.errorIcon} />
              <h4>Analysis Failed</h4>
              <p>{error}</p>
              <div className="text-sm text-slate-400 mt-2">
                <p>Please check:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>AWS credentials are configured</li>
                  <li>Video URL is accessible</li>
                  <li>S3 bucket permissions are correct</li>
                </ul>
              </div>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Try Again
              </Button>
            </div>
          )}

          {/* Results Preview */}
          {results && (
            <div className={styles.resultsPreview}>
              <div className={styles.successHeader}>
                <CheckCircle size={24} className={styles.successIcon} />
                <h4>AI Analysis Complete!</h4>
              </div>
              
              <div className={styles.scoreGrid}>
                <div className={styles.scoreCard}>
                  <div className={styles.scoreValue}>{results.overallScore}</div>
                  <div className={styles.scoreLabel}>Overall Score</div>
                </div>
                <div className={styles.scoreCard}>
                  <div className={styles.scoreValue}>{results.categoryScores.technical}</div>
                  <div className={styles.scoreLabel}>Technical</div>
                </div>
                <div className={styles.scoreCard}>
                  <div className={styles.scoreValue}>{results.categoryScores.communication}</div>
                  <div className={styles.scoreLabel}>Communication</div>
                </div>
                <div className={styles.scoreCard}>
                  <div className={styles.scoreValue}>{results.categoryScores.presentation}</div>
                  <div className={styles.scoreLabel}>Presentation</div>
                </div>
              </div>

              <div className={styles.keyInsights}>
                <h5>Key Technical Skills Detected</h5>
                <ul>
                  {results.technicalSkills.slice(0, 3).map((skill, index) => (
                    <li key={index}>
                      <strong>{skill.skill}</strong>: {skill.traits.proficiency} level 
                      ({skill.confidence}% confidence)
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm">
                <p className="text-green-300">
                  ✅ Analysis completed using AWS Bedrock Claude AI
                </p>
                <p className="text-green-200 text-xs mt-1">
                  Processing time: {results.processingTime}s | 
                  Transcript confidence: {Math.round(results.transcript.confidence * 100)}%
                </p>
              </div>

              <div className={styles.modalActions}>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={() => {
                  // Navigate to detailed results - this would be implemented
                  console.log('Navigate to detailed report:', results.id);
                  alert('Detailed report view coming soon!');
                }}>
                  View Detailed Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};