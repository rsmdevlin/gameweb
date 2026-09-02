export class AuthManager {
  constructor(private apiUrl: string) {}

  async register(username: string, email: string, password: string) {
    const response = await fetch(`${this.apiUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    return data;
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}
