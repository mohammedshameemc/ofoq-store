import { current } from "@mongez/react";
import { LocalizedText } from "shared/utils/types";

export const translateText = (text: LocalizedText[] | "" | undefined | null) => {
  if (!text || typeof text === "string" || !Array.isArray(text)) return "";
  return text.find(n => n.localeCode === current("localeCode"))?.value || "";
};
