
/**
 * Utilities for working with cycles
 */

/**
 * Generates a unique cycle count using various strategies based on attempt number
 * @param attempt The current attempt (0-based)
 * @returns A unique numeric cycle ID
 */
export const generateUniqueCycleCount = (attempt: number): number => {
  // Base timestamp
  const timestamp = Date.now();
  
  // Different strategies for each attempt
  if (attempt === 0) {
    // First attempt: timestamp base + random
    const random = Math.floor(Math.random() * 10000);
    return timestamp + random;
  } 
  else if (attempt >= 6) {
    // Last attempts: UUID totally random converted to number
    const randomUUID = crypto.randomUUID();
    const numericPart = parseInt(randomUUID.replace(/[^0-9]/g, '').slice(0, 8));
    const highRandomness = timestamp * 1000 + numericPart + Math.floor(Math.random() * 1000000);
    console.log(`Final attempt (${attempt + 1}): generating totally random cycleCount: ${highRandomness}`);
    return highRandomness;
  } 
  else {
    // Intermediate attempts: progressively increasing randomness
    const spacing = Math.pow(10, attempt + 2); // 100, 1000, 10000, etc.
    const randomFactor = Math.floor(Math.random() * spacing);
    return timestamp + randomFactor + (attempt * 10000);
  }
};
