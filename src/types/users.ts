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