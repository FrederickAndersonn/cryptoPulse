interface SignupResponse {
    token: string;
    userid: string;
  }
  
  interface LoginResponse {
    token: string;
    userid: string;
  }
  
  export const signup = async (name: string, email: string, password: string): Promise<SignupResponse | null> => {
    try {
      const response = await fetch('https://cryptopulse-n0ol.onrender.com/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      const data: SignupResponse = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userid);
      console.log('Signup successful:', data);
      return data;
    } catch (error) {
      console.error('Signup failed:', error);
      return null; // Return null or handle error as needed
    }
  };
  
  export const login = async (email: string, password: string): Promise<LoginResponse | null> => {
    try {
      const response = await fetch('https://cryptopulse-n0ol.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data: LoginResponse = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userid);
      console.log('Login successful:', data);
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      return null; // Return null or handle error as needed
    }
  };
  