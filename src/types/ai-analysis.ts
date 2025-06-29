export interface SkillTraits {
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  confidence: number; // 0-100
  practicalApplication: number; // 0-100
  theoreticalKnowledge: number; // 0-100
  realWorldExperience: number; // 0-100
  communicationClarity: number; // 0-100
}

export interface TechnicalSkillAnalysis {
  skill: string;
  category: 'programming' | 'framework' | 'tool' | 'methodology' | 'database' | 'cloud';
  confidence: number; // 0-100
  evidence: string[];
  traits: SkillTraits;
  codeQuality?: {
    structure: number;
    bestPractices: number;
    efficiency: number;
    readability: number;
  };
  demonstrationQuality: {
    clarity: number;
    depth: number;
    examples: number;
    problemSolving: number;
  };
}

export interface SoftSkillAnalysis {
  communication: {
    clarity: number;
    confidence: number;
    engagement: number;
    articulation: number;
  };
  leadership: {
    initiative: number;
    decisionMaking: number;
    teamwork: number;
    mentoring: number;
  };
  problemSolving: {
    analyticalThinking: number;
    creativity: number;
    systematicApproach: number;
    adaptability: number;
  };
  professionalism: {
    presentation: number;
    timeManagement: number;
    reliability: number;
    ethics: number;
  };
}

export interface VideoQualityMetrics {
  audioClarity: number; // 0-100
  visualQuality: number; // 0-100
  engagement: number; // 0-100
  pacing: number; // 0-100
  structure: number; // 0-100
  accessibility: {
    hasSubtitles: boolean;
    audioLevel: number;
    visualContrast: number;
  };
}

export interface PersonalityInsights {
  traits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  workStyle: {
    collaborative: number;
    independent: number;
    detailOriented: number;
    bigPicture: number;
  };
  motivators: string[];
  communicationStyle: 'direct' | 'diplomatic' | 'analytical' | 'expressive';
}

export interface VideoAnalysisResult {
  id: string;
  videoId: string;
  analysisDate: string;
  processingTime: number; // seconds
  
  // Core Analysis
  technicalSkills: TechnicalSkillAnalysis[];
  softSkills: SoftSkillAnalysis;
  videoQuality: VideoQualityMetrics;
  personalityInsights: PersonalityInsights;
  
  // Content Analysis
  transcript: {
    text: string;
    confidence: number;
    segments: {
      start: number;
      end: number;
      text: string;
      confidence: number;
    }[];
  };
  
  keyTopics: {
    topic: string;
    relevance: number;
    mentions: number;
    context: string[];
  }[];
  
  // Recommendations
  recommendations: {
    type: 'content' | 'technical' | 'presentation' | 'career';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionItems: string[];
  }[];
  
  // Scoring
  overallScore: number; // 0-100
  categoryScores: {
    technical: number;
    communication: number;
    presentation: number;
    content: number;
  };
  
  // Benchmarking
  industryBenchmark: {
    percentile: number;
    similarProfiles: number;
    topSkills: string[];
    improvementAreas: string[];
  };
}

export interface AIAnalysisRequest {
  videoUrl: string;
  videoMetadata: {
    title: string;
    description: string;
    category: 'introduction' | 'skills' | 'project' | 'testimonial';
    duration: number;
    candidateId: string;
  };
  analysisOptions: {
    includePersonality: boolean;
    includeBenchmarking: boolean;
    focusAreas: string[];
    industryContext?: string;
  };
}

export interface SkillCompetencyFramework {
  skillName: string;
  category: string;
  levels: {
    beginner: {
      description: string;
      indicators: string[];
      typicalExperience: string;
    };
    intermediate: {
      description: string;
      indicators: string[];
      typicalExperience: string;
    };
    advanced: {
      description: string;
      indicators: string[];
      typicalExperience: string;
    };
    expert: {
      description: string;
      indicators: string[];
      typicalExperience: string;
    };
  };
  assessmentCriteria: {
    technical: string[];
    practical: string[];
    communication: string[];
  };
}