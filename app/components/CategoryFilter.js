"use client";

import { CATEGORY_TAGS } from "@/lib/constants";

export default function CategoryFilter({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border border-mauve/50 bg-white px-4 py-2 text-sm text-plum-deep"
    >
      <option value="">All categories</option>
      {CATEGORY_TAGS.map((tag) => (
        <option key={tag} value={tag}>
          {tag}
        </option>
      ))}
    </select>
  );
}
