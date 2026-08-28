import api from './api';

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

  async downloadPdfReport(historyId, filename = `risk_report_${historyId}.pdf`) {
    const response = await api.get(`/reports/${historyId}/download`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  },

  async exportExcelReport(historyId, filename = `risk_analysis_${historyId}.xlsx`) {
    const response = await api.get(`/reports/${historyId}/excel`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  },
};

export default reportService;
