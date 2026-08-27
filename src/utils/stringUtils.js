export const generateSchoolSlug = (schoolName) => {
  if (!schoolName) return '';
  return schoolName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/(^-|-$)+/g, '');   // Remove leading/trailing hyphens
};
