import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import { format } from 'date-fns';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/MachineList.scss';

// Definir o elemento do aplicativo para o Modal
Modal.setAppElement('#root');

interface Machine {
  id: number;
  name: string;
  descricao: string;
  section_id: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  time_to_stop: number | null;
  asset_number: string | null;
  modo_contagem: string;
  meta_producao_hora: number | null;
}

const MachineList: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [currentMachine, setCurrentMachine] = useState<Machine | null>(null);
  const [sections, setSections] = useState<{ id: number; name: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await axios.get('https://edgeautomacao-4-0.onrender.com/api/machines/');
        setMachines(response.data);
      } catch (error) {
        console.error('Erro ao buscar máquinas:', error);
        toast.error('Erro ao buscar máquinas');
      }
    };

    const fetchSections = async () => {
      const token = localStorage.getItem('accessToken');
      try {
        const response = await axios.get('https://edgeautomacao-4-0.onrender.com/api/sections/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setSections(response.data);
      } catch (error) {
        console.error('Erro ao buscar setores:', error);
        toast.error('Erro ao buscar setores.');
      }
    };

    fetchMachines();
    fetchSections();
  }, []);

  const handleAddMachine = () => {
    navigate('/add-machine');
  };

  const openEditModal = (machine: Machine) => {
    setCurrentMachine(machine);
    setEditModalIsOpen(true);
  };

  const closeEditModal = () => {
    setCurrentMachine(null);
    setEditModalIsOpen(false);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (currentMachine) {
      setCurrentMachine({ ...currentMachine, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('accessToken');
    if (currentMachine) {
      try {
        const response = await axios.put(
          `https://edgeautomacao-4-0.onrender.com/api/machines/${currentMachine.id}/`,
          currentMachine,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          toast.success('Máquina atualizada com sucesso!');
          setEditModalIsOpen(false);
          setMachines(machines.map((machine) => (machine.id === currentMachine.id ? currentMachine : machine)));
        }
      } catch (error) {
        console.error('Erro ao atualizar máquina:', error);
        toast.error('Erro ao atualizar máquina.');
      }
    }
  };

  const handleDelete = async (machineId: number) => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axios.delete(`https://edgeautomacao-4-0.onrender.com/api/machines/${machineId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 204) {
        toast.success('Máquina deletada com sucesso!');
        setMachines(machines.filter((machine) => machine.id !== machineId));
      }
    } catch (error) {
      console.error('Erro ao deletar máquina:', error);
      toast.error('Erro ao deletar máquina.');
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd-MM-yyyy HH:mm:ss');
  };

  return (
    <div className="machine-list">
      <h2>Máquinas</h2>
      <button onClick={handleAddMachine}>Adicionar Máquina</button>
      <ul>
        {machines.map((machine) => (
          <li key={machine.id}>
            <p><strong>Nome:</strong> {machine.name}</p>
            <p><strong>Descrição:</strong> {machine.descricao}</p>
            <p><strong>Seção:</strong> {sections.find(section => section.id === machine.section_id)?.name}</p>
            <p><strong>Criado em:</strong> {formatDateTime(machine.created_at)}</p>
            <p><strong>Atualizado em:</strong> {formatDateTime(machine.updated_at)}</p>
            <p><strong>Modo de Contagem:</strong> {machine.modo_contagem}</p>
            <p><strong>Número de Patrimônio:</strong> {machine.asset_number}</p>
            <p><strong>Tempo de Parada:</strong> {machine.time_to_stop}</p>
            <p><strong>Meta de Produção:</strong> {machine.meta_producao_hora}</p>
            <button onClick={() => openEditModal(machine)}>Editar</button>
            <button onClick={() => handleDelete(machine.id)}>Deletar</button>
          </li>
        ))}
      </ul>
      <Modal
        isOpen={editModalIsOpen}
        onRequestClose={closeEditModal}
        contentLabel="Editar Máquina"
      >
        {currentMachine && (
          <div>
            <h2>Editar Máquina</h2>
            <form>
              <div>
                <label>Nome da Máquina:</label>
                <input
                  type="text"
                  name="name"
                  value={currentMachine.name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label>Descrição:</label>
                <input
                  type="text"
                  name="descricao"
                  value={currentMachine.descricao}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label>Selecione o Setor:</label>
                <select name="section_id" value={currentMachine.section_id} onChange={handleEditChange}>
                  <option value="">Selecione um Setor</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Tempo de Abertura de Parada (segundos):</label>
                <input
                  type="number"
                  name="time_to_stop"
                  value={currentMachine.time_to_stop || ''}
                  onChange={handleEditChange}
                />
              </div>
              <div>
                <label>Número de Patrimônio:</label>
                <input
                  type="text"
                  name="asset_number"
                  value={currentMachine.asset_number || ''}
                  onChange={handleEditChange}
                />
              </div>
              <div>
                <label>Modo de Contagem:</label>
                <select name="modo_contagem" value={currentMachine.modo_contagem} onChange={handleEditChange}>
                  <option value="pecas">Contagem de peças</option>
                  <option value="m2">Contagem M2</option>
                  <option value="m3">Contagem M3</option>
                  <option value="tempo_ciclo">Contagem Tempo de ciclo</option>
                </select>
              </div>
              <div>
                <label>Meta de Produção/Hora:</label>
                <input
                  type="number"
                  name="meta_producao_hora"
                  value={currentMachine.meta_producao_hora || ''}
                  onChange={handleEditChange}
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

export default MachineList;




