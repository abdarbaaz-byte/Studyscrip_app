
export default function FeedbackPage() {
  // Added &embedded=true to the URL for a better embedded experience
  const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSeCCWptdyHiXdAB0CbtuD7RT73XrRvtGQ88_w9wIoOVLmN7Cg/viewform?usp=header&embedded=true";

  return (
    <div className="h-full w-full">
      <iframe
        src={formUrl}
        className="w-full h-full border-0"
        title="Feedback Form"
      >
        Loading…
      </iframe>
    </div>
  );
}
