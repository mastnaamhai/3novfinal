import crypto from 'crypto';

/**
 * Hashes a password using SHA-256.
 * @param password The plain text password to hash.
 * @returns A promise that resolves to the hex-encoded hash string.
 */
export const hashPassword = async (password: string): Promise<string> => {
  return crypto.createHash('sha256').update(password).digest('hex');
};
