"use client";

import { useState } from "react";
import { TIMEZONES, LOCATION_TYPES, MAX_DESCRIPTION_WORDS } from "@/lib/constants";
import { countWords } from "@/lib/text";
import CategoryTagPicker from "./CategoryTagPicker";

const emptyValues = {
  title: "",
  description: "",
  bannerImageUrl: "",
  date: "",
  time: "",
  timezone: "America/New_York",
  locationType: LOCATION_TYPES.IN_PERSON,
  locationText: "",
  eventLink: "",
  rsvpBy: "",
  hostedBy: "",
  categoryTags: [],
};

// Shared by the member submission form, the collective-events admin form,
// and the edit flow inside the manage modal.
export default function EventForm({
  mode, // "create-member" | "create-collective" | "edit"
  initialValues,
  onSubmit,
  submitLabel = "Submit",
  submitting = false,
  serverError,
}) {
  const [values, setValues] = useState({ ...emptyValues, ...initialValues });
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(initialValues?.bannerImageUrl || "");
  const [passcode, setPasscode] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const descriptionWordCount = countWords(values.description);

  function set(field, val) {
    setValues((v) => ({ ...v, [field]: val }));
  }

  function handleBannerChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError("");

    if (!values.title.trim()) return setLocalError("Title is required.");
    if (!values.date || !values.time) return setLocalError("Date and time are required.");
    if (!values.hostedBy.trim()) return setLocalError("Hosted-by name is required.");
    if (values.categoryTags.length === 0) return setLocalError("Pick at least one category tag.");
    if (countWords(values.description) > MAX_DESCRIPTION_WORDS) {
      return setLocalError(`Description must be ${MAX_DESCRIPTION_WORDS} words or less.`);
    }
    if (mode === "create-member" && !passcode.trim()) {
      return setLocalError("Set a passcode so you can edit this event later.");
    }
    if (mode === "create-collective" && !adminPassword.trim()) {
      return setLocalError("Admin password is required.");
    }

    let bannerImageUrl = values.bannerImageUrl;
    if (bannerFile) {
      const formData = new FormData();
      formData.append("banner", bannerFile);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) return setLocalError(data.error || "Image upload failed.");
      bannerImageUrl = data.url;
    }

    onSubmit({
      ...values,
      bannerImageUrl,
      passcode: mode === "create-member" ? passcode : undefined,
      adminPassword: mode === "create-collective" ? adminPassword : undefined,
    });
  }

  const error = localError || serverError;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="rounded-lg bg-white border border-muted/40 px-4 py-3 text-sm text-muted">
          {error}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Banner image</label>
        {bannerPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bannerPreview}
            alt="Banner preview"
            className="mb-2 h-32 w-full max-w-sm rounded-lg object-cover border border-mauve/40"
          />
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleBannerChange}
          className="block w-full text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input
          type="text"
          required
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          className="w-full rounded-lg border border-mauve/50 px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date *</label>
          <input
            type="date"
            required
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
            className="w-full rounded-lg border border-mauve/50 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time *</label>
          <input
            type="time"
            required
            value={values.time}
            onChange={(e) => set("time", e.target.value)}
            className="w-full rounded-lg border border-mauve/50 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Timezone *</label>
          <select
            value={values.timezone}
            onChange={(e) => set("timezone", e.target.value)}
            className="w-full rounded-lg border border-mauve/50 px-3 py-2 bg-white"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location *</label>
        <div className="flex gap-4 mb-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={values.locationType === LOCATION_TYPES.IN_PERSON}
              onChange={() => set("locationType", LOCATION_TYPES.IN_PERSON)}
            />
            In person
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={values.locationType === LOCATION_TYPES.VIRTUAL}
              onChange={() => set("locationType", LOCATION_TYPES.VIRTUAL)}
            />
            Virtual
          </label>
        </div>
        <input
          type="text"
          placeholder={
            values.locationType === LOCATION_TYPES.VIRTUAL
              ? "Platform + notes (e.g. Zoom — link sent after RSVP)"
              : "Address"
          }
          value={values.locationText}
          onChange={(e) => set("locationText", e.target.value)}
          className="w-full rounded-lg border border-mauve/50 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <p className="text-xs text-muted mb-1">Please keep it to {MAX_DESCRIPTION_WORDS} words or less.</p>
        <textarea
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-mauve/50 px-3 py-2"
        />
        <p
          className={`mt-1 text-xs ${
            descriptionWordCount > MAX_DESCRIPTION_WORDS ? "text-muted font-medium" : "text-muted"
          }`}
        >
          {descriptionWordCount}/{MAX_DESCRIPTION_WORDS} words
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Event link</label>
          <input
            type="url"
            placeholder="https://..."
            value={values.eventLink}
            onChange={(e) => set("eventLink", e.target.value)}
            className="w-full rounded-lg border border-mauve/50 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">RSVP by</label>
          <input
            type="date"
            value={values.rsvpBy || ""}
            onChange={(e) => set("rsvpBy", e.target.value)}
            className="w-full rounded-lg border border-mauve/50 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Hosted by *</label>
        <input
          type="text"
          required
          value={values.hostedBy}
          onChange={(e) => set("hostedBy", e.target.value)}
          className="w-full rounded-lg border border-mauve/50 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category tags *</label>
        <CategoryTagPicker
          value={values.categoryTags}
          onChange={(tags) => set("categoryTags", tags)}
        />
      </div>

      {mode === "create-member" && (
        <div>
          <label className="block text-sm font-medium mb-1">Set a passcode *</label>
          <input
            type="text"
            required
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="You'll need this to edit or cancel later"
            className="w-full rounded-lg border border-mauve/50 px-3 py-2"
          />
        </div>
      )}

      {mode === "create-collective" && (
        <div>
          <label className="block text-sm font-medium mb-1">Admin password *</label>
          <input
            type="password"
            required
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="w-full rounded-lg border border-mauve/50 px-3 py-2"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 self-start rounded-full bg-plum-deep px-6 py-2 text-white hover:bg-plum transition disabled:opacity-50"
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
