import { useState } from 'preact/hooks';

interface AuthPromptProps {
  onAuthenticate: (token: string) => void;
  error?: string;
  isValidating?: boolean;
}

export function AuthPrompt({ onAuthenticate, error, isValidating = false }: AuthPromptProps) {
  const [token, setToken] = useState('');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!token.trim()) {
      return;
    }
    
    onAuthenticate(token.trim());
  };

  return (
    <main class="container">
      <article style={{ marginTop: '2rem' }}>
        <header>
          <h1>DotbinTask</h1>
          <p>Enter your API token to continue</p>
        </header>
        
        <form onSubmit={handleSubmit}>
          <label>
            API Token
            <input
              type="password"
              placeholder="Enter your authentication token"
              value={token}
              onInput={(e) => setToken((e.target as HTMLInputElement).value)}
              disabled={isValidating}
              required
              autoFocus
            />
          </label>

          {error && (
            <small style={{ color: 'var(--del-color, #d32f2f)' }}>
              {error}
            </small>
          )}

          <button type="submit" disabled={isValidating || !token.trim()}>
            {isValidating ? 'Validating...' : 'Authenticate'}
          </button>
        </form>

        <footer>
          <small>
            Your token is stored locally in your browser and is only used to
            authenticate with the API.
          </small>
        </footer>
      </article>
    </main>
  );
}

