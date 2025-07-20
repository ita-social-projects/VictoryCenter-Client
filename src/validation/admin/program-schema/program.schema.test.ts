import { programValidationSchema } from './program-scheme';
import { PROGRAM_VALIDATION } from '../../../const/admin/programs';

jest.mock('../../../const/admin/programs', () => ({
  PROGRAM_VALIDATION: {
    name: {
      min: 3,
      max: 100,
      getRequiredError: () => 'Name is required',
      getMinError: () => 'Name must be at least 3 characters',
      getMaxError: () => 'Name must not exceed 100 characters',
    },
    categories: {
      getAtLeastOneRequiredError: () => 'At least one category is required',
    },
    description: {
      min: 10,
      max: 500,
      getRequiredError: () => 'Description is required',
      getMinError: () => 'Description must be at least 10 characters',
      getMaxError: () => 'Description must not exceed 500 characters',
    },
    img: {
      allowedFormats: ['image/jpeg', 'image/png', 'image/gif'],
      maxSizeBytes: 5 * 1024 * 1024, // 5MB
      getRequiredWhenPublishingError: () => 'Image is required when publishing',
      getFormatError: () => 'Invalid image format',
      getSizeError: () => 'Image size too large',
    },
  },
}));

const mockCategory = {
  id: 1,
  name: 'Test Category',
  programsCount: 5,
};

// Helper function to create a valid File object
const createMockFile = (type = 'image/jpeg', size = 1024) => {
  const file = new File(['test'], 'test.jpg', { type });
  Object.defineProperty(file, 'size', {
    value: size,
    writable: false,
  });
  return file;
};

describe('Program Validation Schema', () => {
  describe('Name validation', () => {
    it('should pass with valid name', async () => {
      const data = {
        name: 'Valid Program Name',
        categories: [mockCategory],
        description: 'Valid description with enough characters',
        img: 'existing-image.jpg',
      };

      await expect(programValidationSchema.validate(data, { context: { isPublishing: false } }))
        .resolves.toBeDefined();
    });

    it('should fail when name is empty', async () => {
      const data = {
        name: '',
        categories: [mockCategory],
        description: 'Valid description',
        img: null,
      };

      await expect(programValidationSchema.validate(data))
        .rejects.toThrow('Name is required');
    });

    it('should fail when name is too short', async () => {
      const data = {
        name: 'AB',
        categories: [mockCategory],
        description: 'Valid description',
        img: null,
      };

      await expect(programValidationSchema.validate(data))
        .rejects.toThrow('Name must be at least 3 characters');
    });

    it('should fail when name is too long', async () => {
      const data = {
        name: 'A'.repeat(101),
        categories: [mockCategory],
        description: 'Valid description',
        img: null,
      };

      await expect(programValidationSchema.validate(data))
        .rejects.toThrow('Name must not exceed 100 characters');
    });
  });

  describe('Categories validation', () => {
    it('should pass with valid categories array', async () => {
      const data = {
        name: 'Valid Name',
        categories: [mockCategory],
        description: 'Valid description',
        img: null,
      };

      await expect(programValidationSchema.validate(data, { context: { isPublishing: false } }))
        .resolves.toBeDefined();
    });

    it('should fail when categories array is empty', async () => {
      const data = {
        name: 'Valid Name',
        categories: [],
        description: 'Valid description',
        img: null,
      };

      await expect(programValidationSchema.validate(data))
        .rejects.toThrow('At least one category is required');
    });

    it('should fail when categories is null', async () => {
      const data = {
        name: 'Valid Name',
        categories: null,
        description: 'Valid description',
        img: null,
      };

      await expect(programValidationSchema.validate(data))
        .rejects.toThrow('At least one category is required');
    });

    it('should pass with multiple categories', async () => {
      const data = {
        name: 'Valid Name',
        categories: [
          mockCategory,
          { id: 2, name: 'Another Category', programsCount: 3 },
        ],
        description: 'Valid description',
        img: null,
      };

      await expect(programValidationSchema.validate(data, { context: { isPublishing: false } }))
        .resolves.toBeDefined();
    });
  });

  describe('Description validation', () => {
    describe('Draft mode (isPublishing: false)', () => {
      it('should pass with empty description', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: '',
          img: null,
        };

        await expect(programValidationSchema.validate(data, { context: { isPublishing: false } }))
          .resolves.toBeDefined();
      });

      it('should pass without description field', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          img: null,
        };

        await expect(programValidationSchema.validate(data, { context: { isPublishing: false } }))
          .resolves.toBeDefined();
      });

      it('should fail when description exceeds max length', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: 'A'.repeat(501),
          img: null,
        };

        await expect(programValidationSchema.validate(data, { context: { isPublishing: false } }))
          .rejects.toThrow('Description must not exceed 500 characters');
      });
    });

    describe('Publish mode (isPublishing: true)', () => {
      it('should pass with valid description', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: 'Valid description with enough characters',
          img: createMockFile(),
        };

        await expect(programValidationSchema.validate(data, { context: { isPublishing: true } }))
          .resolves.toBeDefined();
      });

      it('should fail when description is empty', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: '',
          img: createMockFile(),
        };

        await expect(programValidationSchema.validate(data, { context: { isPublishing: true } }))
          .rejects.toThrow('Description is required');
      });

      it('should fail when description is too short', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: 'Short',
          img: createMockFile(),
        };

        await expect(programValidationSchema.validate(data, { context: { isPublishing: true } }))
          .rejects.toThrow('Description must be at least 10 characters');
      });

      it('should fail when description exceeds max length', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: 'A'.repeat(501),
          img: createMockFile(),
        };

        await expect(programValidationSchema.validate(data, { context: { isPublishing: true } }))
          .rejects.toThrow('Description must not exceed 500 characters');
      });
    });
  });

  describe('Image validation', () => {
    describe('Draft mode (isPublishing: false)', () => {
      it('should pass without image', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: 'Valid description',
          img: null,
        };

        await expect(programValidationSchema.validate(data, { context: { isPublishing: false } }))
          .resolves.toBeDefined();
      });

      it('should pass with string image path', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: 'Valid description',
          img: 'existing-image.jpg',
        };

        await expect(programValidationSchema.validate(data, { context: { isPublishing: false } }))
          .resolves.toBeDefined();
      });

      it('should pass with valid file', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: 'Valid description',
          img: createMockFile(),
        };

        await expect(programValidationSchema.validate(data, { context: { isPublishing: false } }))
          .resolves.toBeDefined();
      });
    });

    describe('Publish mode (isPublishing: true)', () => {
      it('should fail without image', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: 'Valid description with enough characters',
          img: null,
        };

        await expect(programValidationSchema.validate(data, { context: { isPublishing: true } }))
          .rejects.toThrow('Image is required when publishing');
      });

      it('should pass with string image path', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: 'Valid description with enough characters',
          img: 'existing-image.jpg',
        };

        await expect(programValidationSchema.validate(data, { context: { isPublishing: true } }))
          .resolves.toBeDefined();
      });

      it('should pass with valid file', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: 'Valid description with enough characters',
          img: createMockFile(),
        };

        await expect(programValidationSchema.validate(data, { context: { isPublishing: true } }))
          .resolves.toBeDefined();
      });
    });

    describe('File format validation', () => {
      it('should pass with JPEG file', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: 'Valid description',
          img: createMockFile('image/jpeg'),
        };

        await expect(programValidationSchema.validate(data, { context: { isPublishing: false } }))
          .resolves.toBeDefined();
      });

      it('should pass with PNG file', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: 'Valid description',
          img: createMockFile('image/png'),
        };

        await expect(programValidationSchema.validate(data, { context: { isPublishing: false } }))
          .resolves.toBeDefined();
      });

      it('should pass with GIF file', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: 'Valid description',
          img: createMockFile('image/gif'),
        };

        await expect(programValidationSchema.validate(data, { context: { isPublishing: false } }))
          .resolves.toBeDefined();
      });

      it('should fail with invalid file format', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: 'Valid description',
          img: createMockFile('text/plain'),
        };

        await expect(programValidationSchema.validate(data, { context: { isPublishing: false } }))
          .rejects.toThrow('Invalid image format');
      });
    });

    describe('File size validation', () => {
      it('should pass with file under size limit', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: 'Valid description',
          img: createMockFile('image/jpeg', 1024 * 1024), // 1MB
        };

        await expect(programValidationSchema.validate(data, { context: { isPublishing: false } }))
          .resolves.toBeDefined();
      });

      it('should fail with file over size limit', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: 'Valid description',
          img: createMockFile('image/jpeg', 6 * 1024 * 1024), // 6MB
        };

        await expect(programValidationSchema.validate(data, { context: { isPublishing: false } }))
          .rejects.toThrow('Image size too large');
      });

      it('should pass with file at exact size limit', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: 'Valid description',
          img: createMockFile('image/jpeg', 5 * 1024 * 1024), // 5MB
        };

        await expect(programValidationSchema.validate(data, { context: { isPublishing: false } }))
          .resolves.toBeDefined();
      });
    });

    describe('Transform function', () => {
      it('should transform empty string to null', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: 'Valid description',
          img: '',
        };

        const result = await programValidationSchema.validate(data, { context: { isPublishing: false } });
        expect(result.img).toBeNull();
      });

      it('should transform undefined to null', async () => {
        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: 'Valid description',
          img: undefined,
        };

        const result = await programValidationSchema.validate(data, { context: { isPublishing: false } });
        expect(result.img).toBeNull();
      });

      it('should handle empty FileList', async () => {
        const fileList = {
          length: 0,
        } as unknown as FileList;

        const data = {
          name: 'Valid Name',
          categories: [mockCategory],
          description: 'Valid description',
          img: fileList,
        };

        const result = await programValidationSchema.validate(data, { context: { isPublishing: false } });
        expect(result.img).toBeNull();
      });
    });
  });

  describe('Complete validation scenarios', () => {
    it('should pass complete draft form', async () => {
      const data = {
        name: 'Complete Program Name',
        categories: [mockCategory],
        description: '', // Can be empty in draft
        img: null, // Can be null in draft
      };

      await expect(programValidationSchema.validate(data, { context: { isPublishing: false } }))
        .resolves.toBeDefined();
    });

    it('should pass complete publish form', async () => {
      const data = {
        name: 'Complete Program Name',
        categories: [mockCategory],
        description: 'Complete description with enough characters',
        img: createMockFile(),
      };

      await expect(programValidationSchema.validate(data, { context: { isPublishing: true } }))
        .resolves.toBeDefined();
    });
  });
});