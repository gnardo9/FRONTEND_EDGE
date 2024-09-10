import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/TurnList.scss';

// Definir o elemento do aplicativo para o Modal
Modal.setAppElement('#root');

interface Turn {
  id: number;
  name: string;
  hora_inicio: string;
  inicio_intervalo_almoco: string;
  final_intervalo_almoco: string;
  hora_termino_turno: string;
  dia_semana: string;
  section: number | null; // Allow null for the "Todos" option
  section_name: string; // To display section name
}

interface Section {
  id: number;
  name: string;
}

const TurnList: React.FC = () => {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [editTurn, setEditTurn] = useState<Turn | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTurns = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('https://edgeautomacao-4-0.onrender.com/api/turns/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTurns(response.data);
      } catch (error) {
        console.error('Erro ao buscar turnos:', error);
        toast.error('Erro ao buscar turnos');
      }
    };

    const fetchSections = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('https://edgeautomacao-4-0.onrender.com/api/sections/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSections([{ id: -1, name: 'Todos' }, ...response.data]);
      } catch (error) {
        console.error('Erro ao buscar seções:', error);
        toast.error('Erro ao buscar seções');
      }
    };

    fetchTurns();
    fetchSections();
  }, []);

  const handleAddTurn = () => {
    navigate('/add-turn');
  };

  const openEditModal = (turn: Turn) => {
    setEditTurn(turn);
    setModalOpen(true);
  };

  const closeEditModal = () => {
    setEditTurn(null);
    setModalOpen(false);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (editTurn) {
      setEditTurn({ ...editTurn, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('accessToken');
    if (editTurn) {
      try {
        const response = await axios.put(
          `https://edgeautomacao-4-0.onrender.com/api/turns/${editTurn.id}/`,
          editTurn,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          toast.success('Turno atualizado com sucesso!');
          setModalOpen(false);
          setTurns(turns.map((turn) => (turn.id === editTurn.id ? editTurn : turn)));
        }
      } catch (error) {
        console.error('Erro ao atualizar turno:', error);
        toast.error('Erro ao atualizar turno.');
      }
    }
  };

  const handleDelete = async (turnId: number) => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axios.delete(`https://edgeautomacao-4-0.onrender.com/api/turns/${turnId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 204) {
        toast.success('Turno deletado com sucesso!');
        setTurns(turns.filter((turn) => turn.id !== turnId));
      }
    } catch (error) {
      console.error('Erro ao deletar turno:', error);
      toast.error('Erro ao deletar turno.');
    }
  };

  return (
    <div className="turn-list">
      <h2>Lista de Turnos</h2>
      <button onClick={handleAddTurn}>Adicionar Turno</button>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Hora Início</th>
            <th>Início Almoço</th>
            <th>Fim Almoço</th>
            <th>Hora Término</th>
            <th>Dias da Semana</th>
            <th>Seção</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {turns.map((turn) => (
            <tr key={turn.id}>
              <td>{turn.name}</td>
              <td>{turn.hora_inicio}</td>
              <td>{turn.inicio_intervalo_almoco}</td>
              <td>{turn.final_intervalo_almoco}</td>
              <td>{turn.hora_termino_turno}</td>
              <td>{turn.dia_semana}</td>
              <td>{turn.section_name}</td>
              <td>
                <button onClick={() => openEditModal(turn)}>Editar</button>
                <button onClick={() => handleDelete(turn.id)}>Deletar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeEditModal}
        contentLabel="Editar Turno"
      >
        {editTurn && (
          <div>
            <h2>Editar Turno</h2>
            <form>
              <div>
                <label>Nome do Turno:</label>
                <input
                  type="text"
                  name="name"
                  value={editTurn.name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label>Hora Início:</label>
                <input
                  type="text"
                  name="hora_inicio"
                  value={editTurn.hora_inicio}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label>Início Almoço:</label>
                <input
                  type="text"
                  name="inicio_intervalo_almoco"
                  value={editTurn.inicio_intervalo_almoco}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label>Fim Almoço:</label>
                <input
                  type="text"
                  name="final_intervalo_almoco"
                  value={editTurn.final_intervalo_almoco}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label>Hora Término:</label>
                <input
                  type="text"
                  name="hora_termino_turno"
                  value={editTurn.hora_termino_turno}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label>Dias da Semana:</label>
                <input
                  type="text"
                  name="dia_semana"
                  value={editTurn.dia_semana}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label>Seção:</label>
                <select
                  name="section"
                  value={editTurn.section ?? ''}
                  onChange={handleEditChange}
                  required
                >
                  <option value="">Selecione uma Seção</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
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

export default TurnList;




