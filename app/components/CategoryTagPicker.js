"use client";

import { CATEGORY_TAGS, MAX_CATEGORY_TAGS } from "@/lib/constants";

export default function CategoryTagPicker({ value, onChange }) {
  function toggle(tag) {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else if (value.length < MAX_CATEGORY_TAGS) {
      onChange([...value, tag]);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {CATEGORY_TAGS.map((tag) => {
          const selected = value.includes(tag);
          const disabled = !selected && value.length >= MAX_CATEGORY_TAGS;
          return (
            <button
              key={tag}
              type="button"
              disabled={disabled}
              onClick={() => toggle(tag)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                selected
                  ? "bg-plum-deep text-white border-plum-deep"
                  : disabled
                  ? "border-mauve/40 text-mauve/60 cursor-not-allowed"
                  : "border-mauve text-plum hover:border-plum-deep"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
      <p className="mt-1 text-xs text-muted">
        Pick up to {MAX_CATEGORY_TAGS} ({value.length}/{MAX_CATEGORY_TAGS} selected)
      </p>
    </div>
  );
}
