const fileInput = document.querySelector("#file-input");
const submitButton = document.querySelector("#submit");
const thumbnailPreview = document.querySelector("#thumbnail");
const errorDiv = document.querySelector("#error");

const API_ENDPOINT = "http://localhost:3100/thumbnail";

submitButton.addEventListener("click", async () => {
  const { files } = fileInput;

  if (files.length > 0) {
    const file = files[0];
    try {
      const thumbnail = await createThumbnail(file);
      thumbnailPreview.src = thumbnail;
    } catch (error) {
      showError(error);
    }
  } else {
    showError("Please select a file");
  }
});

function showError(msg) {
  errorDiv.innerText = `ERROR: ${msg}`;
}

async function createThumbnail(video) {
  const payload = new FormData();
  payload.append("video", video);

  const res = await fetch(API_ENDPOINT, {
    method: "POST",
    body: payload,
  });

  if (!res.ok) {
    throw new Error("Creating thumbnail failed");
  }

  const thumbnailBlob = await res.blob();
  const thumbnail = await blobToDataURL(thumbnailBlob);

  return thumbnail;
}

async function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.onabort = () => reject(new Error("Read aborted"));
    reader.readAsDataURL(blob);
  });
}
