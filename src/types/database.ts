export type Priority = 'baja' | 'media' | 'alta' | 'urgente';
export type GoalStatus = 'pendiente' | 'en_progreso' | 'completado';
export type ProjectStatus = 'idea' | 'planificado' | 'en_desarrollo' | 'terminado' | 'archivado';
export type Currency = 'PYG' | 'USD' | 'EUR';
export type WishlistStatus = 'pendiente' | 'comprado' | 'descartado';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  interests: string[];
  skills: string[];
  studies?: string;
  technologies: string[];
  social_links: {
    github?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  deadline?: string;
  priority: Priority;
  status: GoalStatus;
  progress: number;
  subtasks: Subtask[];
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  image_url?: string;
  category: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  technologies: string[];
  github_url?: string;
  demo_url?: string;
  website_url?: string;
  notes?: string;
  is_public: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  price: number;
  currency: Currency;
  category: string;
  product_url?: string;
  image_url?: string;
  priority: 'baja' | 'media' | 'alta';
  status: WishlistStatus;
  created_at: string;
  updated_at: string;
}