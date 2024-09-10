import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddMachineForm: React.FC = () => {
  const [name, setName] = useState('');
  const [descricao, setDescricao] = useState('');
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [sections, setSections] = useState<{ id: number; name: string }[]>([]);
  const [timetostop, setTimetostop] = useState('');
  const [assetNumber, setAssetNumber] = useState('');
  const [modoContagem, setModoContagem] = useState('pecas');
  const [metaProducao, setMetaProducao] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
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

    fetchSections();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');

    try {
      const response = await axios.post(
        'https://edgeautomacao-4-0.onrender.com/api/machines/',
        { name, descricao, section: sectionId, time_to_stop: timetostop, asset_number: assetNumber, modo_contagem: modoContagem, meta_producao_hora: metaProducao },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success('Máquina criada com sucesso!');
        navigate('/machines');
      }
    } catch (error) {
      console.error('Erro ao criar máquina:', error);
      toast.error('Erro ao criar máquina.');
    }
  };

  return (
    <div>
      <h2>Adicionar Máquina</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome da Máquina:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Descrição:</label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Selecione o Setor:</label>
          <select value={sectionId || ''} onChange={(e) => setSectionId(e.target.value)}>
            <option value="">Selecione um Setor</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Tempo de Abertura de Parada:</label>
          <input
            type="text"
            value={timetostop}
            onChange={(e) => setTimetostop(e.target.value)}
            placeholder="segundos"
          />
        </div>
        <div>
          <label>Número de Patrimônio:</label>
          <input
            type="text"
            value={assetNumber}
            onChange={(e) => setAssetNumber(e.target.value)}
          />
        </div>
        <div>
          <label>Modo de Contagem:</label>
          <select value={modoContagem} onChange={(e) => setModoContagem(e.target.value)}>
            <option value="pecas">Contagem de peças</option>
            <option value="m2">Contagem M2</option>
            <option value="m3">Contagem M3</option>
            <option value="tempo_ciclo">Contagem Tempo de ciclo</option>
          </select>
        </div>
        <div>
          <label>Meta de Produção/Hora:</label>
          <input
            type="text"
            value={metaProducao}
            onChange={(e) => setMetaProducao(e.target.value)}
          />
        </div>
        <button type="submit">Adicionar</button>
      </form>
    </div>
  );
};

export default AddMachineForm;

