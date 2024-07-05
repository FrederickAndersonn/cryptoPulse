// src/actions/userProfile.ts
export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  publicKey: string;
  initialBalance: number;
  comments: Comment[];
  posts: Post[];
}

export interface UpdatePasswordResponse {
  msg: string;
}

export const fetchUserProfile = async (): Promise<UserProfile | null> => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found');
    return null;
  }

  try {
    const response = await fetch('http://localhost:5001/user/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const data: UserProfile = await response.json();
    console.log('User profile fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }
};

export const updatePassword = async (currentPassword: string, newPassword: string): Promise<UpdatePasswordResponse | null> => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found');
    return null;
  }

  try {
    const response = await fetch('http://localhost:5001/user/update-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      throw new Error('Failed to update password');
    }

    const data: UpdatePasswordResponse = await response.json();
    console.log('Password update successful:', data);
    return data;
  } catch (error) {
    console.error('Password update failed:', error);
    return null;
  }
};