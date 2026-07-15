/** Discriminated union for validation outcomes. */
export type ValidationResult<T> =
	| { valid: true; data: T }
	| { valid: false; error: string };

export function validResult<T>(data: T): ValidationResult<T> {
	return { valid: true, data };
}

export function invalidResult<T = never>(error: string): ValidationResult<T> {
	return { valid: false, error };
}
