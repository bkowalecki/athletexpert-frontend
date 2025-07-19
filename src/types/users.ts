export type User = {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  bio?: string | null;
  sports?: string[];
  authProvider?: "local" | "auth0";
  role: string;
  isActive: boolean;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  gender?: string | null;
  dob?: string | null;
  favoriteColor?: string | null;
  savedBlogIds?: number[];
  savedProductIds?: number[];
};

export type UserProfile = {
    username: string;
    firstName: string;
    lastName: string;
    bio: string;
    profilePictureUrl: string;
    sports: string[];
    city?: string;
    state?: string;
    country?: string;
    gender?: string;
    dob?: string;
    favoriteColor?: string;
  };

//   interface Profile {
//     firstName: string;
//     lastName: string;
//     bio: string | null;
//     profilePictureUrl: string | null;
//     sports: string[] | null;
//     badges?: string[];
//     savedBlogIds?: number[];
//     savedProductIds?: number[];
//     location?: string | null;
//     publishedDate?: string | null;
//     summary?: string | null;
//   }