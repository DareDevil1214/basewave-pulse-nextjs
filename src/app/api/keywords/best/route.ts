import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    // Get keywords from best_keywords collection
    const keywordsRef = collection(db, 'best_keywords');
    const keywordsSnapshot = await getDocs(keywordsRef);
    
    const keywords = keywordsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      keywords: keywords
    });
  } catch (error) {
    console.error('Error fetching best keywords:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch keywords' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, volume, difficulty, opportunity, intent } = body;

    if (!keyword) {
      return NextResponse.json(
        { success: false, error: 'Keyword is required' },
        { status: 400 }
      );
    }

    const keywordsRef = collection(db, 'best_keywords');
    const newKeyword = {
      keyword,
      volume: volume || 0,
      difficulty: difficulty || 'Medium',
      opportunity: opportunity || 'Medium',
      intent: intent || 'Commercial',
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(keywordsRef, newKeyword);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      keyword: newKeyword
    });
  } catch (error) {
    console.error('Error adding keyword:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add keyword' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Keyword ID is required' },
        { status: 400 }
      );
    }

    const keywordRef = doc(db, 'best_keywords', id);
    await updateDoc(keywordRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Keyword updated successfully'
    });
  } catch (error) {
    console.error('Error updating keyword:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update keyword' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Keyword ID is required' },
        { status: 400 }
      );
    }

    const keywordRef = doc(db, 'best_keywords', id);
    await deleteDoc(keywordRef);

    return NextResponse.json({
      success: true,
      message: 'Keyword deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting keyword:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete keyword' },
      { status: 500 }
    );
  }
}
