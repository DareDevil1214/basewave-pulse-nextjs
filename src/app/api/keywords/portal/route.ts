import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portal = searchParams.get('portal');

    if (!portal) {
      return NextResponse.json(
        { error: 'Portal parameter is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Fetching keywords from portalKeywords collection for portal: ${portal}`);

    // Query portalKeywords collection with portal filter
    const q = query(collection(db, 'portalKeywords'), where('portal', '==', portal));
    const querySnapshot = await getDocs(q);

    console.log(`📄 Found ${querySnapshot.size} documents for portal: ${portal}`);

    const keywords: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`Processing document ${doc.id}:`, data);

      // Handle the keywords array from portalKeywords collection
      if (data.keywords && Array.isArray(data.keywords)) {
        data.keywords.forEach((keywordText: string, index: number) => {
          keywords.push({
            id: `${doc.id}_${index}`,
            keyword: keywordText,
            // Since the structure doesn't have individual keyword metrics, 
            // we'll use default values or leave them empty
            volume: 0,
            difficulty: 0,
            rank: '',
            opportunity: 'Medium',
            intent: 'Commercial',
            cpc: 0,
            portal: data.portal,
          });
        });
      }
    });

    console.log(`✅ Fetched ${keywords.length} keywords for portal: ${portal}`);

    return NextResponse.json({
      success: true,
      keywords: keywords,
      portal: portal,
      count: keywords.length
    });

  } catch (error) {
    console.error('❌ Error fetching portal keywords:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portal keywords' },
      { status: 500 }
    );
  }
}
