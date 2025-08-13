import { useState } from 'react';
import { X, Download, FileText, Calendar, DollarSign, Users } from 'lucide-react';

interface ExportReportModalProps {
  onClose: () => void;
}

export default function ExportReportModal({ onClose }: ExportReportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'donations' | 'users' | 'subscriptions' | 'all'>('all');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [dateRange, setDateRange] = useState<'all' | '30days' | '7days' | 'today'>('all');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        type: exportType,
        format: format,
        range: dateRange
      });

      const response = await fetch(`/api/admin/export-report?${params}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vaultkeeper-${exportType}-report-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to export report');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const getReportDescription = () => {
    switch (exportType) {
      case 'donations':
        return 'Export all donation records including donor information, amounts, messages, and timestamps';
      case 'users':
        return 'Export user data including registration info, subscriber status, XP, points, and activity metrics';
      case 'subscriptions':
        return 'Export subscription records including payment history, plans, and billing cycles';
      case 'all':
        return 'Export comprehensive report including users, donations, subscriptions, and community stats';
      default:
        return '';
    }
  };

  const getDateRangeDescription = () => {
    switch (dateRange) {
      case 'today':
        return 'Today only';
      case '7days':
        return 'Last 7 days';
      case '30days':
        return 'Last 30 days';
      case 'all':
        return 'All time data';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999999] p-4" style={{ zIndex: 999999 }}>
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Download className="w-6 h-6 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Export Report</h2>
                <p className="text-blue-100">Generate and download data reports</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Export Type Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Report Type</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportType('all')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportType === 'all'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-gray-600 bg-gray-700 hover:border-purple-400'
                }`}
              >
                <FileText className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                <div className="text-sm font-medium text-white">Complete Report</div>
                <div className="text-xs text-gray-400">All data types</div>
              </button>

              <button
                onClick={() => setExportType('donations')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportType === 'donations'
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-gray-600 bg-gray-700 hover:border-green-400'
                }`}
              >
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-400" />
                <div className="text-sm font-medium text-white">Donations Only</div>
                <div className="text-xs text-gray-400">Financial records</div>
              </button>

              <button
                onClick={() => setExportType('users')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportType === 'users'
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-600 bg-gray-700 hover:border-blue-400'
                }`}
              >
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                <div className="text-sm font-medium text-white">Users Only</div>
                <div className="text-xs text-gray-400">Community data</div>
              </button>

              <button
                onClick={() => setExportType('subscriptions')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportType === 'subscriptions'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-gray-600 bg-gray-700 hover:border-purple-400'
                }`}
              >
                <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                <div className="text-sm font-medium text-white">Subscriptions</div>
                <div className="text-xs text-gray-400">Premium members</div>
              </button>
            </div>
          </div>

          {/* Format Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Export Format</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setFormat('csv')}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  format === 'csv'
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-600 bg-gray-700 hover:border-blue-400'
                }`}
              >
                <div className="text-sm font-medium text-white">CSV</div>
                <div className="text-xs text-gray-400">Excel compatible</div>
              </button>

              <button
                onClick={() => setFormat('json')}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  format === 'json'
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-600 bg-gray-700 hover:border-blue-400'
                }`}
              >
                <div className="text-sm font-medium text-white">JSON</div>
                <div className="text-xs text-gray-400">Developer friendly</div>
              </button>
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Date Range</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDateRange('today')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  dateRange === 'today'
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-gray-600 bg-gray-700 hover:border-green-400'
                }`}
              >
                <div className="text-sm font-medium text-white">Today</div>
              </button>

              <button
                onClick={() => setDateRange('7days')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  dateRange === '7days'
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-gray-600 bg-gray-700 hover:border-green-400'
                }`}
              >
                <div className="text-sm font-medium text-white">Last 7 Days</div>
              </button>

              <button
                onClick={() => setDateRange('30days')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  dateRange === '30days'
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-gray-600 bg-gray-700 hover:border-green-400'
                }`}
              >
                <div className="text-sm font-medium text-white">Last 30 Days</div>
              </button>

              <button
                onClick={() => setDateRange('all')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  dateRange === 'all'
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-gray-600 bg-gray-700 hover:border-green-400'
                }`}
              >
                <div className="text-sm font-medium text-white">All Time</div>
              </button>
            </div>
          </div>

          {/* Report Preview */}
          <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <h4 className="font-semibold text-white mb-2">Export Preview</h4>
            <div className="space-y-1 text-sm text-gray-300">
              <p><span className="text-gray-400">Type:</span> {getReportDescription()}</p>
              <p><span className="text-gray-400">Format:</span> {format.toUpperCase()} file</p>
              <p><span className="text-gray-400">Range:</span> {getDateRangeDescription()}</p>
              <p><span className="text-gray-400">Filename:</span> vaultkeeper-{exportType}-report-{new Date().toISOString().split('T')[0]}.{format}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>{isExporting ? 'Exporting...' : 'Export Report'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
