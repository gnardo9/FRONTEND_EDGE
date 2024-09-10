import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface APISettings {
  api_url: string;
  access_token: string;
  secret_access_token: string;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<APISettings | null>(null);
  const [apiUrl, setApiUrl] = useState('');
  const [accessToken, setAccessToken] = useState('********');
  const [secretAccessToken, setSecretAccessToken] = useState('********');

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem('accessToken');
      try {
        const response = await axios.get('https://edgeautomacao-4-0.onrender.com/api/settings/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Resposta da API:', response.data);
        setSettings(response.data);
        setApiUrl(response.data.api_url);
      } catch (error) {
        console.error('Erro ao buscar configurações:', error);
        toast.error('Erro ao buscar configurações.');
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem('accessToken');
    const data: APISettings = {
      api_url: apiUrl,
      access_token: accessToken !== '********' ? accessToken : (settings?.access_token || ''),
      secret_access_token: secretAccessToken !== '********' ? secretAccessToken : (settings?.secret_access_token || ''),
    };

    try {
      if (settings) {
        await axios.put('https://edgeautomacao-4-0.onrender.com/api/settings/', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Configurações atualizadas com sucesso!');
      } else {
        await axios.post('https://edgeautomacao-4-0.onrender.com/api/settings/', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Configurações salvas com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações.');
    }
  };

  return (
    <div>
      <h1>Configurações da API</h1>
      <form>
        <div>
          <label htmlFor="api_url">URL da API:</label>
          <input
            type="text"
            id="api_url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="access_token">Access Token:</label>
          <input
            type="password"
            id="access_token"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="secret_access_token">Secret Access Token:</label>
          <input
            type="password"
            id="secret_access_token"
            value={secretAccessToken}
            onChange={(e) => setSecretAccessToken(e.target.value)}
          />
        </div>
        <button type="button" onClick={handleSave}>Salvar</button>
      </form>
    </div>
  );
};

export default SettingsPage;
