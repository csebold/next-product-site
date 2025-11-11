# Learning Content API Implementation Plan

## Overview

Implement a backend model and API for managing learning content based on the `ProductResource` model. Learning content will be tied to products and use `resourceId` as the unique identifier. Data will be stored in JSON files.

## Implementation Steps

### 1. Create Type Definition

**File:** `src/type/learning/index.ts`

Create a `LearningContent` type based on the existing `ProductResource` model:

```typescript
export type LearningContent = {
  resourceId: string;
  productId: number;
  name: string;
  description: string;
  resourceURI: string;
  popularityScore: number;
};
```

**Key Decisions:**

- Uses `resourceId` (string) as the unique identifier
- Tied to products via `productId` field
- Based on the existing `ProductResource` structure

### 2. Create Collection API Route

**File:** `app/api/learning/route.ts`

Implement handlers for the collection endpoint:

- **GET `/api/learning`** - List all learning content
  - Read from `src/mock/small/learning.json` (or large)
  - Return array of all learning resources
  - Optional: Support query parameters for filtering by `productId`

- **POST `/api/learning`** - Create new learning content
  - Accept JSON body with learning content data
  - Generate new `resourceId` if not provided
  - Append to JSON file
  - Return created resource with 201 status

### 3. Create Individual Item API Route

**File:** `app/api/learning/[id]/route.ts`

Implement handlers for individual resource operations (where `[id]` is the `resourceId`):

- **GET `/api/learning/[id]`** - Fetch single learning resource
  - Find resource by `resourceId`
  - Return 404 if not found
  - Return resource data with 200 status

- **PUT `/api/learning/[id]`** - Update existing learning resource
  - Find and update resource by `resourceId`
  - Return updated resource with 200 status
  - Return 404 if not found

- **DELETE `/api/learning/[id]`** - Remove learning resource
  - Find and delete resource by `resourceId`
  - Return 204 status on success
  - Return 404 if not found

### 4. Create Mock Data Files

**Files:**

- `src/mock/small/learning.json` - Small dataset (10-20 items)
- `src/mock/large/learning.json` - Larger dataset (100+ items)

**Sample structure:**

```json
[
  {
    "resourceId": "learn-001",
    "productId": 1,
    "name": "Getting Started Guide",
    "description": "Complete beginner's guide to using this product",
    "resourceURI": "https://example.com/docs/getting-started",
    "popularityScore": 95
  }
]
```

### 5. Update Data Generation Scripts

**Modify:** `scripts/generateSmallData.js`

- Add learning content generation using `@faker-js/faker`
- Generate 10-20 learning resources
- Ensure `productId` values reference existing products
- Generate realistic `resourceId`, names, descriptions, URIs, and popularity scores

**Modify:** `scripts/generateLargeData.js`

- Add learning content generation
- Generate 100-500 learning resources
- Distribute resources across products

**Suggested faker usage:**

- `resourceId`: Use UUID or custom format (e.g., "learn-001")
- `name`: `faker.commerce.productAdjective() + " " + faker.hacker.noun() + " Guide"`
- `description`: `faker.commerce.productDescription()`
- `resourceURI`: `faker.internet.url()`
- `popularityScore`: `faker.number.int({ min: 1, max: 100 })`

### 6. Create API Tests

**File:** `tests/api/learning.test.ts` (or similar)

Test coverage should include:

- GET `/api/learning` returns array of learning content
- GET `/api/learning/[id]` returns correct resource
- GET `/api/learning/[id]` returns 404 for non-existent resource
- POST `/api/learning` creates new resource
- PUT `/api/learning/[id]` updates existing resource
- DELETE `/api/learning/[id]` removes resource

Use Jest with your existing test configuration.

## Technical Considerations

### File I/O

- Use `fs.readFileSync()` and `fs.writeFileSync()` for JSON file operations
- Consider using `path.join()` to construct file paths
- Handle JSON parsing errors gracefully

### API Response Format

Follow RESTful conventions:

```typescript
// Success responses
{ data: LearningContent | LearningContent[] }

// Error responses
{ error: string, message: string }
```

### Data Validation

Consider adding validation for:

- Required fields (resourceId, productId, name, etc.)
- Field types and formats
- Valid productId references

### Next.js App Router API Routes

- Export named functions: `GET`, `POST`, `PUT`, `DELETE`
- Use `NextRequest` and `NextResponse` from `next/server`
- Handle dynamic route parameters via function parameters

## Testing the API

After implementation, test using:

1. Run `pnpm generate-small-data` to create mock data
2. Start dev server: `pnpm dev`
3. Test endpoints with curl or a REST client:
   ```bash
   curl http://localhost:3000/api/learning
   curl http://localhost:3000/api/learning/learn-001
   ```
4. Run tests: `pnpm test`

## Future Enhancements (Optional)

- Add filtering and sorting to GET collection endpoint
- Implement pagination for large datasets
- Add search functionality
- Validate that `productId` references exist
- Add authentication/authorization
- Implement database storage instead of JSON files
