import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';

export async function GET() {
  const smallData = await fs.readFile('../../../src/mock/small/learning.json', 'utf-8');
  const largeData = await fs.readFile('../../../src/mock/large/learning.json', 'utf-8');
  const smallLearningContents = JSON.parse(smallData);
  const largeLearningContents = JSON.parse(largeData);
  const learningContents = [...largeLearningContents, ...smallLearningContents];
  return NextResponse.json({ data: learningContents }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const newResource = await request.json();
    const data = await fs.readFile('../../../src/mock/small/learning.json', 'utf-8');
    const learningContents = JSON.parse(data);
    learningContents.push(newResource);
    await fs.writeFile('../../../src/mock/small/learning.json', JSON.stringify(learningContents, null, 2), 'utf-8');
    return NextResponse.json({ message: 'Resource added successfully' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to add resource: ${error.message}` }, { status: 500 });
  }
}
