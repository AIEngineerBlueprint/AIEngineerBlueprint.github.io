/**
 * Builds one printable Word document (.docx) from every generated chapter page,
 * in the same track/chapter order as the live site, with a native Word table of
 * contents. Run `npm run generate` first so sections/**\/*.html is current.
 *
 * Usage: node scripts/build-book.js
 * Output: book/AIEngineerBlueprint.docx (and the intermediate book/source.html)
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const out = (...p) => path.join(root, ...p);

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

// ---- 1. Load track/chapter order from the generator source (single source of truth) ----
const genSrc = read(out("scripts", "generate-site.js"));
const sectionsLiteral = genSrc.match(/const sections = \[([\s\S]*?)\n\];/)[1];
const sections = eval("[" + sectionsLiteral + "]"); // [[slug, name, chapters[]], ...]

// ---- 2. HTML cleanup helpers -------------------------------------------------

function stripAttrs(html) {
  return html.replace(/<(section|div|p|ul|ol|li|strong|em|table|thead|tbody|tr|td|th|blockquote)( [^>]*)?>/g, "<$1>");
}

function unwrapContainers(html) {
  return html.replace(/<\/?(?:section|div)>/g, "");
}

function demoteHeadings(html) {
  return html
    .replace(/<h3>/g, "<h4>").replace(/<\/h3>/g, "</h4>")
    .replace(/<h2>/g, "<h3>").replace(/<\/h2>/g, "</h3>");
}

function transformQuizzes(html) {
  return html.replace(/<section class="panel quiz"[^>]*>([\s\S]*?)<\/section>/g, (whole, inner) => {
    const heading = (inner.match(/<h2>([\s\S]*?)<\/h2>/) || [, "Check yourself"])[1];
    const question = (inner.match(/<p><strong>([\s\S]*?)<\/strong><\/p>/) || [, ""])[1];
    const options = [...inner.matchAll(/<button data-answer="(right|wrong)">([\s\S]*?)<\/button>/g)];
    const items = options.map(([, answer, text]) =>
      answer === "right" ? `<li><strong>Correct answer:</strong> ${text}</li>` : `<li>${text}</li>`
    ).join("");
    return `<section class="panel"><h2>${heading}</h2><p><strong>${question}</strong></p><ul>${items}</ul></section>`;
  });
}

function transformDiagrams(html) {
  return html.replace(/<section class="panel">\s*<h2>Topic diagram<\/h2>[\s\S]*?<\/section>/g, (whole) => {
    const label = (whole.match(/aria-label="([^"]*)"/) || [, ""])[1];
    return `<section class="panel"><h2>Topic diagram</h2><p><em>${label ? "Diagram: " + label : "Diagram omitted for print."}</em></p></section>`;
  });
}

function cleanChapterBody(articleInner) {
  let html = articleInner;

  // Capture the lede before removing the hero block.
  const lede = (html.match(/<p class="lede">([\s\S]*?)<\/p>/) || [, ""])[1];

  // Remove the hero block (title/eyebrow/meta/bookmark button) — we render our own heading.
  html = html.replace(/<div class="lesson-hero">[\s\S]*?<button class="bookmark"[^>]*>Bookmark<\/button>\s*<\/div>/, "");

  html = transformQuizzes(html);
  html = transformDiagrams(html);

  // Remove the "mark complete" box and any stray buttons (e.g. expand-diagram).
  html = html.replace(/<div class="complete-box">[\s\S]*?<\/div>/, "");
  html = html.replace(/<button[\s\S]*?<\/button>/g, "");
  html = html.replace(/<p class="quiz-result"[^>]*><\/p>/g, "");

  html = stripAttrs(html);
  html = unwrapContainers(html);
  html = demoteHeadings(html);

  return { lede, body: html.trim() };
}

function cleanTrackIntro(indexHtml) {
  const outcomes = (indexHtml.match(/<section class="panel">\s*<h2>Track outcomes<\/h2>([\s\S]*?)<\/section>/) || [, ""])[1];
  const running = (indexHtml.match(/<section class="panel hook-card">\s*<h2>The running example<\/h2>([\s\S]*?)<\/section>/) || [, ""])[1];
  let html = "";
  if (outcomes.trim()) html += `<section class="panel"><h2>Track outcomes</h2>${outcomes}</section>`;
  if (running.trim()) html += `<section class="panel"><h2>The running example</h2>${running}</section>`;
  html = stripAttrs(html);
  html = unwrapContainers(html);
  return html.trim();
}

// ---- 3. Assemble the combined document --------------------------------------

console.log("Assembling chapters in site order...");
let body = "";
let chapterCount = 0;

for (const [slug, name, chapters] of sections) {
  const indexPath = out("sections", slug, "index.html");
  const trackIntro = fs.existsSync(indexPath) ? cleanTrackIntro(read(indexPath)) : "";
  body += `<h1>${name}</h1>\n${trackIntro}\n`;

  for (const chapter of chapters) {
    const chapterPath = out("sections", slug, `${slugify(chapter)}.html`);
    if (!fs.existsSync(chapterPath)) {
      console.warn(`  missing: ${slug}/${slugify(chapter)}.html`);
      continue;
    }
    const html = read(chapterPath);
    const articleMatch = html.match(/<article class="lesson"[^>]*>([\s\S]*?)<\/article>/);
    if (!articleMatch) continue;
    const { lede, body: cleanedBody } = cleanChapterBody(articleMatch[1]);
    body += `<h2>${chapter}</h2>\n`;
    if (lede.trim()) body += `<blockquote><p>${lede}</p></blockquote>\n`;
    body += cleanedBody + "\n";
    chapterCount++;
  }
}

// ---- 4. Glossary appendix -----------------------------------------------------

const glossaryPath = out("glossary.html");
if (fs.existsSync(glossaryPath)) {
  const glossaryHtml = read(glossaryPath);
  const entries = [...glossaryHtml.matchAll(/<article id="[^"]*"><h2>([^<]*)<\/h2><p>([^<]*)<\/p><\/article>/g)];
  if (entries.length) {
    body += `<h1>Glossary</h1>\n`;
    for (const [, term, definition] of entries) {
      body += `<p><strong>${term}</strong> — ${definition}</p>\n`;
    }
  }
}

console.log(`Assembled ${chapterCount} chapters across ${sections.length} tracks.`);

// ---- 5. Write the combined source HTML ----------------------------------------

const bookDir = out("book");
fs.mkdirSync(bookDir, { recursive: true });
const sourceHtmlPath = path.join(bookDir, "source.html");
fs.writeFileSync(sourceHtmlPath, `<!doctype html><html><head><meta charset="utf-8"></head><body>\n${body}\n</body></html>`);
console.log(`Wrote ${sourceHtmlPath} (${(fs.statSync(sourceHtmlPath).size / 1024 / 1024).toFixed(1)} MB)`);

// ---- 6. Prepare a Word-native reference template, with a page break before each track ----
// Always rebuilt fresh so a stale cached copy never silently skips the patch below.

const referenceDocxPath = path.join(bookDir, "reference.docx");
console.log("Generating Word reference template...");
fs.rmSync(referenceDocxPath, { force: true });
execSync(`pandoc --print-default-data-file reference.docx > "${referenceDocxPath}"`, { cwd: bookDir });

// Patch styles.xml so Heading 1 (Track) always starts on a new page — a proper
// book-style layout using Word's own style system, not a hack per paragraph.
{
  const patchDir = path.join(bookDir, "_refdocx");
  fs.rmSync(patchDir, { recursive: true, force: true });
  fs.mkdirSync(patchDir, { recursive: true });
  execSync(`unzip -q "${referenceDocxPath}" -d "${patchDir}"`);
  const stylesPath = path.join(patchDir, "word", "styles.xml");
  let styles = read(stylesPath);
  styles = styles.replace(
    /(<w:style[^>]*w:styleId="Heading1"[^>]*>[\s\S]*?<w:pPr>)/,
    "$1<w:pageBreakBefore/>"
  );
  fs.writeFileSync(stylesPath, styles);
  fs.rmSync(referenceDocxPath);
  execSync(`cd "${patchDir}" && zip -q -r "${referenceDocxPath}" .`);
  fs.rmSync(patchDir, { recursive: true, force: true });
  console.log("Reference template ready (Heading 1 = page break before).");
}

// ---- 7. Convert to .docx with pandoc: a live Word TOC field, tracks only (depth 1) ----

const docxPath = path.join(bookDir, "AIEngineerBlueprint.docx");
console.log("Running pandoc (this can take a couple of minutes for ~600 chapters)...");
execSync(
  [
    "pandoc",
    `"${sourceHtmlPath}"`,
    "-f html",
    "-t docx",
    "--standalone",
    "--toc",
    "--toc-depth=1", // main headlines only: tracks + Glossary, not chapters
    `--reference-doc="${referenceDocxPath}"`,
    // No --metadata title/author/date here: combined with --toc, pandoc renders its
    // own small title/author/date block right before the TOC, which would duplicate
    // the title page we insert manually below (with proper Title/Subtitle styling
    // and a guaranteed page break). The title page below is the only one rendered.
    `-o "${docxPath}"`
  ].join(" "),
  { stdio: "inherit" }
);

// ---- 8. Insert a real Word title page (Title/Subtitle styles) before the TOC ----
// Pandoc's TOC field lands as the very first thing in the body with no page break of
// its own, so without this step the TOC sits on page 1. Inserting a title page here,
// ended by an explicit page break, is what pushes the TOC field to page 2.

{
  const patchDir = path.join(bookDir, "_docx");
  fs.rmSync(patchDir, { recursive: true, force: true });
  fs.mkdirSync(patchDir, { recursive: true });
  execSync(`unzip -q "${docxPath}" -d "${patchDir}"`);
  const docPath = path.join(patchDir, "word", "document.xml");
  let doc = read(docPath);
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" });
  const titlePage = [
    `<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t xml:space="preserve">AIEngineerBlueprint</w:t></w:r></w:p>`,
    `<w:p><w:pPr><w:pStyle w:val="Subtitle"/></w:pPr><w:r><w:t xml:space="preserve">The Complete Curriculum: LLMs, RAG, Agents, MCP, Guardrails, and Production AI Systems</w:t></w:r></w:p>`,
    `<w:p><w:r><w:t xml:space="preserve">AIEngineerBlueprint.github.io</w:t></w:r></w:p>`,
    `<w:p><w:r><w:t xml:space="preserve">${dateStr}</w:t></w:r></w:p>`,
    `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`
  ].join("");
  doc = doc.replace("<w:body>", `<w:body>${titlePage}`);
  fs.writeFileSync(docPath, doc);
  fs.rmSync(docxPath);
  execSync(`cd "${patchDir}" && zip -q -r "${docxPath}" .`);
  fs.rmSync(patchDir, { recursive: true, force: true });
  console.log("Title page inserted; TOC now starts on page 2.");
}

const sizeMb = (fs.statSync(docxPath).size / 1024 / 1024).toFixed(1);
console.log(`\nDone: ${docxPath} (${sizeMb} MB)`);
console.log("Open in Word, right-click the table of contents, and choose 'Update field' to fill in page numbers, then File > Print > Save as PDF.");
console.log("Note: the TOC field ships empty until Word calculates it once on open/update — that's how Word TOC fields always work, not a bug.");
