// src/components/Profile.tsx
import React, { useContext } from 'react';
import { UserContext } from './UserContext';
import '../styles/Profile.css';

const Profile: React.FC = () => {
  const { user } = useContext(UserContext);

  if (!user) {
    return <div className="profile-container">No user data available. Please log in.</div>;
  }

  return (
    <div className="profile-container">
      <h2>Welcome, {user.username}</h2>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Username:</strong> {user.username}</p>
    </div>
  );
};

export default Profile;
