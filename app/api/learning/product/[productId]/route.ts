import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  const data = await fs.readFile('../../../../../src/mock/small/learning.json', 'utf-8');
  const learningContents = JSON.parse(data);
  const resources = learningContents.filter(
    (item: { productId: number }) => item.productId === Number.parseInt(params.productId)
  );
  return NextResponse.json({ data: resources }, { status: 200 });
}

export async function PUT(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const updatedResources = await request.json();
    const data = await fs.readFile('../../../../../src/mock/small/learning.json', 'utf-8');
    let learningContents = JSON.parse(data);

    // Remove all resources for this productId
    learningContents = learningContents.filter(
      (item: { productId: number }) => item.productId !== Number.parseInt(params.productId)
    );

    // Add the updated resources
    learningContents.push(...updatedResources);

    await fs.writeFile(
      '../../../../../src/mock/small/learning.json',
      JSON.stringify(learningContents, null, 2),
      'utf-8'
    );
    return NextResponse.json({ message: 'Resources updated successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to update resources: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const data = await fs.readFile('../../../../../src/mock/small/learning.json', 'utf-8');
    let learningContents = JSON.parse(data);
    const originalLength = learningContents.length;

    // Remove all resources for this productId
    learningContents = learningContents.filter(
      (item: { productId: number }) => item.productId !== Number.parseInt(params.productId)
    );

    if (learningContents.length === originalLength) {
      return NextResponse.json({ error: 'No resources found for this product' }, { status: 404 });
    }

    await fs.writeFile(
      '../../../../../src/mock/small/learning.json',
      JSON.stringify(learningContents, null, 2),
      'utf-8'
    );
    return NextResponse.json({ message: 'Resources deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to delete resources: ${error.message}` }, { status: 500 });
  }
}
