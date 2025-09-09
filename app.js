let files = [];

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const fileTable = document.getElementById("fileTable");
const boolCheckbox = document.getElementById("bool");
const baseName = document.getElementById("baseName");
const startNum = document.getElementById("startNum");
const zeroPad = document.getElementById("zeroPad");
const prefixText = document.getElementById("prefixText");
const suffixText = document.getElementById("suffixText");
const keepExt = document.getElementById("keepExt");
const sortFiles = document.getElementById("sortFiles");
const previewDiv = document.getElementById("preview");

dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("dragover", e => {
  e.preventDefault();
  dropzone.style.borderColor = "var(--primary)";
});
dropzone.addEventListener("dragleave", () => {
  dropzone.style.borderColor = "var(--border)";
});
dropzone.addEventListener("drop", e => {
  e.preventDefault();
  handleFiles(e.dataTransfer.files);
  dropzone.style.borderColor = "var(--border)";
});
fileInput.addEventListener("change", e => handleFiles(e.target.files));

function handleFiles(selectedFiles) {
  files = [...files, ...selectedFiles];
  renderTable();
}

function renderTable() {
  if (files.length === 0) {
    fileTable.innerHTML = `<tr><td colspan="5">No files selected yet.</td></tr>`;
    return;
  }
  let rows = "";
  files.forEach((f, i) => {
    rows += `<tr>
      <td>${i + 1}</td>
      <td>${f.name}</td>
      <td>${f.type || "unknown"}</td>
      <td>${(f.size / 1024).toFixed(1)} KB</td>
      <td><button class="delete-btn" onclick="deleteFile(${i})">❌</button></td>
    </tr>`;
  });
  fileTable.innerHTML = rows;
}

function deleteFile(index) {
  files.splice(index, 1);
  renderTable();
}

boolCheckbox.addEventListener("change", () => {
  const disabled = !boolCheckbox.checked;
  [baseName, startNum, zeroPad].forEach(el => el.disabled = disabled);
});

document.getElementById("previewBtn").addEventListener("click", () => {
  if (files.length === 0) {
    previewDiv.textContent = "No files selected.";
    return;
  }

  let newNames = generateNewNames();
  previewDiv.textContent = "Preview: " + newNames.join(", ");
});

document.getElementById("downloadBtn").addEventListener("click", async () => {
  if (files.length === 0) {
    alert("No files to download!");
    return;
  }

  const zip = new JSZip();
  let newNames = generateNewNames();

  files.forEach((file, i) => {
    zip.file(newNames[i], file);
  });

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "renamed_files.zip");
});

document.getElementById("clearBtn").addEventListener("click", () => {
  files = [];
  renderTable();
  previewDiv.textContent = "Ready";
});

function generateNewNames() {
  let newNames = [];
  let start = parseInt(startNum.value) || 1;
  let pad = parseInt(zeroPad.value) || 0;
  let prefix = prefixText.value || "";
  let suffix = suffixText.value || "";

  let sortedFiles = sortFiles.checked
    ? [...files].sort((a, b) => a.name.localeCompare(b.name))
    : files;

  sortedFiles.forEach((file, i) => {
    let ext = keepExt.checked ? "." + file.name.split(".").pop() : "";
    let name;

    if (boolCheckbox.checked) {
      let num = (start + i).toString().padStart(pad, "0");
      name = `${prefix}${baseName.value || "file"}${num}${suffix}${ext}`;
    } else {
      let original = file.name.replace(/\.[^/.]+$/, "");
      name = `${prefix}${original}${suffix}${ext}`;
    }

    newNames.push(name);
  });

  return newNames;
}
