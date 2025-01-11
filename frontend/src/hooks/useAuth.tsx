import { User } from '@/types/models';
import { api } from '@/utils/api';
import { getCookie } from '@/utils/cookie';
import { useNavigate } from 'react-router';
import useSWR, { mutate } from 'swr';

export default function useAuth() {
  const navigate = useNavigate();
  const { data, ...rest } = useSWR('/api/auth/me/', async (url) => {
    const response = await api.get(url).json<{ user: User | null } | null>();
    return response?.user || null;
  });

  async function logout(redirectTo: string | null = "/") {
    localStorage.removeItem('token');
    await api.post('/api/auth/logout/');

    if (redirectTo) {
      navigate(redirectTo);
      mutate('/api/auth/me/', null);
    }
  }

  type LoginOptions = {
    redirectTo?: string;
  }

  async function login(username: string, password: string, options: LoginOptions = {}) {
    const response = await api.post('api/auth/login/', {
      json: {
        username: username,
        password: password,
      },
      headers: {
        'X-CSRFToken': getCookie('csrftoken'),
      }
    }).json<{ token: string; user: User } | null>()
    .catch((error) => {
      console.error('ログインに失敗しました:', error);
      return null;
    });

    if (!response?.token) {
      return false;
    }

    localStorage.setItem('token', response.token);
    mutate('/api/auth/me/', response.user ? { user: response.user } : undefined);
    navigate(options?.redirectTo || '/');

    return true;
  }

  async function register(username: string, password: string) {
    const response = await api.post('api/auth/register/', {
      json: {
        username: username,
        password: password,
      },
      headers: {
        'X-CSRFToken': getCookie('csrftoken'),
      }
    }).json<{ token: string; user: User } | null>()
    .catch((error) => {
      console.error('登録に失敗しました:', error);
      return null;
    });

    if (!response?.token) {
      return false;
    }

    localStorage.setItem('token', response.token);
    navigate('/');

    return true;
  }

  async function gacha() {
    try {
      const response = await api.get('/api/gacha/').json<{ cards: any[] }>();
      return response.cards;
    } catch (error) {
      console.error('ガチャに失敗しました:', error);
      return [];
    }
  }

  return {
    user: data,
    logout,
    login,
    register,
    gacha,
    ...rest,
  };
}
