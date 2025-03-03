export interface Category {
    _id: string;
    name: string;
    description: string;
    slug: string;
    parentCategory: string | null;
  }