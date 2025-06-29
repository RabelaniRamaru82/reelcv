import React, { useState } from 'react';
import { X, Play, Brain, Loader, CheckCircle, AlertCircle } from 'lucide-react';
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
    const request: AIAnalysisRequest = {
      videoUrl: video.url || `https://example.com/videos/${video.id}.mp4`,
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
      await analyzeVideo(request);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const parseDuration = (duration: string): number => {
    const parts = duration.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <Brain size={24} className="mr-2" />
            AI Video Analysis
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
              </div>
            </div>
          </div>

          {!isAnalyzing && !results && !error && (
            <>
              {/* Analysis Options */}
              <div className={styles.analysisOptions}>
                <h4 className={styles.sectionTitle}>Analysis Options</h4>
                
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
                    Analyze communication style, work preferences, and personality traits
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
                    Compare skills and performance against industry standards
                  </p>
                </div>

                <div className={styles.optionGroup}>
                  <label className={styles.label}>Focus Areas</label>
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
              </div>

              <div className={styles.modalActions}>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleStartAnalysis} className={styles.analyzeButton}>
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
                <h4>Analyzing Video...</h4>
              </div>
              
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              
              <p className={styles.progressText}>{currentStep}</p>
              <p className={styles.progressPercent}>{analysisProgress}% Complete</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={styles.errorState}>
              <AlertCircle size={48} className={styles.errorIcon} />
              <h4>Analysis Failed</h4>
              <p>{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}

          {/* Results Preview */}
          {results && (
            <div className={styles.resultsPreview}>
              <div className={styles.successHeader}>
                <CheckCircle size={24} className={styles.successIcon} />
                <h4>Analysis Complete!</h4>
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
                <h5>Key Insights</h5>
                <ul>
                  {results.technicalSkills.slice(0, 3).map((skill, index) => (
                    <li key={index}>
                      <strong>{skill.skill}</strong>: {skill.traits.proficiency} level with {skill.confidence}% confidence
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.modalActions}>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={() => {/* Navigate to detailed results */}}>
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