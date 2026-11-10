// Shared settings for the poll (index.html) and the results view (results.html).
window.POLL_CONFIG = {
  pollId: "nvr-verifiability-v1",

  // Where phones send answers (HTTP POST, JSON body). Empty = answers stay on each phone.
  // For a Google Apps Script web app, paste its /exec URL here.
  submitUrl: "https://script.google.com/macros/s/AKfycbzK56HZAZrACTWvprR1nGta0AsVy3OE0IFl-Y31qJxc3YeRYNQVIEDu7jss9ETiQ-0N/exec", // paste the Apps Script /exec URL (apps-script/SETUP.md)

  // Where results.html reads all answers (HTTP GET). It should return either
  //   [ { "name": "...", "answers": { "A": 0.62, ..., "H": 0.1 } }, ... ]
  // or { "responses": [ ...same objects... ] }. Usually the same URL as submitUrl.
  resultsUrl: "https://script.google.com/macros/s/AKfycbzK56HZAZrACTWvprR1nGta0AsVy3OE0IFl-Y31qJxc3YeRYNQVIEDu7jss9ETiQ-0N/exec", // paste the Apps Script /exec URL (apps-script/SETUP.md)

  // How often results.html re-fetches while open (ms).
  refreshMs: 5000,

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
