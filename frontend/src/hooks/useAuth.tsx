import { User } from '@/types/models';
import { ky } from '@/utils/api';
import { getCookie } from '@/utils/cookie';
import { useNavigate } from 'react-router';
import useSWR, { mutate } from 'swr';

export default function useAuth() {
  const navigate = useNavigate();
  const { data, ...rest } = useSWR('/api/auth/me/', async (url) => {
    const response = await ky.get(url).json<{ user: User | null } | null>();
    return response?.user || null;
  });

  async function logout(redirectTo: string | null = "/") {
    await ky.post('/api/auth/logout/');

    if (redirectTo) {
      navigate(redirectTo);
      await mutate('/api/auth/me/', null);
    }
  }

  type LoginOptions = {
    redirectTo?: string;
  }

  async function login(username: string, password: string, options: LoginOptions = {}) {
    const response = await ky.post('/api/auth/login/', {
      json: {
        username: username,
        password: password,
      },
      headers: {
        'X-CSRFToken': getCookie('csrftoken'),
      }
    }).json<{ user: User } | null>()
      .catch((error) => {
        console.error('ログインに失敗しました:', error);
        return null;
      });

    if (!response?.user) {
      return false;
    }

    mutate('/api/auth/me/', response.user ? { user: response.user } : undefined);
    navigate(options?.redirectTo || '/');

    return true;
  }

  async function register(username: string, password: string) {
    const response = await ky.post('api/auth/register/', {
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
      const response = await ky.get('/api/gacha/').json<{ cards: any[] }>();
      mutate('/api/auth/me/');
      return response.cards;
    } catch (error) {
      console.error('ガチャに失敗しました:', error);
      return [];
    }
  }

  async function saveDeck(deck: string[]) {
    try {
      const response = await ky.post('/api/save-deck/', {
        json: { deck },
        headers: {
          'X-CSRFToken': getCookie('csrftoken'),
        }
      }).json<{ message: string } | null>();

      if (response) {
        console.log(response.message);
      }
    } catch (error) {
      console.error('デッキの保存に失敗しました:', error);
    }
  }

  async function getDeck() {
    try {
      const response = await ky.get('/api/get-deck/').json<{ cards: string[] } | null>();
      return response?.cards || [];
    } catch (error) {
      console.error('デッキの取得に失敗しました:', error);
      return [];
    }
  }

  async function userCards() {
    try {
      const response = await ky.get('/api/user-cards').json<{ name: string, amount: number }[]>();
      return response;
    } catch (error) {
      console.error('ユーザーカードの取得に失敗しました:', error);
      return [];
    }
  }

  return {
    user: data,
    logout,
    login,
    register,
    gacha,
    saveDeck,
    getDeck,
    userCards,
    ...rest,
  };
}
