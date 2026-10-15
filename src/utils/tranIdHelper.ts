import { randomBytes } from 'crypto';

const generate = (prefix = 'TRX'): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const entropy = randomBytes(4).toString('hex').toUpperCase();

  return `${prefix}-${timestamp}-${entropy}`;
};

export const tranIdHelper = { generate };
