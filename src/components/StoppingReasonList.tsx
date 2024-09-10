import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/StoppingReasonList.scss';

// Definir o elemento do aplicativo para o Modal
Modal.setAppElement('#root');

interface StoppingReason {
  id: number;
  name: string;
  description: string;
}

const StoppingReasonList: React.FC = () => {
  const [stoppingReasons, setStoppingReasons] = useState<StoppingReason[]>([]);
  const [editStoppingReason, setEditStoppingReason] = useState<StoppingReason | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStoppingReasons = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('Token não encontrado');
        }
        const response = await axios.get('https://edgeautomacao-4-0.onrender.com/api/stopping-reasons/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStoppingReasons(response.data);
      } catch (error: any) {
        console.error('Erro ao buscar motivos de parada:', error);
        if (error.response && error.response.status === 401) {
          toast.error('Sessão expirada. Por favor, faça login novamente.');
          navigate('/login');
        } else {
          toast.error('Erro ao buscar motivos de parada');
        }
      }
    };

    fetchStoppingReasons();
  }, [navigate]);

  const handleAddStoppingReason = () => {
    navigate('/add-stopping-reason');
  };

  const openEditModal = (stoppingReason: StoppingReason) => {
    setEditStoppingReason(stoppingReason);
    setModalOpen(true);
  };

  const closeEditModal = () => {
    setEditStoppingReason(null);
    setModalOpen(false);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editStoppingReason) {
      setEditStoppingReason({ ...editStoppingReason, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('accessToken');
    if (editStoppingReason) {
      try {
        const response = await axios.put(
          `https://edgeautomacao-4-0.onrender.com/api/stopping-reasons/${editStoppingReason.id}/`,
          editStoppingReason,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          toast.success('Motivo de Parada atualizado com sucesso!');
          setModalOpen(false);
          setStoppingReasons(stoppingReasons.map((reason) => (reason.id === editStoppingReason.id ? editStoppingReason : reason)));
        }
      } catch (error) {
        console.error('Erro ao atualizar motivo de parada:', error);
        toast.error('Erro ao atualizar motivo de parada.');
      }
    }
  };

  const handleDelete = async (stoppingReasonId: number) => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axios.delete(`https://edgeautomacao-4-0.onrender.com/api/stopping-reasons/${stoppingReasonId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 204) {
        toast.success('Motivo de Parada deletado com sucesso!');
        setStoppingReasons(stoppingReasons.filter((reason) => reason.id !== stoppingReasonId));
      }
    } catch (error) {
      console.error('Erro ao deletar motivo de parada:', error);
      toast.error('Erro ao deletar motivo de parada.');
    }
  };

  return (
    <div className="stopping-reason-list">
      <h2>Motivos de Parada</h2>
      <button onClick={handleAddStoppingReason}>Adicionar Motivo de Parada</button>
      <ul>
        {stoppingReasons.map((reason) => (
          <li key={reason.id}>
            <h3>{reason.name}</h3>
            <p>{reason.description}</p>
            <button onClick={() => openEditModal(reason)}>Editar</button>
            <button onClick={() => handleDelete(reason.id)}>Deletar</button>
          </li>
        ))}
      </ul>
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeEditModal}
        contentLabel="Editar Motivo de Parada"
      >
        {editStoppingReason && (
          <div>
            <h2>Editar Motivo de Parada</h2>
            <form>
              <div>
                <label>Nome do Motivo:</label>
                <input
                  type="text"
                  name="name"
                  value={editStoppingReason.name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label>Descrição:</label>
                <input
                  type="text"
                  name="description"
                  value={editStoppingReason.description}
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

export default StoppingReasonList;
