const randomChunk = () => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0].toString(36).slice(0, 6);
  }
  return Math.random().toString(36).slice(2, 8);
};

export const generateTrackerToken = () => {
  const parts = [randomChunk(), randomChunk(), Date.now().toString(36)];
  return parts.join('-');
};

export const tokenToId = (token) => token?.split('-')[0] ?? '';
