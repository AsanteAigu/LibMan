const pptxgen = require("pptxgenjs");

// ---------- palette (content-informed: matches LibMan's real product brand) ----------
const NAVY = "041632"; // dominant — LibMan's actual primary brand color
const PARCHMENT = "D9CBA8"; // supporting — book-page tone
const GOLD = "C89B3C"; // sharp accent — gilt-lettering tone
const BG_LIGHT = "FCF9F8"; // matches the real app's background
const WHITE = "FFFFFF";
const TEXT_MUTED = "5B6472";
const CARD_TINT = "F3ECDD"; // faint parchment tint for cards

const HEAD_FONT = "Cambria";
const BODY_FONT = "Calibri";

const ICON = (name, color) => `icons/${name}-${color}.png`;

function newPres() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.3" x 7.5"
  pres.defineLayout({ name: "LIBMAN", width: 13.333, height: 7.5 });
  pres.layout = "LIBMAN";
  return pres;
}

function darkSlide(pres) {
  const s = pres.addSlide();
  s.background = { color: NAVY };
  return s;
}

function lightSlide(pres) {
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  return s;
}

function footer(s, pageNum, section) {
  s.addText(section, {
    x: 0.5, y: 7.08, w: 8, h: 0.3, fontFace: BODY_FONT, fontSize: 10,
    color: TEXT_MUTED, align: "left", margin: 0,
  });
  s.addText(String(pageNum), {
    x: 12.6, y: 7.08, w: 0.5, h: 0.3, fontFace: BODY_FONT, fontSize: 10,
    color: TEXT_MUTED, align: "right", margin: 0,
  });
}

function title(s, text, opts = {}) {
  s.addText(text, {
    x: 0.6, y: 0.45, w: 12.1, h: 0.9,
    fontFace: HEAD_FONT, fontSize: opts.size || 30, bold: true,
    color: opts.color || NAVY, align: "left", margin: 0,
  });
}

function iconBadge(s, iconName, iconColor, x, y, d, circleColor) {
  s.addShape("ellipse", { x, y, w: d, h: d, fill: { color: circleColor }, line: { type: "none" } });
  const pad = d * 0.26;
  s.addImage({ path: ICON(iconName, iconColor), x: x + pad / 2, y: y + pad / 2, w: d - pad, h: d - pad });
}

function iconRow(s, iconName, iconColor, circleColor, x, y, w, headline, body, opts = {}) {
  const d = opts.d || 0.55;
  iconBadge(s, iconName, iconColor, x, y, d, circleColor);
  s.addText(
    [
      { text: headline, options: { bold: true, breakLine: true, color: opts.headColor || NAVY, fontSize: opts.headSize || 14 } },
      { text: body, options: { color: opts.bodyColor || TEXT_MUTED, fontSize: opts.bodySize || 11.5 } },
    ],
    { x: x + d + 0.22, y: y - 0.06, w: w - d - 0.22, h: opts.h || 0.9, fontFace: BODY_FONT, valign: "top", margin: 0 }
  );
}

function arrow(s, x1, y1, x2, y2, color) {
  s.addShape("line", {
    x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.01, h: Math.abs(y2 - y1) || 0.01,
    line: { color, width: 2, endArrowType: "triangle" },
    flipV: y2 < y1, flipH: x2 < x1,
  });
}

function box(s, x, y, w, h, label, opts = {}) {
  s.addShape("roundRect", {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: opts.fill || WHITE },
    line: { color: opts.line || NAVY, width: 1.25 },
  });
  s.addText(label, {
    x, y, w, h, fontFace: BODY_FONT, fontSize: opts.fontSize || 12, bold: opts.bold !== false,
    color: opts.color || NAVY, align: "center", valign: "middle", margin: 0,
  });
}

// ============================================================
const pres = newPres();
let n = 0;

// ---------- 1. TITLE ----------
{
  const s = darkSlide(pres);
  n++;
  s.addImage({ path: ICON("bookOpen", "gold"), x: 10.3, y: 1.5, w: 2.4, h: 2.4, transparency: 15 });
  s.addText("LibMan", { x: 0.9, y: 2.35, w: 9, h: 1.4, fontFace: HEAD_FONT, fontSize: 60, bold: true, color: WHITE, margin: 0 });
  s.addText("University Library Management System", {
    x: 0.95, y: 3.55, w: 9.5, h: 0.6, fontFace: BODY_FONT, fontSize: 20, color: GOLD, margin: 0,
  });
  s.addText("Catalogue  •  Circulation  •  Digital Lending  •  Payments — one platform, fully deployed", {
    x: 0.95, y: 4.2, w: 9.5, h: 0.5, fontFace: BODY_FONT, italic: true, fontSize: 13, color: PARCHMENT, margin: 0,
  });
  s.addText("Asante Gabriel Kwaku   |   Project Report Presentation   |   August 2026", {
    x: 0.95, y: 6.6, w: 10, h: 0.4, fontFace: BODY_FONT, fontSize: 12, color: PARCHMENT, margin: 0,
  });
}

// ---------- 2. THE PROBLEM ----------
{
  const s = lightSlide(pres); n++;
  title(s, "Why LibMan?");
  const problems = [
    ["triangleExclaim", "Paper-based records", "Manual borrowing logs are slow, and easy to lose or misfile."],
    ["triangleExclaim", "No self-service", "Every request needs a staff member at a desk to process."],
    ["triangleExclaim", "No digital lending", "No unified way to lend and read ebook titles online."],
    ["triangleExclaim", "Manual fee collection", "Fines and fees are tracked and collected by hand."],
  ];
  let y = 1.7;
  for (const [icon, head, body] of problems) {
    iconRow(s, icon, "white", GOLD, 0.7, y, 6.6, head, body, { h: 0.85 });
    y += 1.15;
  }
  s.addShape("roundRect", { x: 7.9, y: 1.9, w: 4.75, h: 3.9, rectRadius: 0.12, fill: { color: NAVY }, line: { type: "none" } });
  s.addText([
    { text: "One platform", options: { breakLine: true, bold: true, fontSize: 26, color: WHITE } },
    { text: "for physical circulation, digital lending, and payments — built and deployed end to end.", options: { fontSize: 13, color: PARCHMENT } },
  ], { x: 8.25, y: 3.0, w: 4.05, h: 1.7, fontFace: BODY_FONT, align: "left", valign: "top", margin: 0 });
  footer(s, n, "Introduction");
}

// ---------- 3. OBJECTIVES ----------
{
  const s = lightSlide(pres); n++;
  title(s, "Project Objectives");
  const objs = [
    ["bullseye", "Self-service borrowing", "Browse, request, and manage loans without staff intervention."],
    ["book", "Physical + digital", "One platform for printed copies and ebook lending alike."],
    ["moneyBill", "Automated fees", "Real payment processing for fines and membership dues."],
    ["userShield", "Librarian toolkit", "Full catalogue, circulation, and user administration."],
    ["shield", "Consistent rules", "Business rules enforced automatically, every time."],
    ["cloud", "Always-on", "Deployed to production, continuously reachable."],
  ];
  const cols = 3, colW = 3.95, rowH = 2.15, x0 = 0.65, y0 = 1.75;
  objs.forEach(([icon, head, body], i) => {
    const cx = x0 + (i % cols) * colW;
    const cy = y0 + Math.floor(i / cols) * rowH;
    iconBadge(s, icon, "white", cx, cy, 0.62, NAVY);
    s.addText([
      { text: head, options: { breakLine: true, bold: true, fontSize: 14, color: NAVY } },
      { text: body, options: { fontSize: 11, color: TEXT_MUTED } },
    ], { x: cx, y: cy + 0.75, w: colW - 0.35, h: 1.1, fontFace: BODY_FONT, align: "left", valign: "top", margin: 0 });
  });
  footer(s, n, "Introduction");
}

// ---------- 4. SYSTEM ARCHITECTURE ----------
{
  const s = lightSlide(pres); n++;
  title(s, "System Architecture");
  box(s, 4.9, 1.55, 3.5, 0.6, "Browser / Mobile (PWA)", { fill: PARCHMENT });
  arrow(s, 6.65, 2.15, 6.65, 2.55, NAVY);
  box(s, 4.4, 2.6, 4.5, 0.6, "Next.js Frontend — Cloudflare Workers", { fill: WHITE });
  arrow(s, 6.65, 3.2, 6.65, 3.6, NAVY);
  box(s, 4.15, 3.65, 5, 0.65, "Spring Boot REST API — Render (Docker)", { fill: NAVY, color: WHITE });
  arrow(s, 5.5, 4.3, 3.0, 4.9, NAVY);
  arrow(s, 6.65, 4.3, 6.65, 4.9, NAVY);
  arrow(s, 7.8, 4.3, 10.3, 4.9, NAVY);
  box(s, 1.1, 4.95, 3.6, 0.65, "PostgreSQL — Supabase", { fill: WHITE, fontSize: 11 });
  box(s, 4.85, 4.95, 3.6, 0.65, "Supabase Storage\n(ebook files, covers)", { fill: WHITE, fontSize: 11 });
  box(s, 8.6, 4.95, 3.6, 0.65, "Paystack (payments)", { fill: WHITE, fontSize: 11 });
  s.addShape("roundRect", {
    x: 1.1, y: 5.95, w: 11.1, h: 0.7, rectRadius: 0.08, fill: { color: CARD_TINT }, line: { color: GOLD, width: 1 },
  });
  s.addText("GitHub Actions + an external uptime monitor ping the backend's health endpoint every few minutes, so Render's free-tier inactivity spin-down never triggers.", {
    x: 1.35, y: 5.95, w: 10.6, h: 0.7, fontFace: BODY_FONT, italic: true, fontSize: 11.5, color: NAVY, valign: "middle", margin: 0,
  });
  footer(s, n, "System Design");
}

// ---------- 5. TECH STACK — FRONTEND ----------
{
  const s = lightSlide(pres); n++;
  title(s, "Technology Stack — Frontend");
  const items = [
    ["code", "Next.js 16", "App Router, Turbopack"],
    ["code", "React 19 + TypeScript", "Typed, component-driven UI"],
    ["puzzlePiece", "Tailwind CSS v4 + shadcn/ui", "Design system on Base UI primitives"],
    ["sync", "TanStack Query", "Server-state caching & invalidation"],
    ["checkCircle", "React Hook Form + Zod", "Typed, validated forms"],
    ["cloud", "Axios", "Typed API client with auth interceptor"],
    ["bookOpen", "react-pdf", "In-browser PDF rendering"],
    ["book", "epubjs", "In-browser EPUB rendering"],
  ];
  const cols = 2, colW = 5.9, rowH = 1.28, x0 = 0.7, y0 = 1.7;
  items.forEach(([icon, head, body], i) => {
    const cx = x0 + (i % cols) * colW;
    const cy = y0 + Math.floor(i / cols) * rowH;
    iconRow(s, icon, "white", NAVY, cx, cy, colW - 0.3, head, body, { d: 0.5, h: 0.75, headSize: 13, bodySize: 10.5 });
  });
  footer(s, n, "System Design");
}

// ---------- 6. TECH STACK — BACKEND ----------
{
  const s = lightSlide(pres); n++;
  title(s, "Technology Stack — Backend");
  const items = [
    ["server", "Spring Boot 4.1", "Layered controller / service / repository"],
    ["shield", "Spring Security 7.1", "JWT via OAuth2 Resource Server"],
    ["database", "Hibernate ORM 7.4", "JPA persistence over PostgreSQL"],
    ["database", "PostgreSQL 17", "Hosted on Supabase"],
    ["code", "Java 21 + Maven", "Build and dependency management"],
    ["cloud", "Docker", "Explicit, reproducible runtime image"],
  ];
  const cols = 2, colW = 5.9, rowH = 1.55, x0 = 0.7, y0 = 1.8;
  items.forEach(([icon, head, body], i) => {
    const cx = x0 + (i % cols) * colW;
    const cy = y0 + Math.floor(i / cols) * rowH;
    iconRow(s, icon, "white", NAVY, cx, cy, colW - 0.3, head, body, { d: 0.55, h: 0.9, headSize: 14, bodySize: 11 });
  });
  footer(s, n, "System Design");
}

// ---------- 7. USER ROLES ----------
{
  const s = lightSlide(pres); n++;
  title(s, "Who Uses LibMan");
  const roles = [
    ["user", "Guest", ["Browse the full catalogue", "Search titles & authors", "Register or sign in"]],
    ["graduationCap", "Student", ["Borrow physical & ebook titles", "Choose loan duration (1 min–30 days)", "Reserve, extend, pay charges", "Read ebooks in-browser"]],
    ["userShield", "Librarian", ["Approve/reject requests", "Manage catalogue & covers", "Upload ebook files", "Process returns, users, reports"]],
  ];
  const colW = 3.95, x0 = 0.65, y0 = 1.65;
  roles.forEach(([icon, name, list], i) => {
    const cx = x0 + i * colW;
    s.addShape("roundRect", { x: cx, y: y0, w: colW - 0.3, h: 4.9, rectRadius: 0.1, fill: { color: i === 1 ? NAVY : WHITE }, line: { color: NAVY, width: 1 } });
    iconBadge(s, icon, i === 1 ? "navy" : "white", cx + (colW - 0.3) / 2 - 0.45, y0 + 0.35, 0.9, i === 1 ? GOLD : NAVY);
    s.addText(name, { x: cx, y: y0 + 1.35, w: colW - 0.3, h: 0.5, fontFace: HEAD_FONT, bold: true, fontSize: 18, color: i === 1 ? WHITE : NAVY, align: "center", margin: 0 });
    const bulletItems = list.map((t, idx) => ({ text: t, options: { bullet: { code: "2022" }, breakLine: idx !== list.length - 1, color: i === 1 ? WHITE : TEXT_MUTED, fontSize: 12 } }));
    s.addText(bulletItems, { x: cx + 0.3, y: y0 + 2.0, w: colW - 0.85, h: 2.7, fontFace: BODY_FONT, valign: "top", paraSpaceAfter: 8, margin: 0 });
  });
  footer(s, n, "System Design");
}

// ---------- 8. DATABASE DESIGN ----------
{
  const s = lightSlide(pres); n++;
  title(s, "Database Design");
  const t = (label, x, y, w = 2.0, h = 0.55, fill = WHITE, color = NAVY) => box(s, x, y, w, h, label, { fill, color, fontSize: 10.5 });
  t("users", 5.7, 1.55, 2.0, 0.55, NAVY, WHITE);
  t("borrow_requests", 2.4, 2.65);
  t("reservations", 5.7, 2.65);
  t("charges", 9.0, 2.65);
  t("loans", 2.4, 3.75);
  t("payments", 9.0, 3.75);
  t("titles / copies", 2.4, 4.85);
  t("ebook_editions", 9.0, 4.85);
  t("ebook_loans", 9.0, 5.95);
  const line = (x1, y1, x2, y2) => s.addShape("line", { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.01, h: Math.abs(y2 - y1) || 0.01, line: { color: TEXT_MUTED, width: 1 } });
  line(6.7, 2.1, 3.4, 2.65); line(6.7, 2.1, 6.7, 2.65); line(6.7, 2.1, 10.0, 2.65);
  line(3.4, 3.2, 3.4, 3.75); line(10.0, 3.2, 10.0, 3.75);
  line(3.4, 4.3, 3.4, 4.85); line(10.0, 4.3, 10.0, 4.85);
  line(10.0, 5.4, 10.0, 5.95);
  s.addText(
    "Circulation state is driven largely by PostgreSQL triggers — approval creates the loan, collection sets the due date, and return releases the copy or advances the queue.",
    { x: 0.6, y: 6.65, w: 12.1, h: 0.35, fontFace: BODY_FONT, italic: true, fontSize: 11, color: TEXT_MUTED, margin: 0 }
  );
  footer(s, n, "System Design");
}

// ---------- 9. BORROWING WORKFLOW ----------
{
  const s = lightSlide(pres); n++;
  title(s, "Borrowing Workflow");
  const steps = ["Request", "Approve", "Hold\n(6-hour window)", "Collect", "Loan", "Return"];
  const n_ = steps.length, x0 = 0.9, gap = 2.0, y = 3.1, d = 1.1;
  steps.forEach((label, i) => {
    const cx = x0 + i * gap;
    s.addShape("ellipse", { x: cx, y, w: d, h: d, fill: { color: i % 2 === 0 ? NAVY : GOLD }, line: { type: "none" } });
    s.addText(String(i + 1), { x: cx, y, w: d, h: d, fontFace: HEAD_FONT, bold: true, fontSize: 26, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(label, { x: cx - 0.45, y: y + d + 0.15, w: d + 0.9, h: 0.7, fontFace: BODY_FONT, bold: true, fontSize: 12, color: NAVY, align: "center", margin: 0 });
    if (i < n_ - 1) arrow(s, cx + d + 0.05, y + d / 2, cx + gap - 0.05, y + d / 2, TEXT_MUTED);
  });
  s.addText(
    "Approval opens a six-hour collection window on the held copy. If the item is never collected, a scheduled job automatically releases it — back to the catalogue, or to the next student in the reservation queue — at no cost to the student who never took it.",
    { x: 1.0, y: 5.2, w: 11.0, h: 1.0, fontFace: BODY_FONT, fontSize: 13, color: TEXT_MUTED, align: "center", margin: 0 }
  );
  footer(s, n, "Core Features");
}

// ---------- 10. CUSTOM LOAN DURATION ----------
{
  const s = lightSlide(pres); n++;
  title(s, "Borrower-Chosen Loan Duration");
  s.addShape("roundRect", { x: 0.9, y: 2.0, w: 11.5, h: 2.1, rectRadius: 0.12, fill: { color: NAVY }, line: { type: "none" } });
  s.addText("1 minute  →  30 days", { x: 0.9, y: 2.0, w: 11.5, h: 2.1, fontFace: HEAD_FONT, bold: true, fontSize: 46, color: GOLD, align: "center", valign: "middle", margin: 0 });
  s.addText(
    "Students choose exactly how long they need an item at the moment they request it — for physical copies, or for ebooks. " +
    "The due date is calculated automatically: for physical loans, from the moment the copy is actually collected, not from when the request was approved.",
    { x: 1.6, y: 4.5, w: 10.1, h: 1.3, fontFace: BODY_FONT, fontSize: 15, color: TEXT_MUTED, align: "center", margin: 0 }
  );
  iconBadge(s, "clock", "gold", 6.02, 5.9, 1.3, NAVY);
  footer(s, n, "Core Features");
}

// ---------- 11. EBOOK LENDING & READING ----------
{
  const s = lightSlide(pres); n++;
  title(s, "Digital Lending & In-Browser Reading");
  const points = [
    "Librarians upload a PDF or EPUB file per digital edition, stored securely in Supabase Storage.",
    "Students borrow with a self-chosen duration, exactly like physical items.",
    "Books render directly in the browser — no separate app or file download.",
    "Full-screen reading mode on both PDF and EPUB formats.",
  ];
  s.addText(points.map((t, i) => ({ text: t, options: { bullet: { code: "2022" }, breakLine: i !== points.length - 1, color: NAVY, fontSize: 14 } })),
    { x: 0.7, y: 1.85, w: 6.6, h: 4.5, fontFace: BODY_FONT, valign: "top", paraSpaceAfter: 14, margin: 0 });
  ["PDF", "EPUB"].forEach((fmt, i) => {
    const cy = 2.0 + i * 2.2;
    s.addShape("roundRect", { x: 8.0, y: cy, w: 4.6, h: 1.8, rectRadius: 0.1, fill: { color: WHITE }, line: { color: NAVY, width: 1.25 } });
    iconBadge(s, "bookOpen", "white", 8.3, cy + 0.45, 0.9, i === 0 ? NAVY : GOLD);
    s.addText(fmt, { x: 9.4, y: cy + 0.55, w: 3, h: 0.7, fontFace: HEAD_FONT, bold: true, fontSize: 22, color: NAVY, valign: "middle", margin: 0 });
  });
  footer(s, n, "Core Features");
}

// ---------- 12. CHARGES, FINES & MEMBERSHIP ----------
{
  const s = lightSlide(pres); n++;
  title(s, "Charges & Fines");
  const rows = [
    ["moneyBill", "Late fee", "Calculated from days overdue × a librarian-configurable per-day rate."],
    ["triangleExclaim", "Damage / loss charge", "The title's replacement cost, applied on a damaged or lost return."],
    ["clock", "Monthly membership fee", "₵25, generated automatically for every student each month."],
    ["shield", "Unpaid = blocked", "Any unpaid charge blocks all further borrowing — physical and digital — until cleared."],
  ];
  let y = 1.85;
  for (const [icon, head, body] of rows) {
    iconRow(s, icon, "white", NAVY, 0.8, y, 11.2, head, body, { d: 0.6, h: 0.8, headSize: 15, bodySize: 12.5 });
    y += 1.2;
  }
  footer(s, n, "Core Features");
}

// ---------- 13. PAYMENTS: PAYSTACK ----------
{
  const s = lightSlide(pres); n++;
  title(s, "Secure Payments with Paystack");
  const steps = ["Checkout\nPopup Opens", "Paystack\nReturns Reference", "Backend Verifies\nwith Paystack API", "Charge\nMarked Paid"];
  const gap = 3.0, x0 = 0.9, y = 2.0, w = 2.5, h = 1.3;
  steps.forEach((label, i) => {
    const cx = x0 + i * gap;
    s.addShape("roundRect", { x: cx, y, w, h, rectRadius: 0.1, fill: { color: i === 2 ? NAVY : WHITE }, line: { color: NAVY, width: 1.25 } });
    s.addText(label, { x: cx, y, w, h, fontFace: BODY_FONT, bold: true, fontSize: 13, color: i === 2 ? WHITE : NAVY, align: "center", valign: "middle", margin: 0 });
    if (i < steps.length - 1) arrow(s, cx + w + 0.05, y + h / 2, cx + gap - 0.05, y + h / 2, TEXT_MUTED);
  });
  s.addShape("roundRect", { x: 1.6, y: 4.1, w: 10.1, h: 1.5, rectRadius: 0.1, fill: { color: CARD_TINT }, line: { color: GOLD, width: 1 } });
  s.addText("Payment success is never trusted from the client.", {
    x: 1.9, y: 4.3, w: 9.5, h: 0.5, fontFace: HEAD_FONT, bold: true, italic: true, fontSize: 16, color: NAVY, margin: 0,
  });
  s.addText("Every transaction reference is independently re-verified against Paystack's own API — checking both that it succeeded and that the amount paid exactly matches the charge — before anything is marked paid.", {
    x: 1.9, y: 4.85, w: 9.5, h: 0.65, fontFace: BODY_FONT, fontSize: 12, color: TEXT_MUTED, margin: 0,
  });
  footer(s, n, "Core Features");
}

// ---------- 14. PWA ----------
{
  const s = lightSlide(pres); n++;
  title(s, "Installable on Any Device");
  const points = [
    "Add to Home Screen on Android and iOS alike.",
    "Own app icon, splash colours, and a real app name.",
    "Standalone display — opens without browser chrome.",
    "A service worker provides the offline shell installability requires.",
  ];
  s.addText(points.map((t, i) => ({ text: t, options: { bullet: { code: "2022" }, breakLine: i !== points.length - 1, color: NAVY, fontSize: 15 } })),
    { x: 0.7, y: 2.1, w: 6.9, h: 3.5, fontFace: BODY_FONT, valign: "top", paraSpaceAfter: 16, margin: 0 });
  s.addShape("roundRect", { x: 9.6, y: 1.6, w: 2.6, h: 4.6, rectRadius: 0.25, fill: { color: NAVY }, line: { color: GOLD, width: 2 } });
  iconBadge(s, "mobile", "gold", 10.5, 3.3, 1.0, NAVY);
  footer(s, n, "Core Features");
}

// ---------- 15. SECURITY (dark) ----------
{
  const s = darkSlide(pres); n++;
  title(s, "Security by Design", { color: WHITE });
  const rows = [
    ["shield", "Hashed passwords", "Every password stored with bcrypt — never in plain text."],
    ["checkCircle", "Stateless JWT auth", "HS256-signed bearer tokens, scoped per request."],
    ["database", "Secrets stay out of source control", "Credentials and keys live only in environment configuration."],
    ["creditCard", "Server-verified payments", "Payment success is confirmed against Paystack's API, never the client."],
    ["cloud", "CORS allow-list", "Only known, explicit frontend origins may call the API."],
  ];
  let y = 1.65;
  for (const [icon, head, body] of rows) {
    iconBadge(s, icon, "navy", 0.8, y, 0.55, GOLD);
    s.addText([
      { text: head, options: { breakLine: true, bold: true, color: WHITE, fontSize: 14 } },
      { text: body, options: { color: PARCHMENT, fontSize: 11.5 } },
    ], { x: 1.55, y: y - 0.06, w: 10.8, h: 0.85, fontFace: BODY_FONT, valign: "top", margin: 0 });
    y += 1.05;
  }
  footer(s, n, "Implementation");
}

// ---------- 16. TESTING STRATEGY ----------
{
  const s = lightSlide(pres); n++;
  title(s, "Testing Strategy");
  const rows = [
    ["flask", "Unit testing", "JUnit 5 + Mockito for pure business logic — late fees, replacement charges."],
    ["checkCircle", "Static verification", "TypeScript, ESLint, and a full production build on every change."],
    ["sync", "End-to-end verification", "Real HTTP walkthroughs against live Supabase data and Paystack test mode."],
    ["bug", "Beyond the happy path", "Deliberately reproduced real production bugs before fixing them."],
  ];
  let y = 1.85;
  for (const [icon, head, body] of rows) {
    iconRow(s, icon, "white", NAVY, 0.8, y, 11.2, head, body, { d: 0.6, h: 0.8, headSize: 15, bodySize: 12.5 });
    y += 1.2;
  }
  footer(s, n, "Testing");
}

// ---------- 17. REAL BUGS, REAL FIXES ----------
{
  const s = lightSlide(pres); n++;
  title(s, "Real Bugs, Real Fixes");
  const bugs = [
    ["Search endpoints returned HTTP 500", "Postgres couldn't infer a bind parameter's type → explicit CAST in the query."],
    ["File uploads failed for every file", "A manually-set header stripped the multipart boundary → let the browser set it."],
    ["PDF reader showed huge blank gaps", "One scanned page's size was reused for the whole book → each page now sizes independently."],
    ["Cloud build failed only on Linux", "An optional dependency's lockfile entry was incomplete → pinned it explicitly."],
  ];
  const colW = 5.85, rowH = 2.15, x0 = 0.7, y0 = 1.8;
  bugs.forEach(([bug, fix], i) => {
    const cx = x0 + (i % 2) * colW;
    const cy = y0 + Math.floor(i / 2) * rowH;
    s.addShape("roundRect", { x: cx, y: cy, w: colW - 0.35, h: rowH - 0.35, rectRadius: 0.1, fill: { color: CARD_TINT }, line: { type: "none" } });
    iconBadge(s, "bug", "white", cx + 0.25, cy + 0.25, 0.5, NAVY);
    s.addText(bug, { x: cx + 0.95, y: cy + 0.2, w: colW - 1.3, h: 0.6, fontFace: BODY_FONT, bold: true, fontSize: 13, color: NAVY, valign: "top", margin: 0 });
    s.addText(fix, { x: cx + 0.35, y: cy + 0.95, w: colW - 0.7, h: 0.9, fontFace: BODY_FONT, fontSize: 11.5, color: TEXT_MUTED, valign: "top", margin: 0 });
  });
  footer(s, n, "Testing");
}

// ---------- 18. DEPLOYMENT ARCHITECTURE ----------
{
  const s = lightSlide(pres); n++;
  title(s, "Production Deployment");
  box(s, 1.0, 2.3, 4.6, 0.9, "Cloudflare Workers\n(Frontend — Next.js)", { fill: WHITE, fontSize: 13 });
  box(s, 7.8, 2.3, 4.6, 0.9, "Render — Docker\n(Backend — Spring Boot)", { fill: NAVY, color: WHITE, fontSize: 13 });
  arrow(s, 5.6, 2.75, 7.8, 2.75, NAVY);
  arrow(s, 7.8, 2.75, 5.6, 2.75, NAVY);
  box(s, 4.4, 3.9, 4.6, 0.75, "Supabase\n(PostgreSQL + Storage)", { fill: WHITE, fontSize: 12 });
  arrow(s, 6.7, 3.2, 6.7, 3.9, NAVY);
  box(s, 9.6, 4.5, 3.0, 0.65, "Paystack", { fill: WHITE, fontSize: 12 });
  arrow(s, 10.1, 3.2, 10.5, 4.5, NAVY);
  s.addShape("roundRect", { x: 0.9, y: 5.35, w: 11.5, h: 1.15, rectRadius: 0.1, fill: { color: CARD_TINT }, line: { color: GOLD, width: 1 } });
  iconBadge(s, "sync", "white", 1.15, 5.6, 0.6, GOLD);
  s.addText([
    { text: "Continuous availability", options: { breakLine: true, bold: true, color: NAVY, fontSize: 13 } },
    { text: "GitHub Actions (every 10 minutes) and an external uptime monitor (every 5 minutes) both ping /actuator/health, so Render's 15-minute inactivity spin-down never fires.", options: { color: TEXT_MUTED, fontSize: 11 } },
  ], { x: 1.95, y: 5.5, w: 10.2, h: 0.9, fontFace: BODY_FONT, valign: "top", margin: 0 });
  footer(s, n, "Deployment");
}

// ---------- 19. LIMITATIONS & FUTURE ----------
{
  const s = lightSlide(pres); n++;
  title(s, "What's Next");
  iconBadge(s, "triangleExclaim", "white", 0.7, 1.75, 0.6, NAVY);
  s.addText("Current Limitations", { x: 1.5, y: 1.8, w: 4.5, h: 0.5, fontFace: HEAD_FONT, bold: true, fontSize: 16, color: NAVY, margin: 0 });
  const lims = [
    "Reservation fulfilment doesn't yet offer a custom loan duration.",
    "Frontend deploys are triggered manually, not on every push.",
    "The service worker provides a basic offline shell only.",
  ];
  s.addText(lims.map((t, i) => ({ text: t, options: { bullet: { code: "2022" }, breakLine: i !== lims.length - 1, color: TEXT_MUTED, fontSize: 13 } })),
    { x: 0.8, y: 2.5, w: 5.6, h: 3.5, fontFace: BODY_FONT, valign: "top", paraSpaceAfter: 12, margin: 0 });

  iconBadge(s, "lightbulb", "white", 7.0, 1.75, 0.6, GOLD);
  s.addText("Future Enhancements", { x: 7.8, y: 1.8, w: 4.5, h: 0.5, fontFace: HEAD_FONT, bold: true, fontSize: 16, color: NAVY, margin: 0 });
  const future = [
    "Restore push-to-deploy once Cloudflare's build tooling stabilizes.",
    "Custom loan duration on reservation fulfilment.",
    "Expanded automated frontend test coverage.",
    "Push notifications for due-date reminders.",
  ];
  s.addText(future.map((t, i) => ({ text: t, options: { bullet: { code: "2022" }, breakLine: i !== future.length - 1, color: TEXT_MUTED, fontSize: 13 } })),
    { x: 7.1, y: 2.5, w: 5.6, h: 3.5, fontFace: BODY_FONT, valign: "top", paraSpaceAfter: 12, margin: 0 });
  footer(s, n, "Looking Ahead");
}

// ---------- 20. CONCLUSION ----------
{
  const s = darkSlide(pres); n++;
  s.addImage({ path: ICON("bookOpen", "gold"), x: 10.3, y: 1.5, w: 2.4, h: 2.4, transparency: 15 });
  s.addText("Built. Tested. Deployed.", { x: 0.9, y: 2.5, w: 9.5, h: 1.1, fontFace: HEAD_FONT, bold: true, fontSize: 42, color: WHITE, margin: 0 });
  s.addText(
    "LibMan delivers a complete library management system — catalogue, circulation, digital lending, real payments, and librarian administration — running in production on cloud infrastructure today.",
    { x: 0.95, y: 3.75, w: 9.3, h: 1.1, fontFace: BODY_FONT, fontSize: 15, color: PARCHMENT, margin: 0 }
  );
  s.addText("github.com/AsanteAigu/LibMan", { x: 0.95, y: 6.5, w: 8, h: 0.5, fontFace: BODY_FONT, bold: true, fontSize: 14, color: GOLD, margin: 0 });
  s.addText("Thank you.", { x: 0.95, y: 5.2, w: 6, h: 0.6, fontFace: HEAD_FONT, italic: true, fontSize: 20, color: WHITE, margin: 0 });
}

pres.writeFile({ fileName: "LibMan_Presentation.pptx" }).then(() => {
  console.log("Presentation written:", n, "slides");
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
