import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddSectionForm: React.FC = () => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompany = async () => {
      const token = localStorage.getItem('accessToken');
      try {
        const response = await axios.get('https://edgeautomacao-4-0.onrender.com/api/user-company/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setCompany(response.data.company);
      } catch (error) {
        console.error('Erro ao buscar a empresa do usuário:', error);
        toast.error('Erro ao buscar a empresa do usuário.');
      }
    };

    fetchCompany();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');

    try {
      const response = await axios.post(
        'https://edgeautomacao-4-0.onrender.com/api/sections/',
        { name, company },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success('Setor criado com sucesso!');
        navigate('/sections');
      }
    } catch (error) {
      console.error('Erro ao criar setor:', error);
      toast.error('Erro ao criar setor.');
    }
  };

  return (
    <div>
      <h2>Adicionar Setor</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome do Setor:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <button type="submit">Adicionar</button>
      </form>
    </div>
  );
};

export default AddSectionForm;