import { useState } from 'react';
import api from '../api/axios';
import { Download, Loader2 } from 'lucide-react';

const ExportBtn = ({ url, label, type }) => {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        try {
            setExporting(true);
            const response = await api.get(url, {
                responseType: 'blob'
            });

            // Create blob link to download
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;

            // Extract filename from content-disposition if possible, or use default
            const contentDisposition = response.headers['content-disposition'];
            let fileName = `report_${label.toLowerCase()}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename=(.+)/);
                if (fileNameMatch) {
                    // Remove quotes if present
                    fileName = fileNameMatch[1].replace(/['"]/g, '');
                }
            }

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('Export failed:', err);
            alert('Failed to export report. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={exporting}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200 flex items-center gap-1.5 ${type === 'pdf'
                ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                } ${exporting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {exporting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
                <Download className="w-3 h-3" />
            )}
            {label}
        </button>
    );
};

export default ExportBtn;
