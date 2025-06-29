import React from 'react';
import { VideoAnalysisResult } from '../../types/ai-analysis';
import { Card } from '../ui/Card';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Star, 
  Award, 
  Users, 
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import styles from './DetailedReport.module.css';

interface DetailedReportProps {
  analysis: VideoAnalysisResult;
}

export const DetailedReport: React.FC<DetailedReportProps> = ({ analysis }) => {
  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return '#10b981';
      case 'advanced': return '#3b82f6';
      case 'intermediate': return '#f59e0b';
      case 'beginner': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className={styles.reportContainer}>
      {/* Header */}
      <div className={styles.reportHeader}>
        <h1 className={styles.reportTitle}>
          <Brain size={32} className="mr-3" />
          AI Video Analysis Report
        </h1>
        <div className={styles.reportMeta}>
          <span>Analysis Date: {new Date(analysis.analysisDate).toLocaleDateString()}</span>
          <span>Processing Time: {analysis.processingTime}s</span>
        </div>
      </div>

      {/* Overall Scores */}
      <Card className={styles.scoresCard}>
        <h2 className={styles.sectionTitle}>Overall Performance</h2>
        <div className={styles.scoresGrid}>
          <div className={styles.mainScore}>
            <div 
              className={styles.scoreCircle}
              style={{ '--score': analysis.overallScore, '--color': getScoreColor(analysis.overallScore) } as any}
            >
              <span className={styles.scoreValue}>{analysis.overallScore}</span>
              <span className={styles.scoreLabel}>Overall</span>
            </div>
          </div>
          <div className={styles.categoryScores}>
            {Object.entries(analysis.categoryScores).map(([category, score]) => (
              <div key={category} className={styles.categoryScore}>
                <div className={styles.categoryName}>{category}</div>
                <div className={styles.scoreBar}>
                  <div 
                    className={styles.scoreBarFill}
                    style={{ 
                      width: `${score}%`,
                      backgroundColor: getScoreColor(score)
                    }}
                  />
                </div>
                <div className={styles.scoreNumber}>{score}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Technical Skills Analysis */}
      <Card className={styles.skillsCard}>
        <h2 className={styles.sectionTitle}>
          <Target size={24} className="mr-2" />
          Technical Skills Analysis
        </h2>
        <div className={styles.skillsGrid}>
          {analysis.technicalSkills.map((skill, index) => (
            <div key={index} className={styles.skillCard}>
              <div className={styles.skillHeader}>
                <h3 className={styles.skillName}>{skill.skill}</h3>
                <span 
                  className={styles.skillLevel}
                  style={{ backgroundColor: getSkillLevelColor(skill.traits.proficiency) }}
                >
                  {skill.traits.proficiency}
                </span>
              </div>
              
              <div className={styles.skillMetrics}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Confidence</span>
                  <div className={styles.metricBar}>
                    <div 
                      className={styles.metricBarFill}
                      style={{ width: `${skill.confidence}%` }}
                    />
                  </div>
                  <span className={styles.metricValue}>{skill.confidence}%</span>
                </div>
                
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Practical Application</span>
                  <div className={styles.metricBar}>
                    <div 
                      className={styles.metricBarFill}
                      style={{ width: `${skill.traits.practicalApplication}%` }}
                    />
                  </div>
                  <span className={styles.metricValue}>{skill.traits.practicalApplication}%</span>
                </div>
                
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Communication Clarity</span>
                  <div className={styles.metricBar}>
                    <div 
                      className={styles.metricBarFill}
                      style={{ width: `${skill.traits.communicationClarity}%` }}
                    />
                  </div>
                  <span className={styles.metricValue}>{skill.traits.communicationClarity}%</span>
                </div>
              </div>

              <div className={styles.skillEvidence}>
                <h4>Evidence Found:</h4>
                <ul>
                  {skill.evidence.map((evidence, idx) => (
                    <li key={idx}>{evidence}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Soft Skills Analysis */}
      <Card className={styles.softSkillsCard}>
        <h2 className={styles.sectionTitle}>
          <Users size={24} className="mr-2" />
          Soft Skills & Communication
        </h2>
        <div className={styles.softSkillsGrid}>
          <div className={styles.softSkillCategory}>
            <h3>Communication</h3>
            {Object.entries(analysis.softSkills.communication).map(([skill, score]) => (
              <div key={skill} className={styles.softSkillItem}>
                <span className={styles.softSkillName}>{skill}</span>
                <div className={styles.softSkillBar}>
                  <div 
                    className={styles.softSkillBarFill}
                    style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }}
                  />
                </div>
                <span className={styles.softSkillScore}>{score}</span>
              </div>
            ))}
          </div>

          <div className={styles.softSkillCategory}>
            <h3>Leadership</h3>
            {Object.entries(analysis.softSkills.leadership).map(([skill, score]) => (
              <div key={skill} className={styles.softSkillItem}>
                <span className={styles.softSkillName}>{skill}</span>
                <div className={styles.softSkillBar}>
                  <div 
                    className={styles.softSkillBarFill}
                    style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }}
                  />
                </div>
                <span className={styles.softSkillScore}>{score}</span>
              </div>
            ))}
          </div>

          <div className={styles.softSkillCategory}>
            <h3>Problem Solving</h3>
            {Object.entries(analysis.softSkills.problemSolving).map(([skill, score]) => (
              <div key={skill} className={styles.softSkillItem}>
                <span className={styles.softSkillName}>{skill}</span>
                <div className={styles.softSkillBar}>
                  <div 
                    className={styles.softSkillBarFill}
                    style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }}
                  />
                </div>
                <span className={styles.softSkillScore}>{score}</span>
              </div>
            ))}
          </div>

          <div className={styles.softSkillCategory}>
            <h3>Professionalism</h3>
            {Object.entries(analysis.softSkills.professionalism).map(([skill, score]) => (
              <div key={skill} className={styles.softSkillItem}>
                <span className={styles.softSkillName}>{skill}</span>
                <div className={styles.softSkillBar}>
                  <div 
                    className={styles.softSkillBarFill}
                    style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }}
                  />
                </div>
                <span className={styles.softSkillScore}>{score}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Personality Insights */}
      <Card className={styles.personalityCard}>
        <h2 className={styles.sectionTitle}>
          <Brain size={24} className="mr-2" />
          Personality Insights
        </h2>
        <div className={styles.personalityGrid}>
          <div className={styles.personalityTraits}>
            <h3>Big Five Personality Traits</h3>
            {Object.entries(analysis.personalityInsights.traits).map(([trait, score]) => (
              <div key={trait} className={styles.personalityTrait}>
                <span className={styles.traitName}>{trait}</span>
                <div className={styles.traitBar}>
                  <div 
                    className={styles.traitBarFill}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className={styles.traitScore}>{score}</span>
              </div>
            ))}
          </div>

          <div className={styles.workStyle}>
            <h3>Work Style Preferences</h3>
            {Object.entries(analysis.personalityInsights.workStyle).map(([style, score]) => (
              <div key={style} className={styles.workStyleItem}>
                <span className={styles.workStyleName}>{style}</span>
                <div className={styles.workStyleBar}>
                  <div 
                    className={styles.workStyleBarFill}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className={styles.workStyleScore}>{score}</span>
              </div>
            ))}
          </div>

          <div className={styles.motivators}>
            <h3>Key Motivators</h3>
            <div className={styles.motivatorsList}>
              {analysis.personalityInsights.motivators.map((motivator, index) => (
                <span key={index} className={styles.motivatorTag}>
                  {motivator}
                </span>
              ))}
            </div>
            <div className={styles.communicationStyle}>
              <strong>Communication Style:</strong> {analysis.personalityInsights.communicationStyle}
            </div>
          </div>
        </div>
      </Card>

      {/* Industry Benchmarking */}
      <Card className={styles.benchmarkCard}>
        <h2 className={styles.sectionTitle}>
          <BarChart3 size={24} className="mr-2" />
          Industry Benchmarking
        </h2>
        <div className={styles.benchmarkGrid}>
          <div className={styles.benchmarkStat}>
            <div className={styles.benchmarkValue}>{analysis.industryBenchmark.percentile}th</div>
            <div className={styles.benchmarkLabel}>Percentile</div>
          </div>
          <div className={styles.benchmarkStat}>
            <div className={styles.benchmarkValue}>{analysis.industryBenchmark.similarProfiles}</div>
            <div className={styles.benchmarkLabel}>Similar Profiles</div>
          </div>
          <div className={styles.topSkills}>
            <h3>Top Skills in Industry</h3>
            <div className={styles.skillTags}>
              {analysis.industryBenchmark.topSkills.map((skill, index) => (
                <span key={index} className={styles.skillTag}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.improvementAreas}>
            <h3>Common Improvement Areas</h3>
            <div className={styles.improvementTags}>
              {analysis.industryBenchmark.improvementAreas.map((area, index) => (
                <span key={index} className={styles.improvementTag}>
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* AI Recommendations */}
      <Card className={styles.recommendationsCard}>
        <h2 className={styles.sectionTitle}>
          <Lightbulb size={24} className="mr-2" />
          AI Recommendations
        </h2>
        <div className={styles.recommendationsGrid}>
          {analysis.recommendations.map((rec, index) => (
            <div key={index} className={`${styles.recommendationCard} ${styles[`priority-${rec.priority}`]}`}>
              <div className={styles.recommendationHeader}>
                <div className={styles.recommendationType}>
                  {rec.type === 'content' && <Star size={16} />}
                  {rec.type === 'technical' && <Target size={16} />}
                  {rec.type === 'presentation' && <Users size={16} />}
                  {rec.type === 'career' && <TrendingUp size={16} />}
                  <span>{rec.type}</span>
                </div>
                <span className={`${styles.priorityBadge} ${styles[`priority-${rec.priority}`]}`}>
                  {rec.priority} priority
                </span>
              </div>
              <h3 className={styles.recommendationTitle}>{rec.title}</h3>
              <p className={styles.recommendationDescription}>{rec.description}</p>
              <div className={styles.actionItems}>
                <h4>Action Items:</h4>
                <ul>
                  {rec.actionItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};