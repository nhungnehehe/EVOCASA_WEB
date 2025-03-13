export interface Category {
    id: string;
    _id: string;
    name: string;
    description: string;
    slug: string;
    parentCategory: string | null;
    image: string;
  }