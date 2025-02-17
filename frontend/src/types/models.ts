export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  last_login: string;
  date_joined: string;
  groups: any[];
  user_permissions: any[];

  [key: string]: any;
}

export interface Card {
  id: number;
  name: string;
  image: string;
  attack: number;
  hp: number;
  pack: string;
  type: string;
}
