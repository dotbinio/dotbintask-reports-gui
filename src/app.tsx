import { useState, useEffect } from 'preact/hooks';
import { AuthPrompt } from './components/AuthPrompt';
import { ReportSelector } from './components/ReportSelector';
import { ReportView } from './components/ReportView';
import { authService } from './services/auth';
import { storageService } from './services/storage';
import { apiClient } from './services/api';
import type { Report } from './types';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [validating, setValidating] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);
  
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          // Try to validate the token
          const isValid = await apiClient.validateToken();
          if (isValid) {
            setIsAuthenticated(true);
            loadReports();
          } else {
            // Token is actually invalid (401)
            setAuthError('Your token has expired. Please log in again.');
            authService.clearToken();
          }
        } catch (error) {
          // Network error - server is down/unreachable
          // Don't clear token, allow offline mode with cached data
          console.log('API server unreachable, proceeding in offline mode');
          setIsAuthenticated(true);
          loadReports(); // This will load from cache
        }
      }
      setValidating(false);
    };

    checkAuth();
  }, []);

  // Load report preferences when reports are loaded
  useEffect(() => {
    if (reports.length > 0) {
      const preferences = storageService.getReportPreferences();
      // Filter to only include reports that actually exist
      const validSelected = preferences.selectedReports.filter(name =>
        reports.some(r => r.name === name)
      );
      
      if (validSelected.length === 0) {
        // Default to 'next' and 'active' if they exist
        const defaults = reports
          .filter(r => ['next', 'active'].includes(r.name))
          .map(r => r.name);
        setSelectedReports(defaults.length > 0 ? defaults : [reports[0]?.name || '']);
      } else {
        setSelectedReports(validSelected);
      }
    }
  }, [reports]);

  const loadReports = async () => {
    try {
      setLoadingReports(true);
      setReportsError(null);
      const reportsData = await apiClient.getReports();
      setReports(reportsData);
    } catch (error) {
      console.error('Failed to load reports:', error);
      setReportsError(
        error instanceof Error ? error.message : 'Failed to load reports'
      );
    } finally {
      setLoadingReports(false);
    }
  };

  const handleAuthenticate = async (token: string) => {
    setAuthError(null);
    setAuthenticating(true);
    authService.setToken(token);
    
    try {
      // Validate the token
      const isValid = await apiClient.validateToken();
      
      if (isValid) {
        setIsAuthenticated(true);
        loadReports();
      } else {
        setAuthError('Invalid token. Please check and try again.');
        authService.clearToken();
      }
    } catch (error) {
      // Network error - server is down
      // For new authentication, we need the server to be up
      let errorMessage = 'Cannot connect to API server. ';
      
      if (error instanceof Error && error.message.includes('Cannot connect')) {
        errorMessage = error.message + ' Please start the API server to authenticate.';
      } else if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please ensure the API server is running.';
      }
      
      setAuthError(errorMessage);
      authService.clearToken();
    } finally {
      setAuthenticating(false);
    }
  };

  const handleReportSelectionChange = (newSelection: string[]) => {
    setSelectedReports(newSelection);
    storageService.setReportPreferences({ selectedReports: newSelection });
  };

  const handleLogout = () => {
    authService.clearToken();
    storageService.clearCache();
    setIsAuthenticated(false);
    setReports([]);
    setSelectedReports([]);
    setAuthError(null);
  };

  // Show loading screen while validating
  if (validating) {
    return (
      <main class="container">
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <progress />
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  // Show authentication prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthPrompt 
        onAuthenticate={handleAuthenticate} 
        error={authError || undefined}
        isValidating={authenticating}
      />
    );
  }

  // Main application view
  return (
    <main class="container">
      <nav style={{ marginTop: '1rem', marginBottom: '2rem' }}>
        <ul>
          <li>
            <h1 style={{ margin: 0 }}>DotbinTask</h1>
          </li>
        </ul>
        <ul>
          <li>
            <button onClick={handleLogout} class="secondary outline">
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {loadingReports && (
        <div style={{ textAlign: 'center' }}>
          <progress />
          <p>Loading reports...</p>
        </div>
      )}

      {reportsError && (
        <article style={{ backgroundColor: 'var(--card-background-color)' }}>
          <p style={{ color: 'var(--del-color, #d32f2f)' }}>
            {reportsError}
          </p>
          <button onClick={loadReports}>Retry</button>
        </article>
      )}

      {!loadingReports && !reportsError && reports.length > 0 && (
        <>
          <ReportSelector
            reports={reports}
            selectedReports={selectedReports}
            onSelectionChange={handleReportSelectionChange}
          />

          {selectedReports.length === 0 && (
            <article>
              <p>
                <em>Select at least one report to display tasks</em>
              </p>
            </article>
          )}

          {selectedReports.map((reportName) => {
            const report = reports.find((r) => r.name === reportName);
            return (
              <ReportView
                key={reportName}
                reportName={reportName}
                reportLabel={report?.label}
              />
            );
          })}
        </>
      )}
    </main>
  );
}
