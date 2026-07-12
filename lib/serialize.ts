export function serializeSortedJson<T extends Record<string, unknown>>(
  data: T,
  sortedKey: keyof T & string
): string {
  const sorted = { ...data };
  const record = data[sortedKey] as Record<string, unknown>;
  const sortedRecord: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) {
    sortedRecord[key] = record[key]!;
  }
  sorted[sortedKey] = sortedRecord as T[keyof T & string];
  return JSON.stringify(sorted, null, 2) + "\n";
}
