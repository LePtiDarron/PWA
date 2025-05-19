import { useState } from 'react';
import api from '../api';

const UserForm = ({ onUserCreated }) => {
  const [form, setForm] = useState({ email: '', lastname: '', firstname: '' });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post(`/users`, form);
      setForm({ email: '', lastname: '', firstname: '' });
      onUserCreated();
    } catch (err) {
      alert('Erreur: ' + err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="container my-4">
      <h2 className="mb-4">Créer des utilisateurs</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input name="email" type="email" className="form-control" placeholder="Email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Nom</label>
          <input name="lastname" className="form-control" placeholder="Nom" value={form.lastname} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Prénom</label>
          <input name="firstname" className="form-control" placeholder="Prénom" value={form.firstname} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-primary">Créer</button>
      </form>
    </div>
  );
}

export default UserForm;