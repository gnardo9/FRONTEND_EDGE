import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '@/styles/AddTurnForm.scss';

interface Section {
  id: number;
  name: string;
}

const AddTurnForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    hora_inicio: '',
    inicio_intervalo_almoco: '',
    final_intervalo_almoco: '',
    hora_termino_turno: '',
    dia_semana: 'SegSex',
    section: '',
  });
  const [sections, setSections] = useState<Section[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch sections
    const fetchSections = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('https://edgeautomacao-4-0.onrender.com/api/sections/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSections(response.data);
      } catch (error) {
        console.error('Erro ao buscar seções:', error);
        toast.error('Erro ao buscar seções');
      }
    };

    fetchSections();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post('https://edgeautomacao-4-0.onrender.com/api/turns/', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Turno cadastrado com sucesso');
      navigate('/turns');
    } catch (error) {
      console.error('Erro ao cadastrar turno:', error);
      toast.error('Erro ao cadastrar turno');
    }
  };

  return (
    <div className="add-turn-form">
      <h2>Cadastrar Turno</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Hora de Início</label>
          <input type="time" name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Início do Intervalo de Almoço</label>
          <input type="time" name="inicio_intervalo_almoco" value={formData.inicio_intervalo_almoco} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Fim do Intervalo de Almoço</label>
          <input type="time" name="final_intervalo_almoco" value={formData.final_intervalo_almoco} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Hora de Término</label>
          <input type="time" name="hora_termino_turno" value={formData.hora_termino_turno} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Dia da Semana</label>
          <select name="dia_semana" value={formData.dia_semana} onChange={handleChange} required>
            <option value="Seg">Segunda-feira</option>
            <option value="Ter">Terça-feira</option>
            <option value="Qua">Quarta-feira</option>
            <option value="Qui">Quinta-feira</option>
            <option value="Sex">Sexta-feira</option>
            <option value="Sab">Sábado</option>
            <option value="SegQui">Segunda a Quinta</option>
            <option value="SegSex">Segunda a Sexta</option>
            <option value="SegSab">Segunda a Sábado</option>
          </select>
        </div>
        <div className="form-group">
          <label>Seção</label>
          <select name="section" value={formData.section} onChange={handleChange}>
            <option value="">All</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>{section.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="submit-btn">Cadastrar</button>
      </form>
    </div>
  );
};

export default AddTurnForm;

