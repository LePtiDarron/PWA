import { useEffect, useState } from 'react';
import api from '../api';

const UserList = ({ refreshTrigger, onUserDeleted }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get(`/users`).then(res => {
      setUsers(res.data);
    });
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      if (onUserDeleted) onUserDeleted(id);
      setUsers(users.filter(user => user._id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div>
      <h2 className="mb-3">Utilisateurs</h2>
      <ul className="list-group">
        {users.map(user => (
          <li key={user._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{user.prenom} {user.nom}</strong> — <span className="text-muted">{user.email}</span>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user._id)}>
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;