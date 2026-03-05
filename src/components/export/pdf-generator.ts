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
  let result: TableResult | undefined;

  const originalDidDrawPage = options.didDrawPage;

  autoTable(doc, {
    ...options,
    didDrawPage: (data) => {
      const tableFinalY = data.table.finalY;
      if (typeof tableFinalY === "number") {
        result = { finalY: tableFinalY };
      }
      if (originalDidDrawPage !== undefined) {
        originalDidDrawPage(data);
      }
    },
  });

  return result;
}

// ── PDF Page Constants ───────────────────────────────────────────

const PAGE_MARGIN = 14;
const HEADER_HEIGHT = 18;
const FOOTER_HEIGHT = 12;

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

  // ── Day pages ────────────────────────────────────────────────

  drawHeader();

  for (const day of workspace.days) {
    if (day !== workspace.days[0]) {
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
      const headRow: CellDef[] = allocations.map((allocation, idx) => {
        const headerText = `${allocation.activityLabel.toUpperCase()}\nSala ${String(idx + 1)}`;
        return {
          content: headerText,
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
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
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
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
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
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
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
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
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
