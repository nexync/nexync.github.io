// Settings for the presenter page (nvr-poll-host). Keep pollId, URLs and items in step with nvr-poll/config.js.
window.POLL_CONFIG = {
  pollId: "nvr-verifiability-v1",

  // The phone page people open (shown as a QR code in the lobby).
  pollUrl: "https://nexync.github.io/nvr-poll/",

  // Google Apps Script web app /exec URL (see apps-script/SETUP.md). Same URL in both fields.
  // Empty = no backend: the page shows its cached copy only (or use ?demo).
  submitUrl: "", // paste the Apps Script /exec URL (apps-script/SETUP.md)
  resultsUrl: "", // paste the Apps Script /exec URL (apps-script/SETUP.md)

  // How often the host re-fetches answers (ms).
  refreshMs: 4000,

  // Results buttons unlock once this many people have answered (editable on the page).
  threshold: 8,

  // The eight tasks. Values are 0..1, where 1 = fully verifiable (an AIME answer).
  items: [
    { id: "A", task: "The elegance of a proof", who: "undergrad math students" },
    { id: "B", task: "The elegance of a proof", who: "sixth graders" },
    { id: "C", task: "Correctness of a natural-language proof", who: "research mathematicians" },
    { id: "D", task: "The quality of a piece of art", who: "art critics" },
    { id: "E", task: "The quality of a piece of art", who: "the general public" },
    { id: "F", task: "The quality of a short story", who: "frequent readers" },
    { id: "G", task: "The clarity of a medical explanation", who: "patients" },
    { id: "H", task: "The best food", who: "everyone" },
  ],
};
