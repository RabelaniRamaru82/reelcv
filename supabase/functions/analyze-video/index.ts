import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalysisRequest {
  videoId: string;
  videoUrl: string;
  analysisOptions: {
    includePersonality: boolean;
    includeBenchmarking: boolean;
    focusAreas: string[];
    industryContext?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { videoId, videoUrl, analysisOptions }: AnalysisRequest = await req.json()

    // Create analysis record
    const { data: analysisRecord, error: insertError } = await supabaseClient
      .from('video_analyses')
      .insert({
        video_id: videoId,
        candidate_id: user.id,
        analysis_data: {},
        processing_status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Add to processing queue
    const { error: queueError } = await supabaseClient
      .from('analysis_queue')
      .insert({
        video_analysis_id: analysisRecord.id,
        priority: 5,
        scheduled_for: new Date().toISOString()
      })

    if (queueError) {
      throw queueError
    }

    // In a real implementation, this would trigger the AWS Bedrock analysis
    // For now, we'll simulate the process and update with mock data
    setTimeout(async () => {
      try {
        // Update status to processing
        await supabaseClient
          .from('video_analyses')
          .update({
            processing_status: 'processing',
            processing_started_at: new Date().toISOString()
          })
          .eq('id', analysisRecord.id)

        // Simulate analysis time
        await new Promise(resolve => setTimeout(resolve, 10000))

        // Mock analysis results
        const mockResults = {
          id: `analysis_${Date.now()}`,
          videoId: videoId,
          analysisDate: new Date().toISOString(),
          processingTime: 10,
          transcript: {
            text: "Sample transcript of the video content...",
            confidence: 0.95,
            segments: [
              {
                start: 0,
                end: 30,
                text: "Hello, I'm a software developer with 5 years of experience...",
                confidence: 0.98
              }
            ]
          },
          technicalSkills: [
            {
              skill: 'React',
              category: 'framework',
              confidence: 88,
              evidence: ['Demonstrated component creation', 'Explained hooks usage', 'Showed state management'],
              traits: {
                proficiency: 'advanced',
                confidence: 88,
                practicalApplication: 92,
                theoreticalKnowledge: 85,
                realWorldExperience: 90,
                communicationClarity: 87
              },
              demonstrationQuality: {
                clarity: 90,
                depth: 85,
                examples: 88,
                problemSolving: 82
              }
            },
            {
              skill: 'JavaScript',
              category: 'programming',
              confidence: 92,
              evidence: ['ES6+ syntax usage', 'Async/await demonstration', 'Problem-solving approach'],
              traits: {
                proficiency: 'advanced',
                confidence: 92,
                practicalApplication: 90,
                theoreticalKnowledge: 88,
                realWorldExperience: 94,
                communicationClarity: 89
              },
              demonstrationQuality: {
                clarity: 92,
                depth: 88,
                examples: 90,
                problemSolving: 85
              }
            }
          ],
          softSkills: {
            communication: {
              clarity: 85,
              confidence: 82,
              engagement: 78,
              articulation: 84
            },
            leadership: {
              initiative: 75,
              decisionMaking: 80,
              teamwork: 85,
              mentoring: 72
            },
            problemSolving: {
              analyticalThinking: 88,
              creativity: 76,
              systematicApproach: 85,
              adaptability: 80
            },
            professionalism: {
              presentation: 85,
              timeManagement: 82,
              reliability: 88,
              ethics: 92
            }
          },
          videoQuality: {
            audioClarity: 85,
            visualQuality: 90,
            engagement: 78,
            pacing: 82,
            structure: 88,
            accessibility: {
              hasSubtitles: false,
              audioLevel: 85,
              visualContrast: 90
            }
          },
          personalityInsights: {
            traits: {
              openness: 78,
              conscientiousness: 85,
              extraversion: 72,
              agreeableness: 80,
              neuroticism: 28
            },
            workStyle: {
              collaborative: 82,
              independent: 78,
              detailOriented: 85,
              bigPicture: 72
            },
            motivators: ['Learning', 'Problem Solving', 'Innovation', 'Growth'],
            communicationStyle: 'analytical'
          },
          keyTopics: [
            {
              topic: 'React Development',
              relevance: 95,
              mentions: 8,
              context: ['Component architecture', 'State management', 'Hooks', 'Performance']
            },
            {
              topic: 'JavaScript Programming',
              relevance: 92,
              mentions: 12,
              context: ['ES6+ features', 'Async programming', 'Problem solving']
            },
            {
              topic: 'Web Development',
              relevance: 88,
              mentions: 6,
              context: ['Frontend development', 'User experience', 'Best practices']
            }
          ],
          recommendations: [
            {
              type: 'content',
              priority: 'high',
              title: 'Add Live Coding Demonstration',
              description: 'Include a live coding session to better showcase problem-solving skills and technical proficiency.',
              actionItems: [
                'Record a 5-10 minute coding session',
                'Explain your thought process while coding',
                'Show debugging and testing techniques',
                'Demonstrate code refactoring'
              ]
            },
            {
              type: 'presentation',
              priority: 'medium',
              title: 'Improve Video Engagement',
              description: 'Enhance viewer engagement through better pacing and interactive elements.',
              actionItems: [
                'Vary your speaking pace for emphasis',
                'Use more visual aids and examples',
                'Include brief pauses for key points',
                'Add call-to-action elements'
              ]
            },
            {
              type: 'technical',
              priority: 'medium',
              title: 'Showcase System Design Skills',
              description: 'Demonstrate architectural thinking and system design capabilities.',
              actionItems: [
                'Create a system architecture diagram',
                'Explain scalability considerations',
                'Discuss technology trade-offs',
                'Show database design thinking'
              ]
            }
          ],
          overallScore: 84,
          categoryScores: {
            technical: 90,
            communication: 82,
            presentation: 81,
            content: 85
          },
          industryBenchmark: {
            percentile: 78,
            similarProfiles: 1250,
            topSkills: ['React', 'JavaScript', 'Problem Solving', 'Communication'],
            improvementAreas: ['System Design', 'Leadership', 'Public Speaking', 'Testing']
          }
        }

        // Update with completed analysis
        await supabaseClient
          .from('video_analyses')
          .update({
            processing_status: 'completed',
            processing_completed_at: new Date().toISOString(),
            analysis_data: mockResults,
            skills_detected: mockResults.technicalSkills,
            traits_assessment: mockResults.technicalSkills.map(skill => skill.traits),
            confidence_scores: mockResults.categoryScores
          })
          .eq('id', analysisRecord.id)

        // Update queue status
        await supabaseClient
          .from('analysis_queue')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('video_analysis_id', analysisRecord.id)

      } catch (error) {
        console.error('Analysis processing failed:', error)
        
        // Update with error status
        await supabaseClient
          .from('video_analyses')
          .update({
            processing_status: 'failed',
            error_message: error.message
          })
          .eq('id', analysisRecord.id)

        await supabaseClient
          .from('analysis_queue')
          .update({
            status: 'failed',
            error_details: { message: error.message, timestamp: new Date().toISOString() }
          })
          .eq('video_analysis_id', analysisRecord.id)
      }
    }, 1000)

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysisId: analysisRecord.id,
        message: 'Analysis started successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})