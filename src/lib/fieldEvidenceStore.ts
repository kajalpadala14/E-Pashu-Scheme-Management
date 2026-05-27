import type { GeoTaggedPhotoEvidence } from "@/lib/types";

const PHOTO_EVIDENCE_KEY = "e-pashu-photo-evidence";

export function getStoredPhotoEvidence(): GeoTaggedPhotoEvidence[] {
  try {
    const raw = window.localStorage.getItem(PHOTO_EVIDENCE_KEY);
    return raw ? (JSON.parse(raw) as GeoTaggedPhotoEvidence[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredPhotoEvidence(items: GeoTaggedPhotoEvidence[]) {
  window.localStorage.setItem(PHOTO_EVIDENCE_KEY, JSON.stringify(items));
}
