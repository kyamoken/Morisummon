import ky from "ky";

export const api = ky.create({
  prefixUrl: '',
  credentials: 'include',
  // mode: 'no-cors',
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = localStorage.getItem('token');
        if (token) {
          request.headers.set('Authorization', `Token ${token}`);
        }

        request.headers.set('X-CSRFToken', localStorage.getItem('X-CSRF-TOKEN') || '');
      }
    ]
  }
});

export const fetchCsrfToken = () => ky.get('/api/csrf-token/').json<{ csrfToken: string }>()
  .then((data) => {
    localStorage.setItem('X-CSRF-TOKEN', data.csrfToken);
    return data.csrfToken;
  });

export const getCsrfToken = () => localStorage.getItem('X-CSRF-TOKEN');
