# US03: API Service Layer

## User Story
**As a** developer  
**I want** service functions to handle all API communication for Hippotherapy data  
**So that** components can easily fetch, update, and manage Hippotherapy content

## Acceptance Criteria
- [ ] Main API service handles CRUD operations for Hippotherapy data
- [ ] Translation API service handles localization operations
- [ ] Image upload/delete endpoints are implemented
- [ ] Scientific references CRUD endpoints are implemented
- [ ] All services use the authenticated admin client
- [ ] Mock data fallback is available for development
- [ ] Error handling is consistent with project patterns
- [ ] API routes are centralized in constants

## Technical Details

### Files to Create

1. **src/const/common/api-routes/hippotherapy-routes.ts**
   ```typescript
   export const HIPPOTHERAPY_ROUTES = {
     BASE: '/hippotherapy',
     GET_DATA: '/hippotherapy',
     UPDATE: '/hippotherapy',
     IMAGES: '/hippotherapy/images',
     DELETE_IMAGE: (imageId: string) => `/hippotherapy/images/${imageId}`,
     
     // Scientific references
     REFERENCES: '/hippotherapy/scientific-references',
     REFERENCE_BY_ID: (id: string) => `/hippotherapy/scientific-references/${id}`,
     
     // Translations
     TRANSLATIONS: (locale: string) => `/hippotherapy/translations/${locale}`,
     TRANSLATION_BY_SECTION: (locale: string, sectionId: string) => 
       `/hippotherapy/translations/${locale}/${sectionId}`,
     TRANSLATION_STATUS: '/hippotherapy/translations/status'
   };
   ```

2. **src/services/api/admin/hippotherapy-admin-service.ts**
   ```typescript
   import { AxiosInstance } from 'axios';
   import { HIPPOTHERAPY_ROUTES } from '@/const/common/api-routes/hippotherapy-routes';
   import { 
     HippotherapyData, 
     ScientificReference 
   } from '@/types/admin/hippotherapy.types';

   /**
    * Fetches all Hippotherapy page data
    */
   export const getHippotherapyData = async (
     adminClient: AxiosInstance
   ): Promise<HippotherapyData> => {
     // TODO: Replace with real API call when backend is ready
     const response = await adminClient.get(HIPPOTHERAPY_ROUTES.GET_DATA);
     return response.data;
     
     // Mock fallback for development
     // return mockHippotherapyData;
   };

   /**
    * Updates Hippotherapy page data
    */
   export const updateHippotherapyData = async (
     adminClient: AxiosInstance,
     data: Partial<HippotherapyData>
   ): Promise<void> => {
     // TODO: Replace with real API call when backend is ready
     await adminClient.put(HIPPOTHERAPY_ROUTES.UPDATE, data);
   };

   /**
    * Uploads an image for a specific section
    */
   export const uploadHippotherapyImage = async (
     adminClient: AxiosInstance,
     file: File,
     sectionId: string
   ): Promise<string> => {
     // TODO: Replace with real API call when backend is ready
     const formData = new FormData();
     formData.append('image', file);
     formData.append('sectionId', sectionId);

     const response = await adminClient.post(
       HIPPOTHERAPY_ROUTES.IMAGES,
       formData,
       {
         headers: { 'Content-Type': 'multipart/form-data' }
       }
     );

     return response.data.url;
   };

   /**
    * Deletes an image
    */
   export const deleteHippotherapyImage = async (
     adminClient: AxiosInstance,
     imageId: string
   ): Promise<void> => {
     // TODO: Replace with real API call when backend is ready
     await adminClient.delete(HIPPOTHERAPY_ROUTES.DELETE_IMAGE(imageId));
   };

   /**
    * Creates a new scientific reference
    */
   export const createScientificReference = async (
     adminClient: AxiosInstance,
     reference: Omit<ScientificReference, 'id'>
   ): Promise<ScientificReference> => {
     // TODO: Replace with real API call when backend is ready
     const response = await adminClient.post(
       HIPPOTHERAPY_ROUTES.REFERENCES,
       reference
     );
     return response.data;
   };

   /**
    * Updates an existing scientific reference
    */
   export const updateScientificReference = async (
     adminClient: AxiosInstance,
     id: string,
     reference: Partial<ScientificReference>
   ): Promise<void> => {
     // TODO: Replace with real API call when backend is ready
     await adminClient.put(
       HIPPOTHERAPY_ROUTES.REFERENCE_BY_ID(id),
       reference
     );
   };

   /**
    * Deletes a scientific reference
    */
   export const deleteScientificReference = async (
     adminClient: AxiosInstance,
     id: string
   ): Promise<void> => {
     // TODO: Replace with real API call when backend is ready
     await adminClient.delete(HIPPOTHERAPY_ROUTES.REFERENCE_BY_ID(id));
   };
   ```

3. **src/services/api/admin/hippotherapy-translation-service.ts**
   ```typescript
   import { AxiosInstance } from 'axios';
   import { HIPPOTHERAPY_ROUTES } from '@/const/common/api-routes/hippotherapy-routes';

   export interface TranslationData {
     locale: string;
     sectionId: string;
     fields: Record<string, string>;
     savedAt: string | null;
   }

   export interface SectionTranslationStatus {
     sectionId: string;
     isUkrainianPublished: boolean;
     hasEnglishTranslation: boolean;
     lastUkrainianPublishedAt: string | null;
   }

   /**
    * Fetches translation for a specific section
    */
   export const getTranslation = async (
     adminClient: AxiosInstance,
     locale: string,
     sectionId: string
   ): Promise<TranslationData | null> => {
     // TODO: Replace with real API call when backend is ready
     try {
       const response = await adminClient.get(
         HIPPOTHERAPY_ROUTES.TRANSLATION_BY_SECTION(locale, sectionId)
       );
       return response.data;
     } catch (error) {
       // Return null if translation doesn't exist yet
       return null;
     }
   };

   /**
    * Saves or updates a translation
    */
   export const saveTranslation = async (
     adminClient: AxiosInstance,
     locale: string,
     sectionId: string,
     fields: Record<string, string>,
     isNew: boolean
   ): Promise<void> => {
     // TODO: Replace with real API call when backend is ready
     const data = { locale, sectionId, fields };

     if (isNew) {
       await adminClient.post(
         HIPPOTHERAPY_ROUTES.TRANSLATION_BY_SECTION(locale, sectionId),
         data
       );
     } else {
       await adminClient.put(
         HIPPOTHERAPY_ROUTES.TRANSLATION_BY_SECTION(locale, sectionId),
         data
       );
     }
   };

   /**
    * Checks if Ukrainian content is published for a section
    */
   export const checkUkrainianPublished = async (
     adminClient: AxiosInstance,
     sectionId: string
   ): Promise<boolean> => {
     // TODO: Replace with real API call when backend is ready
     const response = await adminClient.get(HIPPOTHERAPY_ROUTES.TRANSLATION_STATUS);
     const statuses: SectionTranslationStatus[] = response.data;
     
     const status = statuses.find(s => s.sectionId === sectionId);
     return status?.isUkrainianPublished ?? false;
   };

   /**
    * Fetches translation status for all sections
    */
   export const getTranslationStatuses = async (
     adminClient: AxiosInstance
   ): Promise<SectionTranslationStatus[]> => {
     // TODO: Replace with real API call when backend is ready
     const response = await adminClient.get(HIPPOTHERAPY_ROUTES.TRANSLATION_STATUS);
     return response.data;
   };
   ```

4. **src/utils/mock-data/hippotherapy-mock-data.ts** (optional, for development)
   ```typescript
   import { HippotherapyData } from '@/types/admin/hippotherapy.types';

   export const mockHippotherapyData: HippotherapyData = {
     title: {
       heading: 'Іпотерапія',
       description: 'Ласкаво просимо до нашого центру іпотерапії',
       image: {
         url: '/assets/images/default-hero.jpg',
         isDefault: true
       }
     },
     // ... mock data for all sections
   };
   ```

## Dependencies
- US01 (types)

## Estimated Effort
**6 hours**

## Risks & Mitigation
⚠️ **High Risk**: Backend API endpoints may not exist yet
- **Mitigation**: Use mock data during development
- **Mitigation**: Document API contract for backend team
- **Mitigation**: Add TODO comments for real API calls

## API Contract Documentation

Create `docs/hippotherapy/API-Contract.md` with expected request/response formats:

```markdown
# Hippotherapy API Contract

## GET /api/hippotherapy
Returns all page content in Ukrainian

## PUT /api/hippotherapy
Updates page content (publishes changes)

## POST /api/hippotherapy/images
Uploads an image, returns URL

## Scientific References
- GET /api/hippotherapy/scientific-references
- POST /api/hippotherapy/scientific-references
- PUT /api/hippotherapy/scientific-references/:id
- DELETE /api/hippotherapy/scientific-references/:id

## Translations
- GET /api/hippotherapy/translations/:locale/:sectionId
- POST /api/hippotherapy/translations/:locale/:sectionId
- PUT /api/hippotherapy/translations/:locale/:sectionId
- GET /api/hippotherapy/translations/status
```

## Testing Requirements
- Mock API responses for development
- Error handling for network failures
- Proper authorization headers via adminClient
- Test with real backend when available

## Definition of Done
- All service functions implemented
- API routes centralized in constants
- TODO comments added for real API calls
- Mock data available for development
- Error handling follows project patterns
- Code review completed
- No ESLint warnings
- API contract documentation created
