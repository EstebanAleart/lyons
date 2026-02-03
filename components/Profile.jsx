import { useSession } from 'next-auth/react';

  const { data: session, status } = useSession();
  if (status === 'loading') {
    return <div className="loading-state">Loading user profile...</div>;
  }
  const user = session?.user;
  if (!user) return null;

  return (
    <div className="profile-card action-card">
      {user.image && (
        <img
          src={user.image}
          alt={user.name || 'User profile'}
          className="profile-picture"
        />
      )}
      <h2 className="profile-name">{user.name}</h2>
      <p className="profile-email">{user.email}</p>
    </div>
  );
}
