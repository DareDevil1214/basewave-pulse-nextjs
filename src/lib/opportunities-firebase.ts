// Note: Firebase dependencies removed - using backend API instead
// import { db } from './firebase';
// import { collection, getDocs, query, where, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { getCurrentBranding } from './branding';

export interface Article {
  description: string;
  long_tail_keywords: string[];
  outline: string;
  primary_keywords: string[];
  secondary_keywords: string[];
  title: string;
  visual: string;
  website: string;
  portalId?: string;
  portalName?: string;
}

export interface CompBlogContent {
  articles: {
    [key: string]: Article;
  };
}

export interface PortalOpportunities {
  portalId: string;
  portalName: string;
  articles: Article[];
}

// Document ID mapping to portals
const DOCUMENT_PORTAL_MAPPING = {
  'J1RrUZRN3Y6gzZksqwo1': 'eternal-elite',
  'sIFH0iWKoXchpo6oKb4O': 'elite-equilibrium',
  'cUZe4755uWN1G6YSC6nX': 'neo-vibe-mag',
  'basewave-doc-id': 'basewave'  // Placeholder document ID for BaseWave portal
};

// Fetch opportunities for a specific portal
export const fetchPortalOpportunities = async (portalId: string): Promise<PortalOpportunities | null> => {
  try {
    console.log(`🔍 Fetching opportunities for portal ${portalId} from compBlogContent collection`);

    // Query all documents in compBlogContent collection
    const q = query(collection(db, 'compBlogContent'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.error('No documents found in compBlogContent collection');
      return null;
    }

    const allArticles: Article[] = [];

    // Iterate through all documents
    snapshot.forEach((doc) => {
      const data = doc.data() as CompBlogContent;

      // Check if articles exist and iterate through them
      if (data.articles) {
        Object.values(data.articles).forEach((article) => {
          // Filter by website based on portal
          if (portalId === 'basewave' && article.website === getCurrentBranding().website) {
            allArticles.push(article);
          } else if (portalId === 'cv-maker' && article.website === 'https://cv-maker.com') {
            allArticles.push(article);
          }
        });
      }
    });

    console.log(`✅ Found ${allArticles.length} articles for ${portalId} with website filter`);

    return {
      portalId,
      portalName: getPortalDisplayName(portalId),
      articles: allArticles
    };

  } catch (error) {
    console.error(`❌ Error fetching opportunities for portal ${portalId}:`, error);
    return null;
  }
};

// Fetch all portal opportunities
export const fetchAllPortalOpportunities = async (): Promise<PortalOpportunities[]> => {
  try {
    console.log('🔍 Fetching all portal opportunities...');

    // Fetch both supported portals
    const [basewaveResult, cvMakerResult] = await Promise.all([
      fetchPortalOpportunities('basewave'),
      fetchPortalOpportunities('cv-maker')
    ]);

    const validResults = [basewaveResult, cvMakerResult].filter(result => result !== null);

    console.log(`✅ Fetched ${validResults.length} portal opportunities`);
    return validResults;

  } catch (error) {
    console.error('❌ Error fetching all portal opportunities:', error);
    return [];
  }
};

// Get portal display name
const getPortalDisplayName = (portalId: string): string => {
  const displayNames: { [key: string]: string } = {
    'eternal-elite': 'Eternal Elite',
    'elite-equilibrium': 'Elite Equilibrium',
    'neo-vibe-mag': 'Neo Vibe Mag',
    'basewave': 'BaseWave',
    'cv-maker': 'CV Maker'
  };
  return displayNames[portalId] || portalId;
};

// Get portal logo
export const getPortalLogo = (portalId: string): string => {
  const logos: { [key: string]: string } = {
    'eternal-elite': '/eternal-logo.png',
    'elite-equilibrium': '/elite-logo.png',
    'neo-vibe-mag': '/logo-load.webp',
    'basewave': '/logo-basewave.png',
    'cv-maker': '/cv-maker.png' // Fixed CV Maker logo
  };
  return logos[portalId] || '/logo.png';
};

// Delete opportunity from Firebase
export const deleteOpportunity = async (article: Article): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🗑️ Deleting opportunity:', article.title);
    
    // Find the document containing this article
    const compBlogContentRef = collection(db, 'compBlogContent');
    const snapshot = await getDocs(compBlogContentRef);
    
    let docToUpdate: any = null;
    let articleKey: string | null = null;
    
    // Find the document and article key
    snapshot.forEach((doc) => {
      const data = doc.data() as CompBlogContent;
      if (data.articles) {
        Object.entries(data.articles).forEach(([key, articleData]) => {
          if (articleData.title === article.title && 
              articleData.website === article.website) {
            docToUpdate = doc;
            articleKey = key;
          }
        });
      }
    });
    
    if (!docToUpdate || !articleKey) {
      return {
        success: false,
        message: 'Opportunity not found'
      };
    }
    
    // Remove the article from the document
    const updatedArticles = { ...docToUpdate.data().articles };
    delete updatedArticles[articleKey];
    
    // If no articles left, delete the entire document
    if (Object.keys(updatedArticles).length === 0) {
      await deleteDoc(doc(db, 'compBlogContent', docToUpdate.id));
      console.log('✅ Deleted entire document as it was empty');
    } else {
      // Update the document with remaining articles
      await updateDoc(doc(db, 'compBlogContent', docToUpdate.id), {
        articles: updatedArticles
      });
      console.log('✅ Updated document with remaining articles');
    }
    
    return {
      success: true,
      message: 'Opportunity deleted successfully'
    };
    
  } catch (error) {
    console.error('❌ Error deleting opportunity:', error);
    return {
      success: false,
      message: 'Failed to delete opportunity'
    };
  }
};
