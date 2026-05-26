import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { CellDef, UserOptions } from "jspdf-autotable";
import { WEEKDAY_LABELS } from "@/lib/constants";
import type {
  Workspace,
  WeekDay,
  Shift,
  Allocation,
  Professional,
  Category,
} from "@/types";
import type { Conflict } from "@/features/validation/types";

// ── Color palette (light theme, always) ──────────────────────────

const COLORS = {
  primary: [16, 185, 129] as const,       // emerald-500
  textPrimary: [15, 23, 42] as const,     // slate-900
  textSecondary: [100, 116, 139] as const,// slate-500
  border: [226, 232, 240] as const,       // slate-200
  white: [255, 255, 255] as const,
  error: [239, 68, 68] as const,          // red-500
  warning: [245, 158, 11] as const,       // amber-500
  zebraStripe: [255, 248, 240] as const,  // warm cream
} as const;

type RGBTuple = readonly [number, number, number];
type MutableRGB = [number, number, number];

function toMutableRgb(tuple: RGBTuple): MutableRGB {
  return [tuple[0], tuple[1], tuple[2]];
}

// ── Helpers ──────────────────────────────────────────────────────

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
}

function formatTimeLabel(time: string): string {
  // "07:00" -> "07h"
  const parts = time.split(":");
  const hours = parts[0];
  if (hours === undefined) return time;
  return `${hours}h`;
}

function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTimeLabel(startTime)} às ${formatTimeLabel(endTime)}`;
}

function hexToRgb(hex: string): RGBTuple {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return [
    Number.isNaN(r) ? 200 : r,
    Number.isNaN(g) ? 200 : g,
    Number.isNaN(b) ? 200 : b,
  ] as const;
}

function tintColor(rgb: RGBTuple, factor: number): RGBTuple {
  // Blend toward white
  return [
    Math.round(rgb[0] + (255 - rgb[0]) * factor),
    Math.round(rgb[1] + (255 - rgb[1]) * factor),
    Math.round(rgb[2] + (255 - rgb[2]) * factor),
  ] as const;
}

function findProfessional(
  workspace: Workspace,
  professionalId: string
): Professional | undefined {
  return workspace.professionals.find((p) => p.id === professionalId);
}

function findCategory(
  workspace: Workspace,
  categoryId: string
): Category | undefined {
  return workspace.categories.find((c) => c.id === categoryId);
}

function getAllocationsForDayShift(
  workspace: Workspace,
  day: WeekDay,
  shift: Shift
): ReadonlyArray<Allocation> {
  return workspace.allocations.filter(
    (a) => a.day === day && a.shiftId === shift.id
  );
}

function getFileDateString(): string {
  const now = new Date();
  const y = String(now.getFullYear());
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ── PDF Generation Input ─────────────────────────────────────────

export interface PdfGeneratorInput {
  readonly workspace: Workspace;
  readonly conflicts: ReadonlyArray<Conflict>;
  readonly weekReference: string;
}

// ── Table result tracker ─────────────────────────────────────────

interface TableResult {
  finalY: number;
}

function autoTableWithResult(
  doc: jsPDF,
  options: UserOptions
): TableResult | undefined {
  autoTable(doc, options);

  // jspdf-autotable stores the last table result on the doc instance
  const lastTable = (doc as unknown as Record<string, unknown>)["lastAutoTable"];
  if (
    lastTable != null &&
    typeof lastTable === "object" &&
    "finalY" in lastTable &&
    typeof (lastTable as Record<string, unknown>)["finalY"] === "number"
  ) {
    return { finalY: (lastTable as Record<string, unknown>)["finalY"] as number };
  }

  return undefined;
}

// ── PDF Page Constants ───────────────────────────────────────────

const PAGE_MARGIN = 14;
const HEADER_HEIGHT = 18;
const FOOTER_HEIGHT = 12;

// ── HTML Rules Renderer ─────────────────────────────────────

interface TextSegment {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  color: string | null; // hex color or null for default
  fontSize: number | null; // point size or null for default
}

interface StyleState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  color: string | null;
  fontSize: number | null;
}

// Map HTML font size (1-7) to PDF point sizes
function htmlFontSizeToPt(size: string): number | null {
  const sizeMap: Record<string, number> = {
    "1": 7, "2": 8, "3": 9, "4": 10, "5": 12, "6": 14, "7": 18,
  };
  return sizeMap[size] ?? null;
}

function parseColorFromStyle(style: string): string | null {
  // Match color in style attribute: color: rgb(r,g,b) or color: #hex
  const rgbMatch = style.match(/color:\s*rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]!, 10);
    const g = parseInt(rgbMatch[2]!, 10);
    const b = parseInt(rgbMatch[3]!, 10);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }
  const hexMatch = style.match(/color:\s*(#[0-9a-fA-F]{3,6})/i);
  if (hexMatch) {
    return hexMatch[1]!;
  }
  return null;
}

function parseColorFromAttr(attr: string): string | null {
  // font color="..." can be hex or named color
  if (attr.startsWith("#")) return attr;
  // Named colors mapping (common ones from execCommand)
  const named: Record<string, string> = {
    red: "#ff0000", blue: "#0000ff", green: "#008000",
    black: "#000000", orange: "#ffa500", purple: "#800080",
    gray: "#808080", grey: "#808080",
  };
  return named[attr.toLowerCase()] ?? attr;
}

function parseInlineHtml(html: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const styleStack: StyleState[] = [
    { bold: false, italic: false, underline: false, strikethrough: false, color: null, fontSize: null },
  ];

  function currentStyle(): StyleState {
    return styleStack[styleStack.length - 1]!;
  }

  // Tokenize: split into tags and text
  const tokenPattern = /<\/?[^>]+>|[^<]+/g;
  let token: RegExpExecArray | null;

  while ((token = tokenPattern.exec(html)) !== null) {
    const t = token[0];

    if (t.startsWith("</")) {
      // Closing tag — pop style
      if (styleStack.length > 1) {
        styleStack.pop();
      }
    } else if (t.startsWith("<")) {
      // Opening tag — push new style inheriting from current
      const prev = currentStyle();
      const newStyle: StyleState = { ...prev };

      const tagNameMatch = t.match(/^<(\w+)/);
      if (tagNameMatch) {
        const tagName = tagNameMatch[1]!.toLowerCase();
        if (tagName === "strong" || tagName === "b") {
          newStyle.bold = true;
        } else if (tagName === "em" || tagName === "i") {
          newStyle.italic = true;
        } else if (tagName === "u") {
          newStyle.underline = true;
        } else if (tagName === "s" || tagName === "strike" || tagName === "del") {
          newStyle.strikethrough = true;
        } else if (tagName === "span") {
          const styleMatch = t.match(/style="([^"]*)"/i);
          if (styleMatch) {
            const color = parseColorFromStyle(styleMatch[1]!);
            if (color) newStyle.color = color;
          }
        } else if (tagName === "font") {
          const colorMatch = t.match(/color="([^"]*)"/i);
          if (colorMatch) {
            const color = parseColorFromAttr(colorMatch[1]!);
            if (color) newStyle.color = color;
          }
          const sizeMatch = t.match(/size="([^"]*)"/i);
          if (sizeMatch) {
            const ptSize = htmlFontSizeToPt(sizeMatch[1]!);
            if (ptSize !== null) newStyle.fontSize = ptSize;
          }
        }
      }

      // Self-closing tags (like <br/>) shouldn't push to stack
      if (t.endsWith("/>") || /^<br\s*/i.test(t)) {
        // don't push
      } else {
        styleStack.push(newStyle);
      }
    } else {
      // Text node
      const text = t;
      if (text.length > 0) {
        const style = currentStyle();
        segments.push({
          text,
          bold: style.bold,
          italic: style.italic,
          underline: style.underline,
          strikethrough: style.strikethrough,
          color: style.color,
          fontSize: style.fontSize,
        });
      }
    }
  }

  return segments;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function renderStyledChunk(
  doc: jsPDF,
  segment: TextSegment,
  chunkText: string,
  lineX: number,
  cursorY: number,
  defaultFontSize: number
): void {
  let fontStyle = "normal";
  if (segment.bold && segment.italic) fontStyle = "bolditalic";
  else if (segment.bold) fontStyle = "bold";
  else if (segment.italic) fontStyle = "italic";

  doc.setFont("helvetica", fontStyle);
  doc.setFontSize(segment.fontSize ?? defaultFontSize);

  if (segment.color) {
    const rgb = hexToRgb(segment.color);
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  } else {
    doc.setTextColor(...COLORS.textPrimary);
  }

  doc.text(chunkText, lineX, cursorY);
  const textWidth = doc.getTextWidth(chunkText);

  if (segment.underline) {
    const colorRgb = segment.color ? hexToRgb(segment.color) : COLORS.textPrimary;
    doc.setDrawColor(colorRgb[0], colorRgb[1], colorRgb[2]);
    doc.setLineWidth(0.2);
    doc.line(lineX, cursorY + 0.5, lineX + textWidth, cursorY + 0.5);
  }

  if (segment.strikethrough) {
    const colorRgb = segment.color ? hexToRgb(segment.color) : COLORS.textPrimary;
    doc.setDrawColor(colorRgb[0], colorRgb[1], colorRgb[2]);
    doc.setLineWidth(0.2);
    doc.line(lineX, cursorY - 1, lineX + textWidth, cursorY - 1);
  }
}

function renderHtmlRules(
  doc: jsPDF,
  html: string,
  x: number,
  startY: number,
  maxWidth: number,
  maxY: number,
  addNewPage: () => void,
  contentStartY: () => number
): number {
  let cursorY = startY;
  const bulletIndent = 6;
  const bulletTextX = x + bulletIndent;
  const textMaxWidth = maxWidth - bulletIndent;
  const lineHeight = 4.5;
  const itemSpacing = 3;
  const fontSize = 9;

  // Extract <li> content from HTML
  const liPattern = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  const items: string[] = [];
  let liMatch: RegExpExecArray | null;
  while ((liMatch = liPattern.exec(html)) !== null) {
    items.push(liMatch[1] ?? "");
  }

  // If no list items found, render as styled plain text
  if (items.length === 0) {
    const segments = parseInlineHtml(html);
    const fullText = decodeHtmlEntities(segments.map((s) => s.text).join(""));
    if (fullText.trim().length === 0) return cursorY;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    const wrappedLines = doc.splitTextToSize(fullText, maxWidth) as string[];

    let charOffset = 0;
    for (const wrappedLine of wrappedLines) {
      if (cursorY + lineHeight > maxY) {
        addNewPage();
        cursorY = contentStartY();
      }

      const lineLen = wrappedLine.length;
      let lineX = x;
      let segStart = 0;

      for (const segment of segments) {
        const segText = decodeHtmlEntities(segment.text);
        const segEnd = segStart + segText.length;
        const overlapStart = Math.max(charOffset, segStart);
        const overlapEnd = Math.min(charOffset + lineLen, segEnd);

        if (overlapStart < overlapEnd) {
          const chunkText = segText.slice(overlapStart - segStart, overlapEnd - segStart);
          renderStyledChunk(doc, segment, chunkText, lineX, cursorY, fontSize);
          lineX += doc.getTextWidth(chunkText);
        }
        segStart = segEnd;
      }

      charOffset += lineLen;
      while (charOffset < fullText.length && fullText[charOffset] === " ") {
        charOffset++;
      }
      cursorY += lineHeight;
    }
    return cursorY;
  }

  for (const itemHtml of items) {
    const segments = parseInlineHtml(itemHtml);

    // Build the full text to measure line wrapping
    const fullText = decodeHtmlEntities(segments.map((s) => s.text).join(""));
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    const wrappedLines = doc.splitTextToSize(fullText, textMaxWidth) as string[];
    const totalItemHeight = wrappedLines.length * lineHeight;

    // Check if we need a new page
    if (cursorY + totalItemHeight > maxY) {
      addNewPage();
      cursorY = contentStartY();
    }

    // Draw bullet
    doc.setFillColor(...COLORS.textPrimary);
    doc.circle(x + 1.5, cursorY - 1, 0.8, "F");

    // Render segments with word wrapping and mixed styles
    let charOffset = 0;
    for (const wrappedLine of wrappedLines) {
      const lineLen = wrappedLine.length;
      let lineX = bulletTextX;

      // Find which segments cover this line range
      let segStart = 0;
      for (const segment of segments) {
        const segText = decodeHtmlEntities(segment.text);
        const segEnd = segStart + segText.length;

        // Calculate overlap with current line
        const overlapStart = Math.max(charOffset, segStart);
        const overlapEnd = Math.min(charOffset + lineLen, segEnd);

        if (overlapStart < overlapEnd) {
          const chunkText = segText.slice(
            overlapStart - segStart,
            overlapEnd - segStart
          );

          renderStyledChunk(doc, segment, chunkText, lineX, cursorY, fontSize);
          lineX += doc.getTextWidth(chunkText);
        }

        segStart = segEnd;
      }

      charOffset += lineLen;
      // Skip whitespace that was consumed by line break
      while (
        charOffset < fullText.length &&
        fullText[charOffset] === " "
      ) {
        charOffset++;
      }

      cursorY += lineHeight;
    }

    cursorY += itemSpacing;
  }

  return cursorY;
}

// ── Main generator ───────────────────────────────────────────────

export function generateSchedulePdf(input: PdfGeneratorInput): void {
  const { workspace, conflicts, weekReference } = input;
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentPage = 1;
  const handledPages = new Set<number>([1]);

  // ── Header / Footer ──────────────────────────────────────────

  function drawHeader(): void {
    // Left: workspace name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textPrimary);
    doc.text(workspace.name, PAGE_MARGIN, PAGE_MARGIN);

    // Center: week reference
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textSecondary);
    const refWidth = doc.getTextWidth(weekReference);
    doc.text(weekReference, (pageWidth - refWidth) / 2, PAGE_MARGIN);

    // Right: export date
    const dateStr = formatDate(new Date());
    const dateWidth = doc.getTextWidth(dateStr);
    doc.text(dateStr, pageWidth - PAGE_MARGIN - dateWidth, PAGE_MARGIN);

    // Separator line
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(
      PAGE_MARGIN,
      PAGE_MARGIN + 3,
      pageWidth - PAGE_MARGIN,
      PAGE_MARGIN + 3
    );
  }

  function drawFooter(): void {
    const footerY = pageHeight - FOOTER_HEIGHT + 4;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textSecondary);
    doc.text("Gerado por CronoCaps", PAGE_MARGIN, footerY);

    const pageText = `Página ${String(currentPage)}`;
    const pageTextWidth = doc.getTextWidth(pageText);
    doc.text(pageText, pageWidth - PAGE_MARGIN - pageTextWidth, footerY);
  }

  function addNewPage(): void {
    drawFooter();
    doc.addPage();
    currentPage += 1;
    handledPages.add(currentPage);
    drawHeader();
  }

  function contentStartY(): number {
    return PAGE_MARGIN + HEADER_HEIGHT;
  }

  function contentMaxY(): number {
    return pageHeight - FOOTER_HEIGHT - 4;
  }

  // ── Rules page (first page) ─────────────────────────────────

  drawHeader();

  if (workspace.exportRules.trim().length > 0) {
    let rulesY = contentStartY();

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.textPrimary);
    const titleText = workspace.name.toUpperCase();
    const titleWidth = doc.getTextWidth(titleText);
    doc.text(titleText, (pageWidth - titleWidth) / 2, rulesY);
    rulesY += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.primary);
    const subTitle = "OBSERVAÇÕES:";
    const subTitleWidth = doc.getTextWidth(subTitle);
    doc.text(subTitle, (pageWidth - subTitleWidth) / 2, rulesY);
    rulesY += 10;

    // Parse HTML and render
    rulesY = renderHtmlRules(doc, workspace.exportRules, PAGE_MARGIN + 4, rulesY, pageWidth - PAGE_MARGIN * 2 - 8, contentMaxY(), addNewPage, contentStartY);

    // Start day pages on a new page
    addNewPage();
  }

  // ── Day pages ────────────────────────────────────────────────

  if (workspace.exportRules.trim().length === 0) {
    drawHeader();
  }

  for (const day of workspace.days) {
    if (day !== workspace.days[0] || workspace.exportRules.trim().length > 0) {
      addNewPage();
    }

    let cursorY = contentStartY();

    // Day title with emerald background box
    const dayLabel = WEEKDAY_LABELS[day].toUpperCase();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    const dayLabelWidth = doc.getTextWidth(dayLabel);
    const boxPadX = 4;
    const boxPadY = 2;
    const boxH = 8;
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(
      PAGE_MARGIN,
      cursorY - boxH + boxPadY,
      dayLabelWidth + boxPadX * 2,
      boxH + boxPadY,
      1.5,
      1.5,
      "F"
    );
    doc.setTextColor(...COLORS.white);
    doc.text(dayLabel, PAGE_MARGIN + boxPadX, cursorY);
    cursorY += 10;

    // Each shift
    for (const shift of workspace.shifts) {
      const allocations = getAllocationsForDayShift(workspace, day, shift);

      // Shift sub-header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.textPrimary);

      const shiftLabel = `${shift.label.toUpperCase()} (${formatTimeRange(shift.startTime, shift.endTime)})`;

      if (cursorY + 12 > contentMaxY()) {
        addNewPage();
        cursorY = contentStartY();
      }

      doc.text(shiftLabel, PAGE_MARGIN, cursorY);
      cursorY += 5;

      if (allocations.length === 0) {
        // No allocations
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.textSecondary);
        doc.text("Nenhuma atividade agendada", PAGE_MARGIN + 2, cursorY);
        cursorY += 8;
        continue;
      }

      // Build table: each allocation is a column
      // Find max rows (max professionals in any allocation)
      const maxRows = allocations.reduce(
        (max, a) => Math.max(max, a.assignments.length === 0 ? 1 : a.assignments.length),
        0
      );

      // Head row: activity labels with colored backgrounds
      const headRow: CellDef[] = allocations.map((allocation) => {
        return {
          content: allocation.activityLabel.toUpperCase(),
          styles: {
            fillColor: toMutableRgb(COLORS.primary),
            textColor: toMutableRgb(COLORS.white),
            fontStyle: "bold",
            fontSize: 7,
            halign: "center" as const,
            valign: "middle" as const,
          },
        };
      });

      // Body rows: professionals
      const bodyRows: CellDef[][] = [];
      for (let rowIdx = 0; rowIdx < maxRows; rowIdx++) {
        const row: CellDef[] = allocations.map((allocation) => {
          const assignment = allocation.assignments[rowIdx];
          if (assignment === undefined) {
            return {
              content: "—",
              styles: {
                halign: "center" as const,
                textColor: toMutableRgb(COLORS.textSecondary),
                fillColor:
                  rowIdx % 2 === 1
                    ? toMutableRgb(COLORS.zebraStripe)
                    : (toMutableRgb(COLORS.white)),
                fontSize: 7,
              },
            };
          }

          const professional = findProfessional(
            workspace,
            assignment.professionalId
          );
          const professionalName =
            professional !== undefined ? professional.name : "Profissional";

          const timeRange = formatTimeRange(
            assignment.startTime,
            assignment.endTime
          );
          const cellText = `${professionalName} — ${timeRange}`;

          // Category color tint
          let fillColor: MutableRGB =
            rowIdx % 2 === 1
              ? toMutableRgb(COLORS.zebraStripe)
              : toMutableRgb(COLORS.white);

          if (professional !== undefined) {
            const category = findCategory(workspace, professional.categoryId);
            if (category !== undefined) {
              const rgb = hexToRgb(category.color);
              const tinted = tintColor(rgb, 0.75);
              fillColor = [tinted[0], tinted[1], tinted[2]];
            }
          }

          return {
            content: cellText,
            styles: {
              halign: "left" as const,
              fontSize: 7,
              fillColor,
              textColor: toMutableRgb(COLORS.textPrimary),
            },
          };
        });
        bodyRows.push(row);
      }

      // Column definitions
      const columns: Array<{ header: string; dataKey: string }> =
        allocations.map((_, idx) => ({
          header: String(idx),
          dataKey: String(idx),
        }));

      const tableOptions: UserOptions = {
        startY: cursorY,
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: FOOTER_HEIGHT + 4 },
        tableWidth: "auto",
        theme: "grid",
        head: [headRow],
        body: bodyRows,
        columns,
        styles: {
          font: "helvetica",
          fontSize: 7,
          cellPadding: 2,
          lineColor: toMutableRgb(COLORS.border),
          lineWidth: 0.2,
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: toMutableRgb(COLORS.primary),
          textColor: toMutableRgb(COLORS.white),
          fontStyle: "bold",
          halign: "center",
          minCellHeight: 10,
        },
        didDrawPage: () => {
          // Only draw footer/header for autotable page breaks (skip already-handled pages)
          const pageNum = doc.getNumberOfPages();
          if (handledPages.has(pageNum)) return;
          handledPages.add(pageNum);
          drawFooter();
          currentPage = pageNum;
          drawHeader();
        },
      };

      const shiftTableResult = autoTableWithResult(doc, tableOptions);

      // Get final Y position after the table
      if (shiftTableResult !== undefined) {
        cursorY = shiftTableResult.finalY + 6;
      } else {
        cursorY += 30;
      }
    }
  }

  // ── Summary page ───────────────────────────────────────────────

  addNewPage();
  let summaryY = contentStartY();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.primary);
  doc.text("RESUMO", PAGE_MARGIN, summaryY);
  summaryY += 10;

  // Professionals per day
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textPrimary);
  doc.text("Profissionais agendados por dia", PAGE_MARGIN, summaryY);
  summaryY += 4;

  const profPerDayHead: CellDef[][] = [
    workspace.days.map((day) => ({
      content: WEEKDAY_LABELS[day],
      styles: {
        fillColor: toMutableRgb(COLORS.primary),
        textColor: toMutableRgb(COLORS.white),
        fontStyle: "bold" as const,
        halign: "center" as const,
        fontSize: 8,
      },
    })),
  ];

  const profPerDayBody: CellDef[][] = [
    workspace.days.map((day) => {
      const uniqueProfessionals = new Set<string>();
      for (const allocation of workspace.allocations) {
        if (allocation.day === day) {
          for (const assignment of allocation.assignments) {
            uniqueProfessionals.add(assignment.professionalId);
          }
        }
      }
      return {
        content: String(uniqueProfessionals.size),
        styles: {
          halign: "center" as const,
          fontSize: 9,
          fontStyle: "bold" as const,
        },
      };
    }),
  ];

  const profDayColumns = workspace.days.map((_, idx) => ({
    header: String(idx),
    dataKey: String(idx),
  }));

  const profTableResult = autoTableWithResult(doc, {
    startY: summaryY,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: FOOTER_HEIGHT + 4 },
    theme: "grid",
    head: profPerDayHead,
    body: profPerDayBody,
    columns: profDayColumns,
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      lineColor: toMutableRgb(COLORS.border),
      lineWidth: 0.2,
    },
  });

  if (profTableResult !== undefined) {
    summaryY = profTableResult.finalY + 10;
  } else {
    summaryY += 30;
  }

  // Shift occupancy
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textPrimary);
  doc.text("Ocupação por turno", PAGE_MARGIN, summaryY);
  summaryY += 4;

  const occupancyHead: CellDef[][] = [
    [
      {
        content: "Turno",
        styles: {
          fillColor: toMutableRgb(COLORS.primary),
          textColor: toMutableRgb(COLORS.white),
          fontStyle: "bold" as const,
          fontSize: 8,
        },
      },
      ...workspace.days.map((day) => ({
        content: WEEKDAY_LABELS[day],
        styles: {
          fillColor: toMutableRgb(COLORS.primary),
          textColor: toMutableRgb(COLORS.white),
          fontStyle: "bold" as const,
          halign: "center" as const,
          fontSize: 8,
        },
      })),
    ],
  ];

  const occupancyBody: CellDef[][] = workspace.shifts.map((shift, rowIdx) => {
    const bgColor: MutableRGB =
      rowIdx % 2 === 1 ? toMutableRgb(COLORS.zebraStripe) : toMutableRgb(COLORS.white);

    return [
      {
        content: shift.label,
        styles: { fontSize: 8, fontStyle: "bold" as const, fillColor: bgColor },
      },
      ...workspace.days.map((day) => {
        const count = workspace.allocations.filter(
          (a) => a.day === day && a.shiftId === shift.id
        ).length;
        return {
          content: `${String(count)} / ${String(workspace.roomsPerShift)}`,
          styles: { halign: "center" as const, fontSize: 8, fillColor: bgColor },
        };
      }),
    ];
  });

  const occupancyColumns = [
    { header: "Turno", dataKey: "0" },
    ...workspace.days.map((_, idx) => ({
      header: String(idx + 1),
      dataKey: String(idx + 1),
    })),
  ];

  const occupancyTableResult = autoTableWithResult(doc, {
    startY: summaryY,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: FOOTER_HEIGHT + 4 },
    theme: "grid",
    head: occupancyHead,
    body: occupancyBody,
    columns: occupancyColumns,
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      lineColor: toMutableRgb(COLORS.border),
      lineWidth: 0.2,
    },
  });

  if (occupancyTableResult !== undefined) {
    summaryY = occupancyTableResult.finalY + 10;
  } else {
    summaryY += 30;
  }

  // Conflicts section
  if (conflicts.length > 0) {
    if (summaryY + 20 > contentMaxY()) {
      addNewPage();
      summaryY = contentStartY();
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.error);
    doc.text(
      `Conflitos (${String(conflicts.length)})`,
      PAGE_MARGIN,
      summaryY
    );
    summaryY += 4;

    const conflictHead: CellDef[][] = [
      [
        {
          content: "Tipo",
          styles: {
            fillColor: toMutableRgb(COLORS.error),
            textColor: toMutableRgb(COLORS.white),
            fontStyle: "bold" as const,
            fontSize: 7,
          },
        },
        {
          content: "Severidade",
          styles: {
            fillColor: toMutableRgb(COLORS.error),
            textColor: toMutableRgb(COLORS.white),
            fontStyle: "bold" as const,
            halign: "center" as const,
            fontSize: 7,
          },
        },
        {
          content: "Descrição",
          styles: {
            fillColor: toMutableRgb(COLORS.error),
            textColor: toMutableRgb(COLORS.white),
            fontStyle: "bold" as const,
            fontSize: 7,
          },
        },
      ],
    ];

    const conflictTypeLabels: Record<string, string> = {
      PROFESSIONAL_DOUBLE_BOOKED: "Dupla alocação",
      ROOM_OVER_CAPACITY: "Sala excedida",
      PROFESSIONAL_UNAVAILABLE: "Indisponível",
      INITIAL_AND_FOLLOWUP_CONFLICT: "Acolhimento",
    };

    const severityLabels: Record<string, string> = {
      error: "Erro",
      warning: "Aviso",
    };

    const conflictBody: CellDef[][] = conflicts.map((conflict, rowIdx) => {
      const bgColor: MutableRGB =
        rowIdx % 2 === 1 ? toMutableRgb(COLORS.zebraStripe) : toMutableRgb(COLORS.white);

      const typeLabel = conflictTypeLabels[conflict.type];
      const sevLabel = severityLabels[conflict.severity];

      const sevColor: MutableRGB =
        conflict.severity === "error"
          ? toMutableRgb(COLORS.error)
          : toMutableRgb(COLORS.warning);

      return [
        {
          content: typeLabel !== undefined ? typeLabel : conflict.type,
          styles: { fontSize: 7, fillColor: bgColor },
        },
        {
          content: sevLabel !== undefined ? sevLabel : conflict.severity,
          styles: {
            halign: "center" as const,
            fontSize: 7,
            fillColor: bgColor,
            textColor: sevColor,
            fontStyle: "bold" as const,
          },
        },
        {
          content: conflict.message,
          styles: { fontSize: 7, fillColor: bgColor },
        },
      ];
    });

    autoTable(doc, {
      startY: summaryY,
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: FOOTER_HEIGHT + 4 },
      theme: "grid",
      head: conflictHead,
      body: conflictBody,
      columns: [
        { header: "Tipo", dataKey: "0" },
        { header: "Severidade", dataKey: "1" },
        { header: "Descrição", dataKey: "2" },
      ],
      styles: {
        font: "helvetica",
        fontSize: 7,
        cellPadding: 2,
        lineColor: toMutableRgb(COLORS.border),
        lineWidth: 0.2,
      },
      columnStyles: {
        "0": { cellWidth: 35 },
        "1": { cellWidth: 25 },
      },
    });
  }

  // Draw footer on last page
  drawFooter();

  // Save
  const fileName = `cronocaps-${getFileDateString()}.pdf`;
  doc.save(fileName);
}
