# TS22: Hippotherapy Admin API Service

## Implements
**Business Stories**: 
- BS01 - Title Section Content Management
- BS02 - What Is Hippotherapy Content
- BS03 - Testimonials Section Management
- BS04 - What Is Ipoventia Content
- BS05 - Center of Ipoventia Section
- BS06 - Why This Approach Content
- BS07 - What This Approach Shows
- BS08 - Scientific Research Management
- BS09 - Who Programs Suit Content
- BS10 - Hippotherapy Principles Section
- BS11 - Admin Page Integration

## Technical Goal
Create comprehensive API service layer for all hippotherapy admin CRUD operations, handling data fetching, updates, image uploads, and publish/draft workflows with type safety.

## Acceptance Criteria
- [ ] Service provides get methods for all 10 sections
- [ ] Service provides update methods for all 10 sections
- [ ] Service supports publish and draft modes (isPublished flag)
- [ ] Service handles image uploads with multipart/form-data
- [ ] Service uses authenticated admin client
- [ ] Service provides TypeScript interfaces for all data structures
- [ ] Service handles API errors with user-friendly messages
- [ ] Service supports optimistic updates with rollback
- [ ] Service validates data before sending to backend
- [ ] Service includes retry logic for network failures
- [ ] Service provides batch operations (get all sections at once)
- [ ] Service follows REST conventions
- [ ] Service integrates with toast context for user feedback
- [ ] Service is fully tested with mock backend

## Implementation Details

### Files to Create
- `src/services/api/admin/hippotherapy-admin-service.ts`
- `src/services/api/admin/hippotherapy-admin-service.test.ts`

### Code Example

**hippotherapy-admin-service.ts**:
```typescript
import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
  TitleSectionData,
  WhatIsHippotherapyData,
  TestimonialsData,
  WhatIsIpoventiaData,
  CenterOfIpoventiaData,
  WhyThisApproachData,
  WhoProgramsSuitData,
  ScientificResearchData,
  PrinciplesData,
} from '@/types/admin/hippotherapy.types';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/**
 * Hippotherapy Admin API Service
 * Handles all CRUD operations for hippotherapy sections
 */
export class HippotherapyAdminService {
  private adminClient: AxiosInstance;
  private baseUrl = `${API_ROUTES.ADMIN.HIPPOTHERAPY}`;

  constructor(adminClient: AxiosInstance) {
    this.adminClient = adminClient;
  }

  // ============================================
  // Title Section
  // ============================================

  async getTitleSection(): Promise<TitleSectionData> {
    try {
      const response = await this.adminClient.get<ApiResponse<TitleSectionData>>(
        `${this.baseUrl}/title`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch title section:', error);
      throw new Error('Failed to fetch title section');
    }
  }

  async updateTitleSection(
    data: TitleSectionData,
    isPublished: boolean
  ): Promise<TitleSectionData> {
    try {
      const formData = new FormData();
      formData.append('heading', data.heading);
      formData.append('description', data.description);
      formData.append('isPublished', String(isPublished));
      
      if (data.image instanceof File) {
        formData.append('image', data.image);
      }

      const response = await this.adminClient.put<ApiResponse<TitleSectionData>>(
        `${this.baseUrl}/title`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to update title section:', error);
      throw new Error('Failed to update title section');
    }
  }

  // ============================================
  // What Is Hippotherapy Section
  // ============================================

  async getWhatIsHippotherapySection(): Promise<WhatIsHippotherapyData> {
    try {
      const response = await this.adminClient.get<ApiResponse<WhatIsHippotherapyData>>(
        `${this.baseUrl}/what-is-hippotherapy`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch what is hippotherapy section:', error);
      throw new Error('Failed to fetch what is hippotherapy section');
    }
  }

  async updateWhatIsHippotherapySection(
    data: WhatIsHippotherapyData,
    isPublished: boolean
  ): Promise<WhatIsHippotherapyData> {
    try {
      const formData = new FormData();
      formData.append('heading', data.heading);
      formData.append('description', data.description);
      formData.append('isPublished', String(isPublished));
      
      if (data.image instanceof File) {
        formData.append('image', data.image);
      }

      const response = await this.adminClient.put<ApiResponse<WhatIsHippotherapyData>>(
        `${this.baseUrl}/what-is-hippotherapy`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to update what is hippotherapy section:', error);
      throw new Error('Failed to update what is hippotherapy section');
    }
  }

  // ============================================
  // Testimonials Section
  // ============================================

  async getTestimonialsSection(): Promise<TestimonialsData> {
    try {
      const response = await this.adminClient.get<ApiResponse<TestimonialsData>>(
        `${this.baseUrl}/testimonials`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch testimonials section:', error);
      throw new Error('Failed to fetch testimonials section');
    }
  }

  async updateTestimonialsSection(
    data: TestimonialsData,
    isPublished: boolean
  ): Promise<TestimonialsData> {
    try {
      const formData = new FormData();
      formData.append('isPublished', String(isPublished));
      
      // Handle array of testimonials
      data.testimonials.forEach((testimonial, index) => {
        formData.append(`testimonials[${index}][personName]`, testimonial.personName);
        formData.append(`testimonials[${index}][text]`, testimonial.text);
        
        if (testimonial.image instanceof File) {
          formData.append(`testimonials[${index}][image]`, testimonial.image);
        }
      });

      const response = await this.adminClient.put<ApiResponse<TestimonialsData>>(
        `${this.baseUrl}/testimonials`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to update testimonials section:', error);
      throw new Error('Failed to update testimonials section');
    }
  }

  // ============================================
  // What Is Ipoventia Section
  // ============================================

  async getWhatIsIpoventiaSection(): Promise<WhatIsIpoventiaData> {
    try {
      const response = await this.adminClient.get<ApiResponse<WhatIsIpoventiaData>>(
        `${this.baseUrl}/what-is-ipoventia`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch what is ipoventia section:', error);
      throw new Error('Failed to fetch what is ipoventia section');
    }
  }

  async updateWhatIsIpoventiaSection(
    data: WhatIsIpoventiaData,
    isPublished: boolean
  ): Promise<WhatIsIpoventiaData> {
    try {
      const response = await this.adminClient.put<ApiResponse<WhatIsIpoventiaData>>(
        `${this.baseUrl}/what-is-ipoventia`,
        { ...data, isPublished }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to update what is ipoventia section:', error);
      throw new Error('Failed to update what is ipoventia section');
    }
  }

  // ============================================
  // Center of Ipoventia Section
  // ============================================

  async getCenterOfIpoventiaSection(): Promise<CenterOfIpoventiaData> {
    try {
      const response = await this.adminClient.get<ApiResponse<CenterOfIpoventiaData>>(
        `${this.baseUrl}/center-of-ipoventia`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch center of ipoventia section:', error);
      throw new Error('Failed to fetch center of ipoventia section');
    }
  }

  async updateCenterOfIpoventiaSection(
    data: CenterOfIpoventiaData,
    isPublished: boolean
  ): Promise<CenterOfIpoventiaData> {
    try {
      const formData = new FormData();
      formData.append('heading', data.heading);
      formData.append('description', data.description);
      formData.append('isPublished', String(isPublished));
      
      if (data.image instanceof File) {
        formData.append('image', data.image);
      }

      const response = await this.adminClient.put<ApiResponse<CenterOfIpoventiaData>>(
        `${this.baseUrl}/center-of-ipoventia`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to update center of ipoventia section:', error);
      throw new Error('Failed to update center of ipoventia section');
    }
  }

  // ============================================
  // Why This Approach Section
  // ============================================

  async getWhyThisApproachSection(): Promise<WhyThisApproachData> {
    try {
      const response = await this.adminClient.get<ApiResponse<WhyThisApproachData>>(
        `${this.baseUrl}/why-this-approach`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch why this approach section:', error);
      throw new Error('Failed to fetch why this approach section');
    }
  }

  async updateWhyThisApproachSection(
    data: WhyThisApproachData,
    isPublished: boolean
  ): Promise<WhyThisApproachData> {
    try {
      const formData = new FormData();
      formData.append('heading', data.heading);
      formData.append('description', data.description);
      formData.append('isPublished', String(isPublished));
      
      if (data.imageLeft instanceof File) {
        formData.append('imageLeft', data.imageLeft);
      }
      if (data.imageRight instanceof File) {
        formData.append('imageRight', data.imageRight);
      }

      const response = await this.adminClient.put<ApiResponse<WhyThisApproachData>>(
        `${this.baseUrl}/why-this-approach`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to update why this approach section:', error);
      throw new Error('Failed to update why this approach section');
    }
  }

  // ============================================
  // Who Programs Suit Section
  // ============================================

  async getWhoProgramsSuitSection(): Promise<WhoProgramsSuitData> {
    try {
      const response = await this.adminClient.get<ApiResponse<WhoProgramsSuitData>>(
        `${this.baseUrl}/who-programs-suit`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch who programs suit section:', error);
      throw new Error('Failed to fetch who programs suit section');
    }
  }

  async updateWhoProgramsSuitSection(
    data: WhoProgramsSuitData,
    isPublished: boolean
  ): Promise<WhoProgramsSuitData> {
    try {
      const formData = new FormData();
      formData.append('heading', data.heading);
      formData.append('description', data.description);
      formData.append('isPublished', String(isPublished));
      
      if (data.imageLeft instanceof File) {
        formData.append('imageLeft', data.imageLeft);
      }
      if (data.imageRight instanceof File) {
        formData.append('imageRight', data.imageRight);
      }

      const response = await this.adminClient.put<ApiResponse<WhoProgramsSuitData>>(
        `${this.baseUrl}/who-programs-suit`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to update who programs suit section:', error);
      throw new Error('Failed to update who programs suit section');
    }
  }

  // ============================================
  // Scientific Research Section
  // ============================================

  async getScientificResearchSection(): Promise<ScientificResearchData> {
    try {
      const response = await this.adminClient.get<ApiResponse<ScientificResearchData>>(
        `${this.baseUrl}/scientific-research`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch scientific research section:', error);
      throw new Error('Failed to fetch scientific research section');
    }
  }

  async updateScientificResearchSection(
    data: ScientificResearchData,
    isPublished: boolean
  ): Promise<ScientificResearchData> {
    try {
      const formData = new FormData();
      formData.append('generalText', data.generalText);
      formData.append('isPublished', String(isPublished));
      
      data.researchEntries.forEach((entry, index) => {
        formData.append(`researchEntries[${index}][title]`, entry.title);
        formData.append(`researchEntries[${index}][description]`, entry.description);
        formData.append(`researchEntries[${index}][link]`, entry.link);
        
        if (entry.image instanceof File) {
          formData.append(`researchEntries[${index}][image]`, entry.image);
        }
      });

      const response = await this.adminClient.put<ApiResponse<ScientificResearchData>>(
        `${this.baseUrl}/scientific-research`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to update scientific research section:', error);
      throw new Error('Failed to update scientific research section');
    }
  }

  // ============================================
  // Principles Section
  // ============================================

  async getPrinciplesSection(): Promise<PrinciplesData> {
    try {
      const response = await this.adminClient.get<ApiResponse<PrinciplesData>>(
        `${this.baseUrl}/principles`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch principles section:', error);
      throw new Error('Failed to fetch principles section');
    }
  }

  async updatePrinciplesSection(
    data: PrinciplesData,
    isPublished: boolean
  ): Promise<PrinciplesData> {
    try {
      const response = await this.adminClient.put<ApiResponse<PrinciplesData>>(
        `${this.baseUrl}/principles`,
        { ...data, isPublished }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to update principles section:', error);
      throw new Error('Failed to update principles section');
    }
  }
}
```

### Architecture Decisions
- Class-based service for encapsulation
- Separate get/update methods for each section
- Handle image uploads with FormData
- Type-safe with TypeScript interfaces
- Consistent error handling pattern
- Follow REST conventions

## Test Cases

### Unit Tests
- Test all get methods fetch correct endpoints
- Test all update methods send correct data
- Test FormData construction for image uploads
- Test error handling for all methods
- Test isPublished flag in requests

### Integration Tests
- Test service with mock backend
- Test authentication integration
- Test image upload end-to-end

## Dependencies

**Technical Dependencies**:
- TS01: Foundation Types (must complete first)
- useAdminClient hook (existing)

**Business Context**: ALL business stories (BS01-BS11)

## Estimated Effort

**4 hours**

- Service implementation: 2.5 hours
- Error handling: 0.5 hours
- Test cases: 1 hour

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All CRUD methods implemented
- [ ] Unit tests passing (>90% coverage)
- [ ] Code reviewed and approved
- [ ] No lint warnings
