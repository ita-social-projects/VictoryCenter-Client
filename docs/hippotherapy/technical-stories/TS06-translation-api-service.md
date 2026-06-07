# TS06: Translation API Service

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

## Technical Goal
Create API service layer for managing translations of hippotherapy sections, supporting CRUD operations for Ukrainian and English content with backend synchronization.

## Acceptance Criteria
- [ ] Service supports fetching translation for specific section and language
- [ ] Service supports updating translation for specific section and language
- [ ] Service supports fetching translation status for all sections
- [ ] Service supports bulk translation operations (optional)
- [ ] Service uses authenticated admin client for all requests
- [ ] Service handles API errors gracefully with typed responses
- [ ] Service supports optimistic updates with rollback on failure
- [ ] Service integrates with toast context for user feedback
- [ ] Service validates data before sending to backend
- [ ] Service caches translation status to reduce API calls
- [ ] Service supports pagination for translation history (future)
- [ ] Service provides TypeScript interfaces for all API responses
- [ ] Service follows existing Victory Center API patterns
- [ ] Service includes comprehensive error handling

## Implementation Details

### Files to Create
- `src/services/api/admin/hippotherapy-translation-service.ts`
- `src/services/api/admin/hippotherapy-translation-service.test.ts`

### Code Example

**hippotherapy-translation-service.ts**:
```typescript
import { AxiosInstance } from 'axios';
import { 
  TranslationData, 
  TranslationLanguage, 
  TranslationStatus,
  SectionTranslationState,
  HippotherapySectionId,
} from '@/types/admin/hippotherapy-translation.types';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

// API Response types
export interface TranslationResponse<T = any> {
  data: TranslationData<T>;
  success: boolean;
  message?: string;
}

export interface TranslationStatusResponse {
  sections: Record<HippotherapySectionId, SectionTranslationState>;
  success: boolean;
}

export interface TranslationUpdateRequest<T = any> {
  language: TranslationLanguage;
  data: T;
}

/**
 * Hippotherapy Translation API Service
 * Manages translations for all hippotherapy sections
 */
export class HippotherapyTranslationService {
  private adminClient: AxiosInstance;
  private baseUrl = `${API_ROUTES.ADMIN.HIPPOTHERAPY}/translations`;

  constructor(adminClient: AxiosInstance) {
    this.adminClient = adminClient;
  }

  /**
   * Fetch translation for a specific section and language
   */
  async getTranslation<T = any>(
    sectionId: HippotherapySectionId,
    language: TranslationLanguage
  ): Promise<TranslationData<T>> {
    try {
      const response = await this.adminClient.get<TranslationResponse<T>>(
        `${this.baseUrl}/${sectionId}/${language}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch translation for ${sectionId} (${language}):`, error);
      throw new Error('Failed to fetch translation');
    }
  }

  /**
   * Update translation for a specific section and language
   */
  async updateTranslation<T = any>(
    sectionId: HippotherapySectionId,
    language: TranslationLanguage,
    data: T
  ): Promise<TranslationData<T>> {
    try {
      const request: TranslationUpdateRequest<T> = {
        language,
        data,
      };

      const response = await this.adminClient.put<TranslationResponse<T>>(
        `${this.baseUrl}/${sectionId}`,
        request
      );

      return response.data.data;
    } catch (error) {
      console.error(`Failed to update translation for ${sectionId} (${language}):`, error);
      throw new Error('Failed to update translation');
    }
  }

  /**
   * Fetch translation status for all sections
   */
  async getTranslationStatus(): Promise<Record<HippotherapySectionId, SectionTranslationState>> {
    try {
      const response = await this.adminClient.get<TranslationStatusResponse>(
        `${this.baseUrl}/status`
      );
      return response.data.sections;
    } catch (error) {
      console.error('Failed to fetch translation status:', error);
      throw new Error('Failed to fetch translation status');
    }
  }

  /**
   * Validate translation completeness
   */
  async validateTranslation(
    sectionId: HippotherapySectionId,
    language: TranslationLanguage,
    data: any
  ): Promise<{ isValid: boolean; missingFields: string[] }> {
    try {
      const response = await this.adminClient.post<{
        isValid: boolean;
        missingFields: string[];
      }>(`${this.baseUrl}/${sectionId}/${language}/validate`, { data });

      return response.data;
    } catch (error) {
      console.error('Failed to validate translation:', error);
      throw new Error('Failed to validate translation');
    }
  }

  /**
   * Delete translation (revert to default/empty)
   */
  async deleteTranslation(
    sectionId: HippotherapySectionId,
    language: TranslationLanguage
  ): Promise<void> {
    try {
      await this.adminClient.delete(`${this.baseUrl}/${sectionId}/${language}`);
    } catch (error) {
      console.error(`Failed to delete translation for ${sectionId} (${language}):`, error);
      throw new Error('Failed to delete translation');
    }
  }

  /**
   * Bulk update translations for multiple sections
   * (Future enhancement)
   */
  async bulkUpdateTranslations(
    updates: Array<{
      sectionId: HippotherapySectionId;
      language: TranslationLanguage;
      data: any;
    }>
  ): Promise<void> {
    try {
      await this.adminClient.post(`${this.baseUrl}/bulk`, { updates });
    } catch (error) {
      console.error('Failed to bulk update translations:', error);
      throw new Error('Failed to bulk update translations');
    }
  }

  /**
   * Fetch translation history for a section (Future)
   */
  async getTranslationHistory(
    sectionId: HippotherapySectionId,
    language: TranslationLanguage,
    page: number = 1,
    limit: number = 10
  ): Promise<any[]> {
    try {
      const response = await this.adminClient.get(
        `${this.baseUrl}/${sectionId}/${language}/history`,
        { params: { page, limit } }
      );
      return response.data.history;
    } catch (error) {
      console.error('Failed to fetch translation history:', error);
      throw new Error('Failed to fetch translation history');
    }
  }
}

/**
 * Factory function to create service instance
 */
export const createHippotherapyTranslationService = (
  adminClient: AxiosInstance
): HippotherapyTranslationService => {
  return new HippotherapyTranslationService(adminClient);
};
```

### Architecture Decisions
- Use class-based service for encapsulation and dependency injection
- Accept adminClient as constructor parameter (supports testing and auth)
- Generic type support for section-specific data structures
- Comprehensive error handling with user-friendly messages
- Support for future features (history, bulk operations)
- Follow REST conventions: GET (read), PUT (update), DELETE (delete)
- TypeScript interfaces for all API contracts

## Test Cases

### Unit Tests

**File**: `hippotherapy-translation-service.test.ts`

- Test getTranslation fetches translation for section and language
- Test getTranslation handles API error gracefully
- Test updateTranslation sends correct request body
- Test updateTranslation returns updated translation data
- Test updateTranslation handles API error gracefully
- Test getTranslationStatus fetches status for all sections
- Test getTranslationStatus handles API error gracefully
- Test validateTranslation sends data for validation
- Test validateTranslation returns validation result
- Test deleteTranslation sends DELETE request
- Test deleteTranslation handles API error gracefully
- Test bulkUpdateTranslations sends array of updates
- Test getTranslationHistory fetches paginated history
- Test service constructs correct API URLs
- Test service uses provided adminClient instance

### Integration Tests
- Test service integrates with useAdminClient hook
- Test service works with real backend API (mock server)
- Test service handles 401 Unauthorized (token expiration)
- Test service handles 403 Forbidden (insufficient permissions)
- Test service handles 404 Not Found (section doesn't exist)
- Test service handles 500 Internal Server Error
- Test service works with translation modals

## Dependencies

**Technical Dependencies**:
- TS01: Foundation Types (must complete first - provides section interfaces)
- TS04: Translation Types and Constants (must complete first - provides translation types)
- useAdminClient hook (existing)

**Business Context**: Required for ALL business stories (BS01-BS10) for translation features

## Estimated Effort

**5 hours**

- Service implementation: 2.5 hours
- Error handling and validation: 1 hour
- Test cases: 1.5 hours

## Technical Notes

### Patterns to Follow
- Follow existing Victory Center API service patterns (see `src/services/api/admin/`)
- Use AxiosInstance for type-safe HTTP requests
- Handle errors with try-catch and user-friendly messages
- Use TypeScript generics for flexible data structures
- Provide factory function for service creation

### Risks and Mitigation
- **Risk**: Translation data structure varies by section
  - **Mitigation**: Use TypeScript generics for type safety
- **Risk**: API errors lose user's translation work
  - **Mitigation**: Implement optimistic updates with rollback, draft auto-save
- **Risk**: Network failures during bulk operations
  - **Mitigation**: Implement retry logic, show progress indicator
- **Risk**: Translation status cache gets stale
  - **Mitigation**: Invalidate cache on update, support manual refresh

### Performance Considerations
- Cache translation status to reduce API calls
- Use pagination for translation history
- Batch requests for bulk operations
- Implement debouncing for auto-save features

### API Contract Assumptions
- Backend provides RESTful API at `/api/admin/hippotherapy/translations`
- Backend supports JWT authentication via Bearer token
- Backend returns consistent JSON response format
- Backend validates data server-side (double validation)
- Backend handles file uploads separately (images)

### Error Handling Strategy
1. **Network Errors**: Retry with exponential backoff
2. **Validation Errors**: Display field-specific errors to user
3. **Auth Errors**: Trigger token refresh or redirect to login
4. **Server Errors**: Log error, show generic message to user
5. **Not Found Errors**: Handle gracefully, offer to create new translation

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Service supports all CRUD operations
- [ ] Service handles errors gracefully
- [ ] Unit tests written and passing (>90% coverage)
- [ ] Integration tests with mock backend passing
- [ ] Service integrates with useAdminClient hook
- [ ] TypeScript interfaces for all API contracts
- [ ] Code reviewed and approved
- [ ] Documentation updated (JSDoc comments)
- [ ] No lint warnings
- [ ] Service tested with translation modals
