export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatPhoneBR(value: string) {
  const numbers = onlyDigits(value).slice(0, 11);

  if (numbers.length <= 2) {
    return numbers;
  }

  if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }

  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(
    3,
    7
  )}-${numbers.slice(7, 11)}`;
}

export function toSupabasePhone(value: string) {
  const numbers = onlyDigits(value);

  if (numbers.length !== 11) return "";
  return `+55${numbers}`;
}

export function isValidBrazilPhone(value: string) {
  return onlyDigits(value).length === 11;
}
