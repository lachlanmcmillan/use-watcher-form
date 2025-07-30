/**
 * PartialRecord is a type that takes two types, and returns a partial record
 * of the second type, keyed by the first type.
 *
 * @example
 *
 * interface MyType = {
 *   name: string;
 *   age: number;
 *   isActive: boolean;
 * }
 *
 * type FieldVisibility = PRecord<MyType, boolean>;
 *
 * const myPartialRecord: FieldVisibility = {
 *   name: true,
 * }
 */
export type PRecord<T extends Record<string, any>, ValueType> = Partial<
  // Extract here throws away non-string
  Record<Extract<keyof T, string>, ValueType>
>;

export type ValidationResult =
  | { [key: string]: ValidationResult }
  | string
  | null
  | undefined;

/**
 * Errors should be an object such as
 *
 * {
 *   "name": "name is required",
 *   "email": "please enter a valid email address",
 *   "birthday": null,
 *   "address": {
 *     "street": "street is required",
 *   }
 * }
 *
 * where the keys are a key of T
 *
 * anything value of undefined or null will be taken as a non-error
 */
export type PRecordErrors<T extends Record<string, any>> = PRecord<
  T,
  ValidationResult
>;
