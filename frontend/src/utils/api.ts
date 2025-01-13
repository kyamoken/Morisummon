import _ky from "ky";
import { getCookie } from "./cookie";

export const ky = _ky.create({
  prefixUrl: '',
  credentials: 'include',
  mode: 'cors',
  hooks: {
    beforeRequest: [
      async (request) => {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
          request.headers.set('X-CSRFToken', csrfToken);
        }
      }
    ]
  }
});

export const fetchCsrfToken = () => ky.get('/api/csrf-token/').json<{ csrfToken: string }>()
  .then((data) => {
    return data.csrfToken;
  });

export const getCsrfToken = () => getCookie('csrftoken');
