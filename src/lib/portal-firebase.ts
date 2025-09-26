// Note: Firebase dependencies removed - using backend API instead
// import { db } from './firebase';
// import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, where } from 'firebase/firestore';

// Interface for Portal Config
export interface PortalConfig {
  id: string;
  portal?: string; // Make portal optional since it might not be in every document
  [key: string]: any; // Allow for dynamic fields
}

// Interface for Portal Keywords
export interface PortalKeyword {
  id: string;
  portal?: string; // Make portal optional since it might not be in every document
  [key: string]: any; // Allow for dynamic fields
}

// Fetch portal configs for a specific portal
export const fetchPortalConfigs = async (portalName: string): Promise<PortalConfig[]> => {
  try {
    console.log(`🔍 Fetching portal configs for: ${portalName}`);
    
    const configsRef = collection(db, 'portalConfigs');
    const q = query(
      configsRef, 
      where('portal', '==', portalName)
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`📄 Found ${querySnapshot.size} config documents for ${portalName}`);
    
    const configs: PortalConfig[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      configs.push({
        id: doc.id,
        ...data
      } as PortalConfig);
    });
    
    console.log(`✅ Successfully fetched ${configs.length} portal configs for ${portalName}`);
    return configs;
  } catch (error) {
    console.error(`❌ Error fetching portal configs for ${portalName}:`, error);
    return [];
  }
};

// Fetch portal keywords for a specific portal
export const fetchPortalKeywords = async (portalName: string): Promise<PortalKeyword[]> => {
  try {
    console.log(`🔍 Fetching portal keywords for: ${portalName}`);
    
    const keywordsRef = collection(db, 'portalKeywords');
    const q = query(
      keywordsRef, 
      where('portal', '==', portalName)
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`📄 Found ${querySnapshot.size} keyword documents for ${portalName}`);
    
    const keywords: PortalKeyword[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      keywords.push({
        id: doc.id,
        ...data
      } as PortalKeyword);
    });
    
    console.log(`✅ Successfully fetched ${keywords.length} portal keywords for ${portalName}`);
    return keywords;
  } catch (error) {
    console.error(`❌ Error fetching portal keywords for ${portalName}:`, error);
    return [];
  }
};

// Update portal config
export const updatePortalConfig = async (configId: string, updates: Partial<PortalConfig>): Promise<boolean> => {
  try {
    console.log(`🔄 Updating portal config ${configId}:`, updates);
    
    const configRef = doc(db, 'portalConfigs', configId);
    await updateDoc(configRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    console.log(`✅ Successfully updated portal config ${configId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating portal config ${configId}:`, error);
    throw error;
  }
};

// Update portal keyword
export const updatePortalKeyword = async (keywordId: string, updates: Partial<PortalKeyword>): Promise<boolean> => {
  try {
    console.log(`🔄 Updating portal keyword ${keywordId}:`, updates);
    
    const keywordRef = doc(db, 'portalKeywords', keywordId);
    await updateDoc(keywordRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    console.log(`✅ Successfully updated portal keyword ${keywordId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating portal keyword ${keywordId}:`, error);
    throw error;
  }
};

// Add portal keyword
export const addPortalKeyword = async (portal: string, keyword: string): Promise<boolean> => {
  try {
    console.log(`➕ Adding keyword "${keyword}" for portal: ${portal}`);
    
    const keywordsRef = collection(db, 'portalKeywords');
    await addDoc(keywordsRef, {
      portal,
      keywords: [keyword],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log(`✅ Successfully added keyword "${keyword}" for portal ${portal}`);
    return true;
  } catch (error) {
    console.error(`❌ Error adding keyword for portal ${portal}:`, error);
    throw error;
  }
};

// Delete portal keyword
export const deletePortalKeyword = async (keywordId: string): Promise<boolean> => {
  try {
    console.log(`🗑️ Deleting portal keyword ${keywordId}`);
    
    const keywordRef = doc(db, 'portalKeywords', keywordId);
    await deleteDoc(keywordRef);
    
    console.log(`✅ Successfully deleted portal keyword ${keywordId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting portal keyword ${keywordId}:`, error);
    throw error;
  }
};

// Fetch all portal data for a specific portal
export const fetchPortalData = async (portalName: string) => {
  try {
    console.log(`🔍 Fetching all portal data for: ${portalName}`);
    
    const [configs, keywords] = await Promise.all([
      fetchPortalConfigs(portalName),
      fetchPortalKeywords(portalName)
    ]);
    
    return {
      configs,
      keywords,
      totalConfigs: configs.length,
      totalKeywords: keywords.length
    };
  } catch (error) {
    console.error(`❌ Error fetching portal data for ${portalName}:`, error);
    return {
      configs: [],
      keywords: [],
      totalConfigs: 0,
      totalKeywords: 0
    };
  }
};
