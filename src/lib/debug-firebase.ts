// Debug utility for testing Firebase data fetching
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { getNormalizedPortalName } from './portal-mapping';

// Debug function to inspect the actual structure of compBlogContent collection
export const debugCompBlogContent = async () => {
  try {
    console.log('🔍 Debugging compBlogContent collection structure...');
    
    const blogContentRef = collection(db, 'compBlogContent');
    const querySnapshot = await getDocs(blogContentRef);
    
    console.log('📄 Total documents in compBlogContent:', querySnapshot.size);
    
    querySnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n📋 Document ${index + 1} (ID: ${doc.id}):`);
      console.log('Raw data:', data);
      
      if (data.articles) {
        console.log('Articles found:', Object.keys(data.articles));
        
        Object.keys(data.articles).forEach((articleKey) => {
          const article = data.articles[articleKey];
          console.log(`  Article ${articleKey}:`, {
            title: article.title,
            website: article.website,
            url: article.url,
            description: article.description?.substring(0, 100) + '...'
          });
        });
      } else {
        console.log('No articles field found');
      }
    });
    
  } catch (error) {
    console.error('❌ Error debugging compBlogContent:', error);
  }
};

// Debug function to inspect the actual structure of portalKeywords collection
export const debugPortalKeywords = async () => {
  try {
    console.log('🔍 Debugging portalKeywords collection structure...');
    
    const keywordsRef = collection(db, 'portalKeywords');
    const querySnapshot = await getDocs(keywordsRef);
    
    console.log('📄 Total documents in portalKeywords:', querySnapshot.size);
    
    querySnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n📋 Document ${index + 1} (ID: ${doc.id}):`);
      console.log('Raw data:', data);
      
      if (data.keywords && Array.isArray(data.keywords)) {
        console.log(`Keywords array (${data.keywords.length} items):`, data.keywords);
      } else {
        console.log('No keywords array found');
      }
      
      console.log('Portal field:', data.portal);
    });
    
  } catch (error) {
    console.error('❌ Error debugging portalKeywords:', error);
  }
};

// Test portal mapping with actual data
export const testPortalMappingWithData = async (portal: string) => {
  try {
    const normalizedPortal = getNormalizedPortalName(portal);
    console.log(`🧪 Testing portal mapping for "${portal}":`);
    console.log(`  Normalized: "${normalizedPortal}"`);
    
    // Test compBlogContent
    console.log('\n🔍 Testing compBlogContent filtering...');
    const blogContentRef = collection(db, 'compBlogContent');
    const blogSnapshot = await getDocs(blogContentRef);
    
    let matchingArticles = 0;
    blogSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.articles && typeof data.articles === 'object') {
        Object.keys(data.articles).forEach((articleKey) => {
          const article = data.articles[articleKey];
          if (article.website === normalizedPortal) {
            matchingArticles++;
            console.log(`  ✅ Found matching article: ${article.title}`);
          }
        });
      }
    });
    
    console.log(`  Total matching articles: ${matchingArticles}`);
    
    // Test portalKeywords
    console.log('\n🔍 Testing portalKeywords filtering...');
    const keywordsRef = collection(db, 'portalKeywords');
    const keywordsSnapshot = await getDocs(keywordsRef);
    
    let matchingKeywords = 0;
    keywordsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.portal === normalizedPortal && data.keywords && Array.isArray(data.keywords)) {
        matchingKeywords += data.keywords.length;
        console.log(`  ✅ Found matching keywords document: ${data.keywords.length} keywords`);
      }
    });
    
    console.log(`  Total matching keywords: ${matchingKeywords}`);
    
  } catch (error) {
    console.error('❌ Error testing portal mapping with data:', error);
  }
};

// Export for use in development
if (typeof window !== 'undefined') {
  (window as any).debugCompBlogContent = debugCompBlogContent;
  (window as any).debugPortalKeywords = debugPortalKeywords;
  (window as any).testPortalMappingWithData = testPortalMappingWithData;
}
