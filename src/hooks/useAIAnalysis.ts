import { useState, useCallback } from 'react';
import { awsBedrockService } from '../services/aws-bedrock';
import { AIAnalysisRequest, VideoAnalysisResult } from '../types/ai-analysis';
import { getSupabaseClient } from './useAuth';

interface AIAnalysisState {
  isAnalyzing: boolean;
  analysisProgress: number;
  currentStep: string;
  error: string | null;
  results: VideoAnalysisResult | null;
}

export const useAIAnalysis = () => {
  const [state, setState] = useState<AIAnalysisState>({
    isAnalyzing: false,
    analysisProgress: 0,
    currentStep: '',
    error: null,
    results: null,
  });

  const analyzeVideo = useCallback(async (request: AIAnalysisRequest): Promise<VideoAnalysisResult> => {
    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      analysisProgress: 0,
      currentStep: 'Initializing analysis...',
      error: null,
      results: null,
    }));

    try {
      // Step 1: Validate request
      setState(prev => ({ ...prev, analysisProgress: 10, currentStep: 'Validating video...' }));
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Upload to S3
      setState(prev => ({ ...prev, analysisProgress: 25, currentStep: 'Uploading video to cloud...' }));
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Transcribe audio
      setState(prev => ({ ...prev, analysisProgress: 40, currentStep: 'Transcribing audio...' }));
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 4: AI analysis
      setState(prev => ({ ...prev, analysisProgress: 60, currentStep: 'Analyzing content with AI...' }));
      const results = await awsBedrockService.analyzeVideo(request);

      // Step 5: Save results
      setState(prev => ({ ...prev, analysisProgress: 80, currentStep: 'Saving analysis results...' }));
      await saveAnalysisResults(results);

      // Step 6: Complete
      setState(prev => ({ 
        ...prev, 
        analysisProgress: 100, 
        currentStep: 'Analysis complete!',
        isAnalyzing: false,
        results 
      }));

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage,
        currentStep: 'Analysis failed',
      }));
      throw error;
    }
  }, []);

  const saveAnalysisResults = async (results: VideoAnalysisResult) => {
    try {
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('video_analyses')
        .insert({
          id: results.id,
          video_id: results.videoId,
          analysis_data: results,
          skills_detected: results.technicalSkills,
          traits_assessment: results.technicalSkills.map(skill => skill.traits),
          confidence_scores: results.categoryScores,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to save analysis results:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error saving analysis:', error);
      throw error;
    }
  };

  const getAnalysisHistory = useCallback(async (candidateId: string): Promise<VideoAnalysisResult[]> => {
    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('video_analyses')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(row => row.analysis_data) || [];
    } catch (error) {
      console.error('Failed to fetch analysis history:', error);
      return [];
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setState({
      isAnalyzing: false,
      analysisProgress: 0,
      currentStep: '',
      error: null,
      results: null,
    });
  }, []);

  return {
    ...state,
    analyzeVideo,
    getAnalysisHistory,
    clearAnalysis,
  };
};