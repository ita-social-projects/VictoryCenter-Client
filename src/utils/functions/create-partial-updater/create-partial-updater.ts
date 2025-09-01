export interface PartialUpdater<T> {
  (updates: Partial<T>): void;
}

/**
 * Creates a function that can update parts of a state object
 */
export const createPartialUpdater = <T>(setter: React.Dispatch<React.SetStateAction<T>>): PartialUpdater<T> => {
  return (updates: Partial<T>) => setter((prev) => ({ ...prev, ...updates }));
};
