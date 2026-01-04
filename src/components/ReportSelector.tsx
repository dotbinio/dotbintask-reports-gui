import type { Report } from '../types';

interface ReportSelectorProps {
  reports: Report[];
  selectedReports: string[];
  onSelectionChange: (selectedReports: string[]) => void;
}

export function ReportSelector({
  reports,
  selectedReports,
  onSelectionChange,
}: ReportSelectorProps) {
  const handleToggle = (reportName: string) => {
    const isSelected = selectedReports.includes(reportName);
    
    if (isSelected) {
      // Unselect
      onSelectionChange(selectedReports.filter((r) => r !== reportName));
    } else {
      // Select
      onSelectionChange([...selectedReports, reportName]);
    }
  };

  return (
    <article style={{ marginBottom: '2rem' }}>
      <header>
        <strong>Select Reports to Display</strong>
      </header>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {reports.map((report) => (
          <label key={report.name} style={{ marginBottom: '0' }}>
            <input
              type="checkbox"
              checked={selectedReports.includes(report.name)}
              onChange={() => handleToggle(report.name)}
            />
            {report.label || report.name}
          </label>
        ))}
      </div>
    </article>
  );
}

