import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { useToast } from '../common/Toast';

export const DownloadButton = ({ historyId, filename = 'Software_Risk_Analysis' }) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const { addToast } = useToast();

  const handlePdfDownload = async () => {
    if (!historyId) {
      addToast('History record ID is required to generate PDF.', 'warning');
      return;
    }
    setDownloadingPdf(true);
    try {
      addToast('Generating ReportLab PDF report...', 'info');
      await reportService.downloadPdfReport(historyId, filename);
      addToast('PDF report downloaded successfully.', 'success');
    } catch (err) {
      addToast('Failed to download PDF report.', 'error');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleExcelExport = async () => {
    if (!historyId) {
      addToast('History record ID is required to export Excel.', 'warning');
      return;
    }
    setExportingExcel(true);
    try {
      addToast('Exporting Excel spreadsheet...', 'info');
      await reportService.exportExcelReport(historyId, filename);
      addToast('Excel report downloaded successfully.', 'success');
    } catch (err) {
      addToast('Failed to export Excel report.', 'error');
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <button
        type="button"
        className="btn btn-primary"
        onClick={handlePdfDownload}
        disabled={downloadingPdf || !historyId}
      >
        {downloadingPdf ? (
          <Loader2 size={16} className="spinner" />
        ) : (
          <FileText size={16} />
        )}
        <span>Download PDF Report</span>
      </button>

      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleExcelExport}
        disabled={exportingExcel || !historyId}
      >
        {exportingExcel ? (
          <Loader2 size={16} className="spinner" />
        ) : (
          <FileSpreadsheet size={16} />
        )}
        <span>Export Excel (.xlsx)</span>
      </button>
    </div>
  );
};

export default DownloadButton;
