document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addBtn");
  const notesContainer = document.getElementById("notesContainer");

  // Load saved notes
  chrome.storage.local.get(["notes"], (result) => {
    if (result.notes) {
      result.notes.forEach((note) => addNoteToDOM(note.text, note.icon));
    }
  });

  addBtn.addEventListener("click", () => {
    const noteText = prompt("Enter your note:");
    if (!noteText) return;

    const noteIcon = prompt("Enter an emoji or image URL for the icon (optional):", "");
    addNoteToDOM(noteText, noteIcon);
    saveNotes();

    // Save note as file - DISABLED
    /*
    saveNoteAsFile(noteText, noteIcon);
    */
  });

  function addNoteToDOM(text, icon) {
    const note = document.createElement("div");
    note.className = "note";

    const iconElem = document.createElement("span");
    iconElem.className = "note-icon";
    if (icon) {
      if (icon.startsWith("http")) {
        const img = document.createElement("img");
        img.src = icon;
        img.width = 20;
        img.height = 20;
        iconElem.appendChild(img);
      } else {
        iconElem.textContent = icon; // emoji
      }
    }

    const span = document.createElement("span");
    span.textContent = text;
    span.style.marginLeft = "5px";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.className = "deleteBtn";
    deleteBtn.addEventListener("click", () => {
      note.remove();
      saveNotes();
    });

    note.appendChild(iconElem);
    note.appendChild(span);
    note.appendChild(deleteBtn);
    notesContainer.appendChild(note);
  }

  function saveNotes() {
    const notes = Array.from(document.querySelectorAll(".note")).map((note) => {
      const text = note.querySelector("span:nth-child(2)").textContent;
      const iconElem = note.querySelector(".note-icon");
      let icon = "";
      if (iconElem) {
        const img = iconElem.querySelector("img");
        icon = img ? img.src : iconElem.textContent;
      }
      return { text, icon };
    });
    chrome.storage.local.set({ notes });
  }

  // Save note as TXT file silently - DISABLED
  /*
  function saveNoteAsFile(text, icon) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    const filename = `FNLS_${timestamp}.txt`;

    const content = icon ? `[${icon}] ${text}` : text;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: false
    });
  }
  */
});
