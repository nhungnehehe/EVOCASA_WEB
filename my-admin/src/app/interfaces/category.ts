export interface Category {
  id: string;
  _id: string | { $oid: string };  // Allow both string and MongoDB ObjectId format
  name: string;
  description: string;
  slug: string;
  parentCategory: string | null;
  image: string;
}