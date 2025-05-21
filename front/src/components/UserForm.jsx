import { useEffect, useState } from 'react';
import api from '../api';

const UserForm = ({ onUserCreated }) => {
  const [form, setForm] = useState({ email: '', lastname: '', firstname: '', role: '' });
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/users/roles');
        setRoles(response.data);
      } catch (err) {
        console.error('Error: ', err.response?.data?.error || err.message);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post(`/users`, form);
      setForm({ email: '', lastname: '', firstname: '', role: '' });
      onUserCreated();
    } catch (err) {
        console.error('Error: ', err.response?.data?.error || err.message);
    }
  };

  return (
    <div>
      <h2 className="mb-4">Create Users</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input name="email" type="email" className="form-control" placeholder="Email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Lastname</label>
          <input name="lastname" className="form-control" placeholder="Lastname" value={form.lastname} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Firstname</label>
          <input name="firstname" className="form-control" placeholder="Firstname" value={form.firstname} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Role</label>
          <select name="role" className="form-control" value={form.role} onChange={handleChange} required>
            <option value="" disabled>Choose a role</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Create</button>
      </form>
    </div>
  );
};

export default UserForm;
