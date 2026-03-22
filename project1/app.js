const SHEET_URL = "https://docs.google.com/spreadsheets/d/1CLmhUxbgZrdlFAs_lLxYv1e6Gqikyo7MEUDSjUxnReM/gviz/tq";


async function fetchSheetData() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();
  const json = JSON.parse(text.substr(47).slice(0, -2));
  return json.table.rows;
}

function checkMember(rows, memberId) {
  for (let row of rows) {
    const id = row.c[0]?.v;
    const name = row.c[1]?.v;
    const status = row.c[2]?.v;

    if (id == memberId) {
      return { found: true, name, status };
    }
  }
  return { found: false };
}

function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(msg);
}

function flashScreen(color) {
  const flash = document.getElementById("flash");
  flash.className = "flash " + color;
  flash.style.opacity = 1;
  setTimeout(() => flash.style.opacity = 0, 500);
}
