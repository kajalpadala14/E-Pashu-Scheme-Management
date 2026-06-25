export function safeSelectOptions(options: readonly string[]) {
  return Array.from(
    new Set(
      options
        .map((option) => String(option || "").trim())
        .filter(Boolean),
    ),
  );
}

export function safeSelectValue(value: string, options: readonly string[], fallback: string) {
  const normalizedValue = String(value || "").trim();
  const normalizedFallback = String(fallback || "").trim();
  if (!normalizedValue) {
    return normalizedFallback;
  }

  const safeOptions = safeSelectOptions(options);
  if (normalizedFallback && normalizedValue === normalizedFallback) {
    return normalizedValue;
  }

  return safeOptions.includes(normalizedValue) ? normalizedValue : normalizedFallback;
}
