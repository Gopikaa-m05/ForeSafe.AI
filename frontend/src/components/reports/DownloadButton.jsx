import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { useToast } from '../common/Toast';

export const DownloadButton = ({ historyId, analysisData, filename = 'Software_Risk_Analysis' }) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const { addToast } = useToast();

  const handlePdfDownload = async () => {
    setDownloadingPdf(true);
    try {
      addToast('Generating publication-grade PDF report...', 'info');
      await reportService.downloadPdfReport(historyId, `${filename}.pdf`, analysisData);
      addToast('PDF report downloaded successfully.', 'success');
    } catch (err) {
      addToast(err.response?.data?.detail || err.message || 'Failed to download PDF report.', 'error');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleExcelExport = async () => {
    setExportingExcel(true);
    try {
      addToast('Exporting Excel spreadsheet matrix...', 'info');
      await reportService.exportExcelReport(historyId, `${filename}.xlsx`, analysisData);
      addToast('Excel spreadsheet downloaded successfully.', 'success');
    } catch (err) {
      addToast(err.response?.data?.detail || err.message || 'Failed to export Excel report.', 'error');
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
        disabled={downloadingPdf}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
      >
        {downloadingPdf ? (
          <Loader2 size={15} className="spinner" />
        ) : (
          <FileText size={15} />
        )}
        <span>Download PDF Report</span>
      </button>

      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleExcelExport}
        disabled={exportingExcel}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
      >
        {exportingExcel ? (
          <Loader2 size={15} className="spinner" />
        ) : (
          <FileSpreadsheet size={15} />
        )}
        <span>Export Excel (.xlsx)</span>
      </button>
    </div>
  );
};

export default DownloadButton;
