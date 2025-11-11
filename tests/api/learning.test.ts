import { GET as getCollection, POST } from '@/app/api/learning/route';
import { GET as getItem, PUT, DELETE } from '@/app/api/learning/[resourceId]/route';
import { NextRequest } from 'next/server';
import fs from 'node:fs/promises';

// Mock the file system
jest.mock('node:fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('Learning Content API', () => {
  const mockLearningData = [
    {
      resourceId: 'learn-001',
      productId: 'prod-123',
      name: 'Getting Started Guide',
      description: 'A comprehensive guide to get you started',
      resourceURI: 'https://example.com/getting-started',
      popularityScore: 95,
    },
    {
      resourceId: 'learn-002',
      productId: 'prod-456',
      name: 'Advanced Tutorial',
      description: 'Advanced techniques and best practices',
      resourceURI: 'https://example.com/advanced',
      popularityScore: 87,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/learning', () => {
    it('should return array of all learning content', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockLearningData));

      const response = await getCollection();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockLearningData);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data).toHaveLength(2);
    });

    it('should handle empty learning content array', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify([]));

      const response = await getCollection();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should handle file read errors gracefully', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      await expect(getCollection()).rejects.toThrow('File not found');
    });
  });

  describe('POST /api/learning', () => {
    it('should create new learning resource', async () => {
      const newResource = {
        resourceId: 'learn-003',
        productId: 'prod-789',
        name: 'API Reference',
        description: 'Complete API documentation',
        resourceURI: 'https://example.com/api-reference',
        popularityScore: 92,
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockLearningData));
      mockFs.writeFile.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/learning', {
        method: 'POST',
        body: JSON.stringify(newResource),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('Resource added successfully');
      expect(mockFs.writeFile).toHaveBeenCalled();

      const writeCall = mockFs.writeFile.mock.calls[0];
      const writtenData = JSON.parse(writeCall[1] as string);
      expect(writtenData).toHaveLength(3);
      expect(writtenData[2]).toEqual(newResource);
    });

    it('should handle invalid JSON in POST request', async () => {
      const request = new NextRequest('http://localhost:3000/api/learning', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to add resource');
    });

    it('should handle file write errors', async () => {
      const newResource = {
        resourceId: 'learn-003',
        productId: 'prod-789',
        name: 'API Reference',
        description: 'Complete API documentation',
        resourceURI: 'https://example.com/api-reference',
        popularityScore: 92,
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockLearningData));
      mockFs.writeFile.mockRejectedValue(new Error('Write permission denied'));

      const request = new NextRequest('http://localhost:3000/api/learning', {
        method: 'POST',
        body: JSON.stringify(newResource),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to add resource');
    });
  });

  describe('GET /api/learning/[resourceId]', () => {
    it('should return correct resource by resourceId', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockLearningData));

      const response = await getItem(new NextRequest('http://localhost:3000/api/learning/learn-001'), {
        params: { resourceId: 'learn-001' },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockLearningData[0]);
      expect(data.data.resourceId).toBe('learn-001');
    });

    it('should return null for non-existent resource', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockLearningData));

      const response = await getItem(new NextRequest('http://localhost:3000/api/learning/learn-999'), {
        params: { resourceId: 'learn-999' },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeNull();
    });

    it('should handle file read errors', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      await expect(
        getItem(new NextRequest('http://localhost:3000/api/learning/learn-001'), {
          params: { resourceId: 'learn-001' },
        })
      ).rejects.toThrow('File not found');
    });
  });

  describe('PUT /api/learning/[resourceId]', () => {
    it('should update existing learning resource', async () => {
      const updatedFields = {
        name: 'Updated Getting Started Guide',
        popularityScore: 98,
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockLearningData));
      mockFs.writeFile.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/learning/learn-001', {
        method: 'PUT',
        body: JSON.stringify(updatedFields),
      });

      const response = await PUT(request, { params: { resourceId: 'learn-001' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Resource updated successfully');
      expect(mockFs.writeFile).toHaveBeenCalled();

      const writeCall = mockFs.writeFile.mock.calls[0];
      const writtenData = JSON.parse(writeCall[1] as string);
      expect(writtenData[0].name).toBe('Updated Getting Started Guide');
      expect(writtenData[0].popularityScore).toBe(98);
      expect(writtenData[0].resourceId).toBe('learn-001'); // Should preserve resourceId
    });

    it('should return 404 for non-existent resource', async () => {
      const updatedFields = {
        name: 'Updated Guide',
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockLearningData));

      const request = new NextRequest('http://localhost:3000/api/learning/learn-999', {
        method: 'PUT',
        body: JSON.stringify(updatedFields),
      });

      const response = await PUT(request, { params: { resourceId: 'learn-999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Resource not found');
      expect(mockFs.writeFile).not.toHaveBeenCalled();
    });

    it('should handle invalid JSON in PUT request', async () => {
      const request = new NextRequest('http://localhost:3000/api/learning/learn-001', {
        method: 'PUT',
        body: 'invalid json',
      });

      const response = await PUT(request, { params: { resourceId: 'learn-001' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to update resource');
    });

    it('should handle file write errors during update', async () => {
      const updatedFields = {
        name: 'Updated Guide',
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockLearningData));
      mockFs.writeFile.mockRejectedValue(new Error('Write permission denied'));

      const request = new NextRequest('http://localhost:3000/api/learning/learn-001', {
        method: 'PUT',
        body: JSON.stringify(updatedFields),
      });

      const response = await PUT(request, { params: { resourceId: 'learn-001' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to update resource');
    });
  });

  describe('DELETE /api/learning/[resourceId]', () => {
    it('should remove learning resource', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockLearningData));
      mockFs.writeFile.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/learning/learn-001', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { resourceId: 'learn-001' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Resource deleted successfully');
      expect(mockFs.writeFile).toHaveBeenCalled();

      const writeCall = mockFs.writeFile.mock.calls[0];
      const writtenData = JSON.parse(writeCall[1] as string);
      expect(writtenData).toHaveLength(1);
      expect(writtenData[0].resourceId).toBe('learn-002');
    });

    it('should return 404 for non-existent resource', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockLearningData));

      const request = new NextRequest('http://localhost:3000/api/learning/learn-999', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { resourceId: 'learn-999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Resource not found');
      expect(mockFs.writeFile).not.toHaveBeenCalled();
    });

    it('should handle file write errors during delete', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockLearningData));
      mockFs.writeFile.mockRejectedValue(new Error('Write permission denied'));

      const request = new NextRequest('http://localhost:3000/api/learning/learn-001', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { resourceId: 'learn-001' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to delete resource');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle full CRUD cycle', async () => {
      let mockData = [...mockLearningData];

      // Create
      const newResource = {
        resourceId: 'learn-003',
        productId: 'prod-789',
        name: 'API Reference',
        description: 'Complete API documentation',
        resourceURI: 'https://example.com/api-reference',
        popularityScore: 92,
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockData));
      mockFs.writeFile.mockImplementation(async (path, data) => {
        mockData = JSON.parse(data as string);
      });

      const createRequest = new NextRequest('http://localhost:3000/api/learning', {
        method: 'POST',
        body: JSON.stringify(newResource),
      });
      const createResponse = await POST(createRequest);
      expect(createResponse.status).toBe(201);

      // Read (after update)
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockData));
      const readResponse = await getItem(new NextRequest('http://localhost:3000/api/learning/learn-003'), {
        params: { resourceId: 'learn-003' },
      });
      const readData = await readResponse.json();
      expect(readData.data.resourceId).toBe('learn-003');

      // Update
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockData));
      const updateRequest = new NextRequest('http://localhost:3000/api/learning/learn-003', {
        method: 'PUT',
        body: JSON.stringify({ popularityScore: 99 }),
      });
      const updateResponse = await PUT(updateRequest, { params: { resourceId: 'learn-003' } });
      expect(updateResponse.status).toBe(200);

      // Delete
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockData));
      const deleteRequest = new NextRequest('http://localhost:3000/api/learning/learn-003', {
        method: 'DELETE',
      });
      const deleteResponse = await DELETE(deleteRequest, { params: { resourceId: 'learn-003' } });
      expect(deleteResponse.status).toBe(200);
    });

    it('should handle empty data file', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify([]));

      const response = await getCollection();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
    });
  });
});
