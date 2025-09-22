import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  fetchBlogContent, 
  generateBlogPost, 
  BlogContent 
} from '@/lib/blog-firebase';

// Helper function to get portal account mapping
const getPortalAccount = (portal: string): string => {
  const portalMapping: { [key: string]: string } = {
    'elite-equilibrium': 'eliteequilibrium',
    'eliteequilibrium': 'eliteequilibrium',
    'eternal-elite': 'eternalelite',
    'eternalelite': 'eternalelite',
    'neo-vibe-mag': 'neovibemag',
    'neovibemag': 'neovibemag'
  };
  return portalMapping[portal.toLowerCase()] || portal;
};

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleId = params.id;
    console.log(`🚀 Executing blog schedule: ${scheduleId}`);

    // Get the schedule
    const scheduleRef = doc(db, 'blogSchedules', scheduleId);
    const scheduleSnap = await getDoc(scheduleRef);
    
    if (!scheduleSnap.exists()) {
      return NextResponse.json(
        { success: false, message: 'Schedule not found' },
        { status: 404 }
      );
    }
    
    const schedule = scheduleSnap.data();
    
    // Get blog templates for the portal
    const blogTemplates = await fetchBlogContent(schedule.portal);
    
    // Find a template to use - either the one specified in the schedule or the first available
    let template: BlogContent | null = null;
    
    if (schedule.templateId) {
      template = blogTemplates.find(t => t.id === schedule.templateId) || null;
    }
    
    if (!template && blogTemplates.length > 0) {
      // Filter out any templates with 'Untitled Blog' as title
      const validTemplates = blogTemplates.filter(template => 
        template.title && template.title !== 'Untitled Blog'
      );
      
      if (validTemplates.length > 0) {
        template = validTemplates[0];
      }
    }
    
    if (!template) {
      throw new Error('No valid blog template found');
    }
    
    console.log('Using template:', template.title);
    
    // Get keywords if specified in the schedule
    let keywords: string[] = [];
    if (schedule.keyword) {
      keywords = [schedule.keyword];
    }
    
    // Generate the blog post using the same function as BlogGenerationForm.tsx
    const generatedPost = await generateBlogPost(
      template,
      keywords,
      schedule.portal,
      schedule.generateImage || false
    );
    
    console.log('Blog post generated successfully');
    
    // Handle social media generation if enabled
    let socialMediaResults = null;
    if (schedule.generateSocial) {
      try {
        console.log('🚀 Generating social media content...');
        
        const account = getPortalAccount(schedule.portal);
        const documentID = template.id.includes('_') ? template.id.split('_')[0] : template.id;
        
        // Generate social media content using the same logic as CombinedGenerationForm
        const socialPayload = {
          platforms: ['Facebook', 'Instagram', 'Threads', 'X', 'LinkedIn'],
          generateImage: schedule.generateImage || false,
          maxPosts: 1,
          targetAudience: 'General audience',
          tone: 'professional',
          account: account,
          articleTitle: template.title,
          documentID: documentID
        };
        
        console.log('🔍 Social media generation payload:', socialPayload);
        
        const socialResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/socialagent/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(socialPayload),
        });
        
        if (socialResponse.ok) {
          const socialResult = await socialResponse.json();
          console.log('✅ Social media content generated successfully:', socialResult);
          socialMediaResults = socialResult;
          
          // Auto-publish the generated social media content
          if (socialResult.data && socialResult.data.length > 0) {
            console.log('🚀 Auto-publishing social media content...');
            
            for (const post of socialResult.data) {
              try {
                const publishResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/socialagent/publish/publish-from-firebase`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    documentId: post.id
                  }),
                });
                
                if (publishResponse.ok) {
                  console.log(`✅ Auto-published social media post: ${post.id}`);
                } else {
                  console.error(`❌ Failed to auto-publish social media post: ${post.id}`);
                }
              } catch (publishError) {
                console.error(`❌ Error auto-publishing social media post ${post.id}:`, publishError);
              }
            }
          }
        } else {
          console.error('❌ Failed to generate social media content:', await socialResponse.text());
        }
      } catch (socialError) {
        console.error('❌ Error generating social media content:', socialError);
        // Don't fail the entire execution if social media generation fails
      }
    }
    
    // Update the schedule with execution information
    await updateDoc(scheduleRef, {
      executionCount: (schedule.executionCount || 0) + 1,
      lastExecutionTime: serverTimestamp(),
      lastStatus: 'success',
      updatedAt: serverTimestamp(),
      // If it's a one-time schedule, mark it as inactive after execution
      isActive: schedule.cronExpression.includes('*') ? schedule.isActive : false
    });
    
    return NextResponse.json({
      success: true,
      message: schedule.generateSocial ? 'Blog post and social media content created and published successfully' : 'Blog post created successfully',
      data: {
        postId: generatedPost.id,
        title: generatedPost.title,
        scheduleId,
        socialMediaResults
      }
    });
  } catch (error) {
    console.error('Error executing blog schedule:', error);
    
    try {
      // Update status to error in case of failure
      const scheduleRef = doc(db, 'blogSchedules', params.id);
      await updateDoc(scheduleRef, {
        lastStatus: 'error',
        updatedAt: serverTimestamp(),
      });
    } catch (updateError) {
      console.error('Failed to update error status:', updateError);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to execute blog schedule',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}