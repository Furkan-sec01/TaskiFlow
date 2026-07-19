export function validatePasswordPolicy(password: string): boolean {
  const value = password.trim();
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

export const PASSWORD_POLICY_HINT_TR =
  "En az 8 karakter, 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter";
