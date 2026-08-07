"use client";

import EventDateTime from "./EventDateTime";
import AddToCalendarMenu from "./AddToCalendarMenu";

export default function EventCard({ event, onManage }) {
  const isVirtual = event.locationType === "virtual";

  return (
    <div className="flex flex-col rounded-2xl border border-mauve/30 bg-white overflow-hidden shadow-sm">
      <div className="h-40 w-full bg-plum-deep">
        {event.bannerImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.bannerImageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-plum-deep to-plum" />
        )}
      </div>

      <div className="flex flex-col gap-3 p-5 flex-1">
        <div className="flex flex-wrap gap-1.5">
          {event.categoryTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blush border border-gold/60 px-2.5 py-0.5 text-xs text-plum"
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="font-heading text-2xl leading-tight text-plum-deep">{event.title}</h3>

        <EventDateTime eventAt={event.eventAt} timezone={event.timezone} />

        <p className="text-sm text-muted">
          {isVirtual ? "Virtual" : event.locationText || "Location TBD"}
          {isVirtual && event.locationText ? ` — ${event.locationText}` : ""}
        </p>

        {event.description && (
          <p className="text-sm text-plum/90 whitespace-pre-wrap">{event.description}</p>
        )}

        <div className="mt-auto flex flex-col gap-1 text-xs text-muted pt-2">
          <span>Hosted by {event.hostedBy}</span>
          {event.rsvpBy && (
            <span>
              RSVP by{" "}
              {new Date(event.rsvpBy + "T00:00:00").toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {event.eventLink && (
            <a
              href={event.eventLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-plum-deep px-4 py-1.5 text-sm text-white hover:bg-plum transition"
            >
              Event link
            </a>
          )}
          <AddToCalendarMenu event={event} />
          <button
            type="button"
            onClick={() => onManage(event)}
            className="rounded-full border border-mauve px-4 py-1.5 text-sm text-muted hover:border-plum-deep hover:text-plum-deep transition"
          >
            Manage this event
          </button>
        </div>
      </div>
    </div>
  );
}
