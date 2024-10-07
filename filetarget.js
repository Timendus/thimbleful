/*
 * This class installs global event handlers for dragging and dropping a file or
 * clicking to upload a file. The relevant callback gets called, based on the
 * element that the file was dropped on or selected through. This allows us to
 * swap out and rerender whole sections of the DOM without having to reinstall a
 * bunch of event handlers each time. This nicely decouples the render logic
 * from the drag event management logic.
 *
 * Usage:
 *
 * ```javascript
 * import ft from "./filetarget.js";
 *
 * ft.setEventListener("div#file-thing", (file, element) = {
 *   console.log(file);      // Will give the name, binary contents, and text contents of the file
 *   console.log(element);   // Will give back the div#file-thing element that was clicked/dropped on
 * }, {
 *   startIn: "documents",                  // Optional directions for the file picker
 *   types: [{
 *     description: 'My very special file type',
 *     accept: {
 *       'text/plain': ['.extension'],
 *     },
 *   }],
 * });
 * ```
 *
 * Also, a class `dragging` will be applied to the element when the user drags a
 * file over it. The name of this class can be changed below if necessary.
 */

const DRAG_CLASS = "dragging";

/**
 * @typedef {Object} LoadOptions
 * @property {FileTypes[]} types - Which file types are supported
 * @property {("desktop"|"document"|"downloads"|"music"|"pictures"|"videos")}
 * startIn - Where the file picker opens
 */

/**
 * @typedef {Object} LoadedFile
 * @property {string} name - The name of the file
 * @property {ArrayBuffer} binaryContents - The binary contents of the file
 * @property {string} textContents - The text contents of the file
 */

/**
 * Handle a global file drop or select event
 * @callback fileEventListener
 * @param {LoadedFile} file - The file that was uploaded
 * @param {HTMLElement} element - The element that it was uploaded through
 */

if (!window.fileHandlers) {
  document.addEventListener("dragover", (e) => wrapHandler(e, dragover));
  document.addEventListener("dragleave", (e) => wrapHandler(e, dragleave));
  document.addEventListener("drop", (e) => wrapHandler(e, drop));
  document.addEventListener("click", (e) => wrapHandler(e, select));
  window.fileHandlers = {};
}

/**
 * Set a global file target listener
 * @param {string} selector - CSS selector of the element(s) to trigger on
 * @param {fileEventListener} handler - The function to call when a file is uploaded on `selector`
 * @param {LoadOptions} options - Options for the file picker
 */
export function setEventListener(selector, handler, options = {}) {
  window.fileHandlers[selector] = {
    func: handler,
    options: options,
  };
}

function wrapHandler(e, func) {
  for (const selector in window.fileHandlers) {
    const element = e.target.closest(selector);
    if (element) {
      e.stopPropagation();
      e.preventDefault();
      return func(element, window.fileHandlers[selector], e);
    }
  }
}

function dragover(element, _, e) {
  e.dataTransfer.dropEffect = "copy";
  element.classList.add(DRAG_CLASS);
}

function dragleave(element) {
  element.classList.remove(DRAG_CLASS);
}

async function drop(element, handler, e) {
  element.classList.remove(DRAG_CLASS);
  const file = await createLoadedFile(e.dataTransfer.files[0]);
  handler.func(file, element);
}

async function select(element, handler, e) {
  element.classList.remove(DRAG_CLASS);

  if ("showOpenFilePicker" in window) {
    const [fileHandle] = await window.showOpenFilePicker(handler.options);
    const file = await fileHandle.getFile();
    handler.func(
      {
        name: file.name,
        binaryContents: await file.arrayBuffer(),
        textContents: await file.text(),
      },
      element
    );
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.addEventListener("change", async (c) => {
    if (c.target.files.length != 1) return;
    const file = await createLoadedFile(c.target.files[0]);
    handler.func(file, element);
  });
  input.click();
}

async function createLoadedFile(file) {
  return {
    name: file.name,
    binaryContents: await readFileBinary(file),
    textContents: await readFileText(file),
  };
}

function readFileBinary(file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.addEventListener("load", (e) => resolve(e.target.result));
    reader.addEventListener("error", reject);
    reader.readAsArrayBuffer(file);
  });
}

function readFileText(file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.addEventListener("load", (e) => resolve(e.target.result));
    reader.addEventListener("error", reject);
    reader.readAsText(file);
  });
}
