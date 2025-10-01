export interface User {
  id: string;
  name?: string;
  email?: string;
}

export interface List {
  id: string;
  userId: string;
  name: string;
  description?: string;
  month: number;
  year: number;
  Item?: Item[];
  Share?: Share[];
  totalItems?: number;
  totalPurchased?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  position: number;
  color: string;
}

export interface Item {
 id: string;
  listId: string;
  categoryId: string;
  name: string;
  quantity: number;
  imageUrl?: string;
  purchased: boolean;
  position: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Share {
  id: string;
  listId: string;
  userId: string;
  profiles: Profile;
  hasPassword: boolean;
  password?: string;
  permission: 'view' | 'edit';
  createdAt?: string;
}
export interface Profile {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  createdAt?: string;
  updatedAt?: string;
}
