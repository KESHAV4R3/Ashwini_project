export async function extractTextFromPDF(buffer) {
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const data = new Uint8Array(buffer);
    const loadingTask = pdfjs.getDocument({ 
      data, 
      useSystemFonts: true, 
      disableFontFace: true 
    });
    const pdf = await loadingTask.promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  } catch (error) {
    console.error('PDF.js Error:', error);
    throw new Error('Failed to read PDF.');
  }
}
