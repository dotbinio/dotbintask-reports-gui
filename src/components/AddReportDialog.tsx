import { useState } from 'preact/hooks';
import type { Report } from '../types';

interface AddReportDialogProps {
  reports: Report[];
  existingReports: string[];
  onAdd: (reportName: string, width: 'full' | 'half') => void;
  onCancel: () => void;
}

export function AddReportDialog({ 
  reports, 
  existingReports, 
  onAdd, 
  onCancel 
}: AddReportDialogProps) {
  const availableReports = reports.filter(
    report => !existingReports.includes(report.name)
  );

  const [selectedReport, setSelectedReport] = useState(
    availableReports[0]?.name || ''
  );
  const [width, setWidth] = useState<'full' | 'half'>('half');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (selectedReport) {
      onAdd(selectedReport, width);
    }
  };

  if (availableReports.length === 0) {
    return (
      <dialog open>
        <article>
          <header>
            <button 
              aria-label="Close" 
              rel="prev" 
              onClick={onCancel}
              style={{ float: 'right' }}
            />
            <h3>Add Report</h3>
          </header>
          <p>All available reports are already displayed.</p>
          <footer>
            <button onClick={onCancel}>Close</button>
          </footer>
        </article>
      </dialog>
    );
  }

  return (
    <dialog open>
      <article>
        <header>
          <button 
            aria-label="Close" 
            rel="prev" 
            onClick={onCancel}
            style={{ float: 'right' }}
          />
          <h3>Add Report</h3>
        </header>
        
        <form onSubmit={handleSubmit}>
          <label>
            Report
            <select 
              value={selectedReport}
              onChange={(e) => setSelectedReport((e.target as HTMLSelectElement).value)}
              required
            >
              {availableReports.map(report => (
                <option key={report.name} value={report.name}>
                  {report.label || report.name}
                </option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend>Width</legend>
            <label>
              <input 
                type="radio" 
                name="width" 
                value="half"
                checked={width === 'half'}
                onChange={() => setWidth('half')}
              />
              Half Width
            </label>
            <label>
              <input 
                type="radio" 
                name="width" 
                value="full"
                checked={width === 'full'}
                onChange={() => setWidth('full')}
              />
              Full Width
            </label>
          </fieldset>

          <footer style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onCancel} className="secondary">
              Cancel
            </button>
            <button type="submit">
              Add
            </button>
          </footer>
        </form>
      </article>
    </dialog>
  );
}

