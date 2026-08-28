import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, FileText, Download, Trash2, Eye, Calendar, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { useToast } from '../common/Toast';
import Loader from '../common/Loader';

export const PredictionHistoryTable = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await reportService.getHistory(page, 8, search, riskFilter);
      setHistoryItems(data.items || []);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.total || 0);
    } catch (err) {
      addToast('Failed to load prediction history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, riskFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleDownloadPdf = async (id, filename) => {
    try {
      addToast('Generating PDF report...', 'info');
      await reportService.downloadPdfReport(id, filename);
      addToast('PDF report downloaded successfully.', 'success');
    } catch (err) {
      addToast('Could not download PDF report.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prediction run?')) return;
    try {
      await reportService.deleteHistory(id);
      addToast('Record deleted.', 'success');
      fetchHistory();
    } catch (err) {
      addToast('Failed to delete record.', 'error');
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      {/* Search & Filter Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flex: '1', maxWidth: '380px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', height: '40px' }}
              placeholder="Search by dataset filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary" style={{ padding: '0 16px', height: '40px' }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <select
              className="form-input"
              style={{ paddingRight: '28px', height: '40px', cursor: 'pointer' }}
              value={riskFilter}
              onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Risk Tiers</option>
              <option value="critical">Critical Risk</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <Loader message="Loading historical analyses..." />
      ) : historyItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
          <Layers size={40} color="var(--text-dim)" style={{ marginBottom: '12px' }} />
          <h4>No Prediction History Found</h4>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            Upload a CSV dataset to run your first failure risk assessment.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.7)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Dataset Filename</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Total Modules</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Risk Profile</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Date Analyzed</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {historyItems.map((item, idx) => {
                const dist = item.risk_distribution || {};
                const critical = dist.critical || 0;
                const high = dist.high || 0;
                const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{item.filename}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        Model: {item.selected_primary_model}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      {item.total_modules}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      {critical > 0 ? (
                        <span className="badge badge-critical">{critical} Critical</span>
                      ) : high > 0 ? (
                        <span className="badge badge-high">{high} High</span>
                      ) : (
                        <span className="badge badge-low">Healthy</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {formattedDate}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          title="View Analysis Dashboard"
                          onClick={() => navigate(`/results?history_id=${item.id}`)}
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          title="Download PDF Report"
                          onClick={() => handleDownloadPdf(item.id, item.filename)}
                        >
                          <Download size={14} />
                          <span>PDF</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ padding: '6px 8px' }}
                          title="Delete Record"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}>
            <div>
              Showing Page <b>{page}</b> of <b>{totalPages}</b> ({totalCount} total runs)
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '6px 12px' }}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '6px 12px' }}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionHistoryTable;
