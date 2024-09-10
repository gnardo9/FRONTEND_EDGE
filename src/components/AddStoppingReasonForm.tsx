import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '@/styles/AddStoppingReasonForm.scss'; // Importe o arquivo SCSS aqui

const AddStoppingReasonForm: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post('https://edgeautomacao-4-0.onrender.com/api/stopping-reasons/', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Motivo de parada cadastrado com sucesso');
      navigate('/stopping-reasons');
    } catch (error) {
      toast.error('Erro ao cadastrar motivo de parada. Verifique suas credenciais.');
      console.error('Erro ao cadastrar motivo de parada:', error);
    }
  };

  return (
    <div className="add-stopping-reason-form">
      <h2>Adicionar Motivo de Parada</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Descrição</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required />
        </div>
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default AddStoppingReasonForm;
