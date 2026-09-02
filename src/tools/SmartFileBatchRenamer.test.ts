import { describe, expect, it } from 'vitest';
import { findCollisions, renameFiles, RenameRules } from './SmartFileBatchRenamer';

const noopRules: RenameRules = {
  removeSpecialChars: false,
  findText: '',
  replaceText: '',
  addSequence: false,
  sequenceStart: 1,
  prefix: '',
  lowercaseExtension: false,
};

describe('renameFiles', () => {
  it('leaves filenames unchanged when no rules are active', () => {
    expect(renameFiles(['photo.JPG'], noopRules)).toEqual(['photo.JPG']);
  });

  it('applies a prefix before the base name, keeping the extension', () => {
    const out = renameFiles(['photo.jpg'], { ...noopRules, prefix: 'product-' });
    expect(out).toEqual(['product-photo.jpg']);
  });

  it('appends a zero-padded sequence number per file', () => {
    const out = renameFiles(['a.jpg', 'b.jpg', 'c.jpg'], { ...noopRules, addSequence: true, sequenceStart: 5 });
    expect(out).toEqual(['a-005.jpg', 'b-006.jpg', 'c-007.jpg']);
  });

  it('performs a literal find/replace on the base name only', () => {
    const out = renameFiles(['IMG_2049.jpg'], { ...noopRules, findText: 'IMG_', replaceText: 'photo-' });
    expect(out).toEqual(['photo-2049.jpg']);
  });

  it('strips special characters and collapses spaces to hyphens', () => {
    const out = renameFiles(['Product Photo #2!!.jpeg'], { ...noopRules, removeSpecialChars: true });
    expect(out).toEqual(['Product-Photo-2.jpeg']);
  });

  it('lowercases the extension when requested, leaving the base name untouched', () => {
    const out = renameFiles(['Photo.JPG'], { ...noopRules, lowercaseExtension: true });
    expect(out).toEqual(['Photo.jpg']);
  });

  it('treats a file with no extension as having an empty extension', () => {
    const out = renameFiles(['README'], { ...noopRules, prefix: 'x-' });
    expect(out).toEqual(['x-README']);
  });

  it('combines multiple rules in a fixed, predictable order', () => {
    const out = renameFiles(['IMG_2049 (copy).JPG'], {
      findText: 'IMG_',
      replaceText: 'photo-',
      removeSpecialChars: true,
      prefix: 'product-',
      addSequence: true,
      sequenceStart: 1,
      lowercaseExtension: true,
    });
    expect(out).toEqual(['product-photo-2049-copy-001.jpg']);
  });
});

describe('findCollisions', () => {
  it('returns an empty array when all names are unique', () => {
    expect(findCollisions(['a.jpg', 'b.jpg'])).toEqual([]);
  });

  it('flags names that would collide after renaming', () => {
    expect(findCollisions(['a.jpg', 'a.jpg', 'b.jpg'])).toEqual(['a.jpg']);
  });
});
