import api from './api';

export const predictionService = {
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async predictDataset(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async downloadSampleDataset() {
    const response = await api.get('/sample-dataset', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'nasa_jm1_sample_dataset.csv');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  },

  async getHealth() {
    const response = await api.get('/health');
    return response.data;
  },
};
