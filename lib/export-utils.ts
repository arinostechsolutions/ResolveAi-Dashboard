/**
 * Utilitários para exportação de dados
 */

/**
 * Converte um array de objetos para CSV
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  headers: Record<string, string>,
): string {
  if (data.length === 0) {
    return Object.values(headers).join(",");
  }

  // Cabeçalhos
  const headerRow = Object.values(headers).join(",");

  // Linhas de dados
  const dataRows = data.map((row) => {
    return Object.keys(headers)
      .map((key) => {
        const value = row[key];
        if (value === null || value === undefined) {
          return "";
        }
        // Se contém vírgula, aspas ou quebra de linha, envolver em aspas
        const stringValue = String(value);
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}

/**
 * Faz download de um arquivo CSV
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" }); // BOM para Excel reconhecer UTF-8
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formata data para nome de arquivo
 */
export function formatDateForFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}_${hours}-${minutes}`;
}

/**
 * Formata data para exibição
 */
function formatDate(value: any): string {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(value);
  }
}

/**
 * Exporta dados para PDF
 */
export async function exportToPDF<T extends Record<string, any>>(
  data: T[],
  headers: Record<string, string>,
  title: string,
  filename: string,
): Promise<void> {
  const jsPDF = (await import("jspdf")).default;
  const doc = new jsPDF();

  // Configurações
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const startY = 20;
  let currentY = startY;
  const baseLineHeight = 6;
  const maxWidth = pageWidth - 2 * margin;

  // Título
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, currentY);
  currentY += 10;

  // Data de geração
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date().toLocaleString("pt-BR");
  doc.text(`Gerado em: ${dateStr}`, margin, currentY);
  currentY += 8;

  if (data.length === 0) {
    doc.setFontSize(12);
    doc.text("Nenhum dado disponível para exportar.", margin, currentY);
    doc.save(filename);
    return;
  }

  // Cabeçalhos da tabela
  const headerKeys = Object.keys(headers);
  const headerLabels = Object.values(headers);
  const colWidth = maxWidth / headerKeys.length;

  // Desenhar cabeçalhos
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(0, 0, 0); // Preto
  doc.rect(margin, currentY - 5, maxWidth, baseLineHeight + 2, "F");
  doc.setTextColor(255, 255, 255); // Branco

  headerLabels.forEach((label, index) => {
    const x = margin + index * colWidth;
    const lines = doc.splitTextToSize(label, colWidth - 4);
    doc.text(lines, x + 2, currentY, { maxWidth: colWidth - 4 });
  });

  currentY += baseLineHeight + 4;
  doc.setTextColor(0, 0, 0);

  // Dados
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  const pageHeight = doc.internal.pageSize.getHeight();

  data.forEach((row, rowIndex) => {
    // Calcular altura necessária para esta linha (considerando quebras de texto)
    let maxLinesInRow = 1;
    const cellTexts: string[][] = [];

    headerKeys.forEach((key) => {
      let value = row[key] ?? "";
      
      // Formatar data se for campo de data
      if (key.toLowerCase().includes("date") || key.toLowerCase().includes("created") || key.toLowerCase().includes("updated")) {
        value = formatDate(value);
      }
      
      const text = String(value);
      const lines = doc.splitTextToSize(text, colWidth - 4);
      cellTexts.push(lines);
      maxLinesInRow = Math.max(maxLinesInRow, lines.length);
    });

    const rowHeight = baseLineHeight * maxLinesInRow + 2;

    // Verificar se precisa de nova página
    if (currentY + rowHeight > pageHeight - margin) {
      doc.addPage();
      currentY = startY;
    }

    // Desenhar linha separadora antes da linha (exceto primeira)
    if (rowIndex > 0) {
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.line(margin, currentY - 2, pageWidth - margin, currentY - 2);
    }

    // Alternar cor de fundo
    if (rowIndex % 2 === 0) {
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(margin, currentY - baseLineHeight, maxWidth, rowHeight, "F");
    }

    // Desenhar células
    headerKeys.forEach((key, colIndex) => {
      const x = margin + colIndex * colWidth;
      const lines = cellTexts[colIndex];
      
      lines.forEach((line, lineIndex) => {
        doc.text(line, x + 2, currentY + (lineIndex * baseLineHeight), { 
          maxWidth: colWidth - 4 
        });
      });
    });

    currentY += rowHeight + 2; // Espaço extra entre linhas
  });

  // Rodapé
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: "right" },
    );
  }

  doc.save(filename);
}

