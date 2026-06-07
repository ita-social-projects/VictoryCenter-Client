# TS47: i18n Localization Files

## Implements
**Business Stories**: BS01-BS11 (all stories)

## Technical Goal
Create comprehensive i18n translation files for all hippotherapy admin UI strings in Ukrainian (default) and English.

## Acceptance Criteria
- [ ] Ukrainian translations file created (`locales/uk/hippotherapyAdmin.json`)
- [ ] English translations file created (`locales/en/hippotherapyAdmin.json`)
- [ ] All UI strings externalized (no hard-coded strings in components)
- [ ] Translations for page title and breadcrumbs
- [ ] Translations for all section names
- [ ] Translations for all form labels and placeholders
- [ ] Translations for validation error messages
- [ ] Translations for button labels (Save, Publish, Cancel, etc.)
- [ ] Translations for toast notifications
- [ ] Translations for confirmation modal messages
- [ ] Translations for translation modal UI
- [ ] Translations for accessibility labels (ARIA)

## Implementation Details

### Files to Create
- `src/locales/uk/hippotherapyAdmin.json`
- `src/locales/en/hippotherapyAdmin.json`

### Code Example

**locales/uk/hippotherapyAdmin.json**:
```json
{
  "page": {
    "title": "Іпотерапія",
    "loading": "Завантаження...",
    "error": "Помилка завантаження даних",
    "retry": "Спробувати знову",
    "saveDraft": "Зберегти чернетку",
    "publishAll": "Опублікувати все",
    "autoSaved": "Автоматично збережено",
    "publishSuccess": "Успішно опубліковано",
    "publishError": "Помилка публікації",
    "draftSaved": "Чернетку збережено",
    "draftError": "Помилка збереження чернетки",
    "unsavedChangesTitle": "Незбережені зміни",
    "unsavedChangesMessage": "У вас є незбережені зміни. Ви впевнені, що хочете продовжити?"
  },
  "breadcrumbs": {
    "home": "Головна",
    "hippotherapy": "Іпотерапія"
  },
  "sections": {
    "title": "Заголовок",
    "whatIsHippotherapy": "Що таке іпотерапія",
    "testimonials": "Відгуки",
    "whatIsIpoventia": "Що таке іповенція",
    "centerOfIpoventia": "Центр іповенції",
    "whyThisApproach": "Чому цей підхід",
    "whoProgramsSuit": "Кому підходять програми",
    "scientificResearch": "Наукові дослідження",
    "principles": "Принципи"
  },
  "fields": {
    "heading": "Заголовок",
    "description": "Опис",
    "image": "Зображення",
    "imageLeft": "Зображення ліворуч",
    "imageRight": "Зображення праворуч",
    "personName": "Ім'я особи",
    "text": "Текст",
    "generalText": "Загальний текст",
    "title": "Назва",
    "link": "Посилання",
    "placeholder": {
      "heading": "Введіть заголовок...",
      "description": "Введіть опис...",
      "personName": "Введіть ім'я...",
      "text": "Введіть текст...",
      "link": "Введіть URL..."
    }
  },
  "validation": {
    "required": "Це поле є обов'язковим",
    "maxLength": "Максимальна довжина: {{max}} символів",
    "minLength": "Мінімальна довжина: {{min}} символів",
    "invalidUrl": "Невірний формат URL",
    "invalidImageType": "Тип зображення має бути JPG, PNG або WebP",
    "imageTooLarge": "Розмір зображення не повинен перевищувати {{maxSize}} МБ",
    "minArrayLength": "Мінімальна кількість елементів: {{min}}",
    "maxArrayLength": "Максимальна кількість елементів: {{max}}"
  },
  "buttons": {
    "save": "Зберегти",
    "cancel": "Скасувати",
    "publish": "Опублікувати",
    "unpublish": "Скасувати публікацію",
    "saveDraft": "Зберегти чернетку",
    "add": "Додати",
    "remove": "Видалити",
    "edit": "Редагувати",
    "delete": "Видалити",
    "confirm": "Підтвердити",
    "close": "Закрити"
  },
  "toast": {
    "saveSuccess": "Успішно збережено",
    "saveError": "Помилка збереження",
    "deleteSuccess": "Успішно видалено",
    "deleteError": "Помилка видалення",
    "publishSuccess": "Успішно опубліковано",
    "publishError": "Помилка публікації",
    "unpublishSuccess": "Публікацію скасовано",
    "unpublishError": "Помилка скасування публікації",
    "uploadSuccess": "Зображення завантажено",
    "uploadError": "Помилка завантаження зображення"
  },
  "confirmationModal": {
    "dontAskAgain": "Більше не запитувати",
    "cancel": "Скасувати",
    "confirm": "Підтвердити",
    "processing": "Обробка..."
  },
  "publishButton": {
    "publish": "Опублікувати",
    "unpublish": "Скасувати публікацію",
    "processing": "Обробка...",
    "publishedTooltip": "Опубліковано {{date}}",
    "draftTooltip": "Чернетка (не опубліковано)",
    "publishModalTitle": "Підтвердження публікації",
    "publishModalMessage": "Ви впевнені, що хочете опублікувати цей розділ?",
    "unpublishModalTitle": "Скасування публікації",
    "unpublishModalMessage": "Ви впевнені, що хочете скасувати публікацію цього розділу?"
  },
  "imageUpload": {
    "dropzoneLabel": "Перетягніть зображення або натисніть для вибору",
    "dragAndDrop": "Перетягніть зображення сюди",
    "or": "або",
    "browse": "Вибрати файл",
    "replaceImage": "Замінити зображення",
    "removeImage": "Видалити зображення",
    "errors": {
      "invalidType": "Невірний тип файлу. Дозволені: JPG, PNG, WebP",
      "tooLarge": "Файл завеликий. Максимум: {{maxSize}} МБ"
    }
  },
  "translation": {
    "language": {
      "uk": "Українська",
      "en": "Англійська"
    },
    "status": {
      "complete": "Завершено",
      "incomplete": "Не завершено",
      "notStarted": "Не розпочато"
    }
  },
  "translationIcon": {
    "tooltip": "{{language}}: {{status}} ({{percentage}}%)"
  },
  "translationModal": {
    "title": "Переклад: {{section}} ({{language}})",
    "cancel": "Скасувати",
    "save": "Зберегти",
    "saving": "Збереження...",
    "unsavedChanges": "У вас є незбережені зміни. Ви впевнені, що хочете закрити?"
  }
}
```

**locales/en/hippotherapyAdmin.json**:
```json
{
  "page": {
    "title": "Hippotherapy",
    "loading": "Loading...",
    "error": "Error loading data",
    "retry": "Retry",
    "saveDraft": "Save Draft",
    "publishAll": "Publish All",
    "autoSaved": "Auto-saved",
    "publishSuccess": "Successfully published",
    "publishError": "Publish error",
    "draftSaved": "Draft saved",
    "draftError": "Draft save error",
    "unsavedChangesTitle": "Unsaved Changes",
    "unsavedChangesMessage": "You have unsaved changes. Are you sure you want to continue?"
  },
  "breadcrumbs": {
    "home": "Home",
    "hippotherapy": "Hippotherapy"
  },
  "sections": {
    "title": "Title",
    "whatIsHippotherapy": "What is Hippotherapy",
    "testimonials": "Testimonials",
    "whatIsIpoventia": "What is Ipoventia",
    "centerOfIpoventia": "Center of Ipoventia",
    "whyThisApproach": "Why This Approach",
    "whoProgramsSuit": "Who Programs Suit",
    "scientificResearch": "Scientific Research",
    "principles": "Principles"
  },
  "fields": {
    "heading": "Heading",
    "description": "Description",
    "image": "Image",
    "imageLeft": "Left Image",
    "imageRight": "Right Image",
    "personName": "Person Name",
    "text": "Text",
    "generalText": "General Text",
    "title": "Title",
    "link": "Link",
    "placeholder": {
      "heading": "Enter heading...",
      "description": "Enter description...",
      "personName": "Enter name...",
      "text": "Enter text...",
      "link": "Enter URL..."
    }
  },
  "validation": {
    "required": "This field is required",
    "maxLength": "Maximum length: {{max}} characters",
    "minLength": "Minimum length: {{min}} characters",
    "invalidUrl": "Invalid URL format",
    "invalidImageType": "Image type must be JPG, PNG, or WebP",
    "imageTooLarge": "Image size must not exceed {{maxSize}} MB",
    "minArrayLength": "Minimum number of items: {{min}}",
    "maxArrayLength": "Maximum number of items: {{max}}"
  },
  "buttons": {
    "save": "Save",
    "cancel": "Cancel",
    "publish": "Publish",
    "unpublish": "Unpublish",
    "saveDraft": "Save Draft",
    "add": "Add",
    "remove": "Remove",
    "edit": "Edit",
    "delete": "Delete",
    "confirm": "Confirm",
    "close": "Close"
  },
  "toast": {
    "saveSuccess": "Successfully saved",
    "saveError": "Save error",
    "deleteSuccess": "Successfully deleted",
    "deleteError": "Delete error",
    "publishSuccess": "Successfully published",
    "publishError": "Publish error",
    "unpublishSuccess": "Unpublished",
    "unpublishError": "Unpublish error",
    "uploadSuccess": "Image uploaded",
    "uploadError": "Image upload error"
  },
  "confirmationModal": {
    "dontAskAgain": "Don't ask again",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "processing": "Processing..."
  },
  "publishButton": {
    "publish": "Publish",
    "unpublish": "Unpublish",
    "processing": "Processing...",
    "publishedTooltip": "Published {{date}}",
    "draftTooltip": "Draft (not published)",
    "publishModalTitle": "Confirm Publish",
    "publishModalMessage": "Are you sure you want to publish this section?",
    "unpublishModalTitle": "Confirm Unpublish",
    "unpublishModalMessage": "Are you sure you want to unpublish this section?"
  },
  "imageUpload": {
    "dropzoneLabel": "Drag image or click to select",
    "dragAndDrop": "Drag image here",
    "or": "or",
    "browse": "Browse files",
    "replaceImage": "Replace image",
    "removeImage": "Remove image",
    "errors": {
      "invalidType": "Invalid file type. Allowed: JPG, PNG, WebP",
      "tooLarge": "File too large. Maximum: {{maxSize}} MB"
    }
  },
  "translation": {
    "language": {
      "uk": "Ukrainian",
      "en": "English"
    },
    "status": {
      "complete": "Complete",
      "incomplete": "Incomplete",
      "notStarted": "Not Started"
    }
  },
  "translationIcon": {
    "tooltip": "{{language}}: {{status}} ({{percentage}}%)"
  },
  "translationModal": {
    "title": "Translation: {{section}} ({{language}})",
    "cancel": "Cancel",
    "save": "Save",
    "saving": "Saving...",
    "unsavedChanges": "You have unsaved changes. Are you sure you want to close?"
  }
}
```

## Test Cases

### Unit Tests
- Test all translation keys exist in both UK and EN files
- Test no missing translations (keys match between files)
- Test interpolation variables match ({{max}}, {{min}}, etc.)
- Test JSON files are valid (no syntax errors)

### Integration Tests
- Test all components use i18n keys (no hard-coded strings)
- Test language switching works throughout app
- Test default language is Ukrainian
- Test fallback to Ukrainian if English translation missing

## Dependencies
- None (foundational)

## Estimated Effort

**3 hours**

- Ukrainian translations: 1 hour
- English translations: 1 hour
- Testing and validation: 1 hour

## Technical Notes

### Patterns to Follow
- Use nested keys for organization (page.title, fields.heading, etc.)
- Use interpolation for dynamic values ({{max}}, {{date}}, etc.)
- Keep keys consistent between UK and EN files
- Follow existing Victory Center i18n structure

### Translation Guidelines
- Use formal Ukrainian ("Ви" not "ти")
- Use professional English (no slang)
- Keep translations concise for UI space constraints
- Ensure accessibility labels are descriptive

### Validation
- Use i18n-json-schema validator to check structure
- Use automated tests to detect missing translations
- Use linter to ensure no hard-coded strings in components

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Both UK and EN translation files complete
- [ ] All keys present in both files
- [ ] No hard-coded strings in components
- [ ] Tests validate translation completeness
- [ ] Code reviewed by Ukrainian speaker
- [ ] Code reviewed and approved
- [ ] JSON files validated (no syntax errors)
