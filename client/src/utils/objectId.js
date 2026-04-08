export const isValidObjectId = (value) =>
  typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
