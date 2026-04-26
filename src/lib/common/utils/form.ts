// src/lib/server/utils/forms.ts

export function formDataToObject(formData: FormData) {
  const object: Record<string, unknown> = {};

  formData.forEach((value, key) => {
    // 1. Use Object.hasOwn (Modern) or Object.prototype.hasOwnProperty (Classic)
    if (Object.hasOwn(object, key)) {
      if (!Array.isArray(object[key])) {
        object[key] = [object[key]];
      }
      (object[key] as unknown[]).push(value);
      return;
    }

    // 2. Simple Type Conversion
    if (value === 'true') {
      object[key] = true;
    } else if (value === 'false') {
      object[key] = false;
    } else if (value === '' || value === 'null') {
      object[key] = null;
    } else if (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))) {
      object[key] = Number(value);
    } else {
      object[key] = value;
    }
  });

  return object;
}
