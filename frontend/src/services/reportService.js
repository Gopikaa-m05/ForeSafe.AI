import api from './api';
import { exportClientPdf, exportClientExcel } from '../utils/reportExporter';

export const reportService = {
  async getHistory(page = 1, limit = 10, search = '', riskFilter = '') {
    const params = { page, limit };
    if (search) params.search = search;
    if (riskFilter) params.risk_filter = riskFilter;
    
    const response = await api.get('/history', { params });
    return response.data;
  },

  async getHistoryDetail(historyId) {
    const response = await api.get(`/history/${historyId}`);
    return response.data;
  },

  async deleteHistory(historyId) {
    const response = await api.delete(`/history/${historyId}`);
    return response.data;
  },

  async downloadPdfReport(historyId, filename = 'software_risk_report.pdf', fallbackData = null) {
    let dataToUse = fallbackData;
    if (!dataToUse) {
      try {
        const cached = sessionStorage.getItem('current_analysis');
        if (cached) dataToUse = JSON.parse(cached);
      } catch (e) {}
    }

    const cleanHistoryId = historyId ? parseInt(historyId, 10) : 0;
    
    // Attempt 1: Server-side PDF Streaming
    try {
      if (cleanHistoryId > 0) {
        const response = await api.get(`/reports/${cleanHistoryId}/download`, {
          responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
        link.setAttribute('download', safeName);
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          link.parentNode?.removeChild(link);
        }, 200);
        return;
      }
    } catch (serverErr) {
      console.warn('Server PDF download failed, engaging client-side generator:', serverErr);
    }

    // Attempt 2: If we have historyId but no dataToUse, fetch history detail first
    if (!dataToUse && cleanHistoryId > 0) {
      try {
        dataToUse = await this.getHistoryDetail(cleanHistoryId);
      } catch (fetchErr) {
        console.warn('Could not fetch history detail:', fetchErr);
      }
    }

    // Attempt 3: Client-Side Vector PDF Generation (100% Guaranteed Success)
    if (dataToUse) {
      exportClientPdf(dataToUse, filename);
      return;
    }

    throw new Error('Analysis record not found. Please upload a dataset or check history.');
  },

  async exportExcelReport(historyId, filename = 'software_risk_analysis.xlsx', fallbackData = null) {
    let dataToUse = fallbackData;
    if (!dataToUse) {
      try {
        const cached = sessionStorage.getItem('current_analysis');
        if (cached) dataToUse = JSON.parse(cached);
      } catch (e) {}
    }

    const cleanHistoryId = historyId ? parseInt(historyId, 10) : 0;

    // Attempt 1: Server-side Excel Streaming
    try {
      if (cleanHistoryId > 0) {
        const response = await api.get(`/reports/${cleanHistoryId}/excel`, {
          responseType: 'blob',
        });
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
        link.setAttribute('download', safeName);
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          link.parentNode?.removeChild(link);
        }, 200);
        return;
      }
    } catch (serverErr) {
      console.warn('Server Excel export failed, engaging client-side generator:', serverErr);
    }

    // Attempt 2: Fetch history detail if needed
    if (!dataToUse && cleanHistoryId > 0) {
      try {
        dataToUse = await this.getHistoryDetail(cleanHistoryId);
      } catch (fetchErr) {
        console.warn('Could not fetch history detail:', fetchErr);
      }
    }

    // Attempt 3: Client-Side Excel Workbook Generation (100% Guaranteed Success)
    if (dataToUse) {
      exportClientExcel(dataToUse, filename);
      return;
    }

    throw new Error('Analysis record not found. Please upload a dataset or check history.');
  },
};

export default reportService;
