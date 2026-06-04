# US11: Routing, Navigation & Localization Files

## User Story
**As a** content admin  
**I want** to access the Hippotherapy admin page from the admin panel  
**So that** I can navigate to it easily and see UI text in my preferred language

## Acceptance Criteria
- [ ] Route `/admin-panel/hippotherapy` is registered
- [ ] Route is protected with PrivateRoute (requires authentication)
- [ ] Navigation link appears in admin sidebar/menu
- [ ] Ukrainian localization file contains all admin page UI text
- [ ] English localization file contains all translations
- [ ] All button labels, validation messages, and modal text are localized
- [ ] Page title updates when route is active

## Technical Details

### Files to Modify/Create

1. **src/routes/app-router/AppRouter.tsx**
   ```typescript
   // Add import
   import { HippotherapyAdminPage } from '@/pages/admin/hippotherapy';

   // Add route (inside PrivateRoute section)
   <Route 
     path="/admin-panel/hippotherapy" 
     element={
       <PrivateRoute>
         <HippotherapyAdminPage />
       </PrivateRoute>
     } 
   />
   ```

2. **src/const/common/api-routes/main-api.ts**
   ```typescript
   // Add hippotherapy routes
   export * from './hippotherapy-routes';
   ```

3. **src/locales/uk/hippotherapyAdminPage.json**
   ```json
   {
     "pageTitle": "Іпотерапія",
     "loading": "Завантаження...",
     "sections": {
       "title": "Головний розділ",
       "whatIsHippotherapy": "Що таке іпотерапія",
       "testimonials": "Відгуки",
       "whatIsIpoventia": "Що таке іповенція",
       "centerIpoventia": "В центрі іповенції",
       "whyThisApproach": "Чому цей підхід",
       "whatApproachShows": "Що показує досвід",
       "scientificResearch": "Наукові дослідження",
       "whoProgramsSuit": "Кому підходять програми",
       "principles": "Принципи"
     },
     "fields": {
       "heading": "Заголовок",
       "description": "Опис",
       "additionalDescription": "Додатковий опис",
       "image": "Зображення",
       "name": "Назва",
       "link": "Посилання"
     },
     "buttons": {
       "publish": "Опублікувати",
       "publishing": "Публікація...",
       "add": "Додати +",
       "save": "Зберегти",
       "cancel": "Скасувати",
       "delete": "Видалити",
       "yes": "ТАК",
       "no": "НІ"
     },
     "validation": {
       "required": "Поле обов'язкове",
       "minChars": "Не менше {{count}} символів",
       "maxChars": "Не більше {{count}} символів",
       "invalidFormat": "Невірний формат",
       "invalidUrl": "Невірний URL"
     },
     "images": {
       "recommendedSize": "Рекомендований розмір",
       "uploadPrompt": "Натисніть або перетягніть файл для завантаження",
       "deleteConfirm": "Видалити фото?",
       "cropImage": "Обрізати зображення",
       "errors": {
         "tooLarge": "Зображення не більше 5 Mb",
         "invalidFormat": "Невірний формат фото, дозволено jpeg, jpg, png, webp",
         "tooSmall": "Дозволено розмір картинки не менше рекомендованого"
       }
     },
     "translation": {
       "addTranslation": "Додати переклад",
       "editTranslation": "Редагувати переклад",
       "saveTranslation": "Зберегти переклад",
       "language": "Мова",
       "english": "Англійська",
       "closeWithoutSaving": "Закрити без збереження?",
       "publishFirstTooltip": "Спочатку опублікуйте українську версію"
     },
     "scientificResearch": {
       "listTitle": "Список досліджень",
       "newEntry": "Нова публікація",
       "deleteConfirm": "Видалити наукове дослідження?"
     },
     "modals": {
       "publishConfirm": "Опублікувати зміни?",
       "deleteImageConfirm": "Видалити фото?",
       "deleteReferenceConfirm": "Видалити наукове дослідження?",
       "closeWithoutSaving": "Закрити без збереження?"
     },
     "toasts": {
       "publishSuccess": "Зміни успішно опубліковано",
       "publishError": "Помилка публікації. Спробуйте ще раз",
       "translationSaved": "Переклад опубліковано",
       "translationError": "Помилка збереження. Спробуйте ще раз",
       "imageUploaded": "Зображення завантажено",
       "imageDeleted": "Зображення видалено",
       "imageUploadError": "Помилка завантаження зображення",
       "imageDeleteError": "Помилка видалення зображення",
       "loadError": "Помилка завантаження даних"
     }
   }
   ```

4. **src/locales/en/hippotherapyAdminPage.json**
   ```json
   {
     "pageTitle": "Hippotherapy",
     "loading": "Loading...",
     "sections": {
       "title": "Main Section",
       "whatIsHippotherapy": "What is Hippotherapy",
       "testimonials": "Testimonials",
       "whatIsIpoventia": "What is Ipoventia",
       "centerIpoventia": "Center of Ipoventia",
       "whyThisApproach": "Why This Approach",
       "whatApproachShows": "What the Approach Shows",
       "scientificResearch": "Scientific Research",
       "whoProgramsSuit": "Who the Programs Suit",
       "principles": "Principles"
     },
     "fields": {
       "heading": "Heading",
       "description": "Description",
       "additionalDescription": "Additional Description",
       "image": "Image",
       "name": "Name",
       "link": "Link"
     },
     "buttons": {
       "publish": "Publish",
       "publishing": "Publishing...",
       "add": "Add +",
       "save": "Save",
       "cancel": "Cancel",
       "delete": "Delete",
       "yes": "YES",
       "no": "NO"
     },
     "validation": {
       "required": "Field is required",
       "minChars": "At least {{count}} characters",
       "maxChars": "No more than {{count}} characters",
       "invalidFormat": "Invalid format",
       "invalidUrl": "Invalid URL"
     },
     "images": {
       "recommendedSize": "Recommended size",
       "uploadPrompt": "Click or drag file to upload",
       "deleteConfirm": "Delete photo?",
       "cropImage": "Crop image",
       "errors": {
         "tooLarge": "Image must be no more than 5 MB",
         "invalidFormat": "Invalid photo format, allowed: jpeg, jpg, png, webp",
         "tooSmall": "Image size must be at least the recommended size"
       }
     },
     "translation": {
       "addTranslation": "Add Translation",
       "editTranslation": "Edit Translation",
       "saveTranslation": "Save Translation",
       "language": "Language",
       "english": "English",
       "closeWithoutSaving": "Close without saving?",
       "publishFirstTooltip": "Publish Ukrainian version first"
     },
     "scientificResearch": {
       "listTitle": "Research List",
       "newEntry": "New Publication",
       "deleteConfirm": "Delete scientific research?"
     },
     "modals": {
       "publishConfirm": "Publish changes?",
       "deleteImageConfirm": "Delete photo?",
       "deleteReferenceConfirm": "Delete scientific research?",
       "closeWithoutSaving": "Close without saving?"
     },
     "toasts": {
       "publishSuccess": "Changes successfully published",
       "publishError": "Publishing error. Please try again",
       "translationSaved": "Translation published",
       "translationError": "Save error. Please try again",
       "imageUploaded": "Image uploaded",
       "imageDeleted": "Image deleted",
       "imageUploadError": "Image upload error",
       "imageDeleteError": "Image delete error",
       "loadError": "Data loading error"
     }
   }
   ```

5. **Admin Navigation Component** (if exists)
   - Add link to `/admin-panel/hippotherapy`
   - Add icon (e.g., Horse icon from Material-UI)
   - Add label "Іпотерапія"

## Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

export const HippotherapyAdminPage = () => {
  const { t } = useTranslation('hippotherapyAdminPage');

  return (
    <>
      <Typography variant="h4">{t('pageTitle')}</Typography>
      <Button>{t('buttons.publish')}</Button>
    </>
  );
};
```

## Dependencies
- US10 (main page exists)

## Estimated Effort
**3 hours**

## Checklist
- [ ] Route registered in AppRouter
- [ ] PrivateRoute wrapper applied
- [ ] API routes exported in main-api.ts
- [ ] Ukrainian localization file created
- [ ] English localization file created
- [ ] All UI text keys defined
- [ ] Navigation link added (if navigation component exists)
- [ ] Page accessible via URL
- [ ] Page requires authentication
- [ ] Localization keys used in components

## Definition of Done
- Route works and requires auth
- Navigation link present (if applicable)
- Both localization files complete
- All UI text uses i18n keys
- Language switching works
- Page title updates
- Code review completed
