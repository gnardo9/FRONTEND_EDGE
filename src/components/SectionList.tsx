import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/SectionList.scss';

// Definir o elemento do aplicativo para o Modal
Modal.setAppElement('#root');

interface Section {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
  company: number;
}

const SectionList: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [editSection, setEditSection] = useState<Section | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await axios.get('https://edgeautomacao-4-0.onrender.com/api/sections/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setSections(response.data);
      } catch (error) {
        console.error('Erro ao buscar setores:', error);
        toast.error('Erro ao buscar setores');
      }
    };

    fetchSections();
  }, []);

  const handleAddSection = () => {
    navigate('/add-section');
  };

  const openEditModal = (section: Section) => {
    setEditSection(section);
    setModalOpen(true);
  };

  const closeEditModal = () => {
    setEditSection(null);
    setModalOpen(false);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editSection) {
      setEditSection({ ...editSection, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('accessToken');
    if (editSection) {
      try {
        const response = await axios.put(
          `https://edgeautomacao-4-0.onrender.com/api/sections/${editSection.id}/`,
          editSection,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          toast.success('Setor atualizado com sucesso!');
          setModalOpen(false);
          setSections(sections.map((section) => (section.id === editSection.id ? editSection : section)));
        }
      } catch (error) {
        console.error('Erro ao atualizar setor:', error);
        toast.error('Erro ao atualizar setor.');
      }
    }
  };

  const handleDelete = async (sectionId: number) => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axios.delete(`https://edgeautomacao-4-0.onrender.com/api/sections/${sectionId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 204) {
        toast.success('Setor deletado com sucesso!');
        setSections(sections.filter((section) => section.id !== sectionId));
      }
    } catch (error) {
      console.error('Erro ao deletar setor:', error);
      toast.error('Erro ao deletar setor.');
    }
  };

  return (
    <div className="section-list">
      <h2>Lista de Setores</h2>
      <button onClick={handleAddSection}>Adicionar Setor</button>
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            {section.name}
            <button onClick={() => openEditModal(section)}>Editar</button>
            <button onClick={() => handleDelete(section.id)}>Deletar</button>
          </li>
        ))}
      </ul>
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeEditModal}
        contentLabel="Editar Setor"
      >
        {editSection && (
          <div>
            <h2>Editar Setor</h2>
            <form>
              <div>
                <label>Nome do Setor:</label>
                <input
                  type="text"
                  name="name"
                  value={editSection.name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <button type="button" onClick={handleSave}>Salvar</button>
              <button type="button" onClick={closeEditModal}>Cancelar</button>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SectionList;

