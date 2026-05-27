export function normalizeIndianMobile(value: string): string {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  return digits;
}

export function sanitizeIndianMobileInput(value: string): string {
  return normalizeIndianMobile(value).slice(0, 10);
}

export function isValidIndianMobile(value: string): boolean {
  return /^\d{10}$/.test(normalizeIndianMobile(value));
}

export function toDialableIndianMobile(value: string): string {
  const normalized = normalizeIndianMobile(value);
  return isValidIndianMobile(normalized) ? `+91${normalized}` : "";
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = normalizeIndianMobile(phone);
  if (!isValidIndianMobile(normalized)) {
    return "";
  }

  const encodedMessage = encodeURIComponent(String(message || ""));
  return `https://wa.me/91${normalized}${encodedMessage ? `?text=${encodedMessage}` : ""}`;
}

export function buildWhatsAppShareUrl(message: string): string {
  const encodedMessage = encodeURIComponent(String(message || ""));
  return `https://wa.me/?text=${encodedMessage}`;
}
