export const isBufferExpired = (expiryTime) => {
  return new Date() > new Date(expiryTime);
};
