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