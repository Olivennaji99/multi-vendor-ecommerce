/** Round-trips a Mongoose document (or array of them) through JSON so it's a
 * plain, serializable object safe to pass from a Server Component to a
 * Client Component (ObjectIds/Dates become strings, password fields stay
 * stripped via each model's toJSON transform). */
export function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
