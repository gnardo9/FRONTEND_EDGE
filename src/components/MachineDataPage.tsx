import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Autosuggest from "react-autosuggest";
import { Pie } from "react-chartjs-2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "chart.js/auto";
import "@/styles/MachineDataPage.scss";

interface MachineData {
  tempo_ativo: string | null;
  tempo_inativo: string | null;
  hora_inicio: string;
  hora_fim: string;
  status_maquina: boolean;
  timestamp: string;
  stopping_reason: number | null;
  machine_id: number;
  machine_name: string;
}

interface ProductionOrder {
  id: number;
  name: string;
  quantity: number;
  codigo_interno: string;
}

const MachineDataPage: React.FC = () => {
  const [status, setStatus] = useState<boolean | null>(null);
  const [totalActiveTime, setTotalActiveTime] = useState<number>(0);
  const [totalInactiveTime, setTotalInactiveTime] = useState<number>(0);
  const [paradaDesde, setParadaDesde] = useState<string | null>(null);
  const [produzindoDesde, setProduzindoDesde] = useState<string | null>(null);
  const [tempoInativoAoVivo, setTempoInativoAoVivo] = useState<number>(0);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const [isProducing, setIsProducing] = useState<boolean>(false);
  const [contagemProducao, setContagemProducao] = useState<number>(0);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [refugos, setRefugos] = useState<number>(0);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [suggestions, setSuggestions] = useState<ProductionOrder[]>([]);
  const [orderQuery, setOrderQuery] = useState<string>("");

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get("https://edgeautomacao-4-0.onrender.com/api/csrf-token/");
        setCsrfToken(response.data.csrfToken);
        console.log("CSRF token fetched:", response.data.csrfToken);
      } catch (error) {
        console.error("Erro ao buscar token CSRF:", error);
        toast.error("Erro ao buscar token CSRF");
      }
    };

    fetchCsrfToken();
  }, []);

  const fetchProductionOrders = async (query: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`https://edgeautomacao-4-0.onrender.com/api/production-orders/?query=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuggestions(response.data.results);
      console.log("Production orders fetched:", response.data.results);
    } catch (error) {
      console.error("Erro ao buscar ordens de produção:", error);
      toast.error("Erro ao buscar ordens de produção");
    }
  };

  useEffect(() => {
    fetchProductionOrders("");
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get("https://edgeautomacao-4-0.onrender.com/api/machine-data/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Machine data fetched:", response.data);

        if (Array.isArray(response.data)) {
          const latestData = response.data[response.data.length - 1];
          const statusData = latestData ? latestData.status_maquina : null;
          console.log("Latest status data:", statusData);

          let activeTime = 0;
          let inactiveTime = 0;
          let stopsCount = 0;

          response.data.forEach((item: MachineData) => {
            if (item.tempo_ativo) {
              activeTime += parseDuration(item.tempo_ativo);
            }
            if (item.tempo_inativo && item.stopping_reason !== null) {
              inactiveTime += parseDuration(item.tempo_inativo);
              stopsCount += 1;
            }
          });

          setTotalActiveTime(activeTime);
          setTotalInactiveTime(inactiveTime);

          if (statusData !== null) {
            if (statusData === false) {
              const horaFim = new Date(latestData.hora_fim).getTime();
              const now = Date.now();
              const elapsedTime = Math.floor((now - horaFim) / 1000);
              setParadaDesde(latestData.hora_fim);
              setTempoInativoAoVivo(elapsedTime);
              setProduzindoDesde(null);

              if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
              }
              intervalIdRef.current = setInterval(() => {
                setTempoInativoAoVivo((prev) => prev + 1);
              }, 1000);
            } else if (statusData === true) {
              setProduzindoDesde(latestData.hora_inicio);
              setParadaDesde(null);

              if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
              }
              setTempoInativoAoVivo(0);
            }
          }
          setStatus(statusData);
        } else {
          console.error("Dados da resposta não são uma lista:", response.data);
          toast.error("Erro: Dados da resposta não são uma lista");
        }
      } catch (error) {
        console.error("Erro ao buscar dados da máquina:", error);
        toast.error("Erro ao buscar dados da máquina");
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => {
      clearInterval(interval);
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;

    const connectWebSocket = () => {
      wsRef.current = new WebSocket("ws://localhost:8001/ws/production-count/");

      wsRef.current.onopen = () => {
        console.log("WebSocket connection opened");
        reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      };

      wsRef.current.onmessage = (event) => {
        console.log("WebSocket message received:", event.data); // Log received message
        try {
          const data = JSON.parse(event.data);
          console.log("Parsed WebSocket data:", data);
          if (data.count !== undefined) {
            setContagemProducao(data.count); // Update the production count
          } else {
            console.warn("Received WebSocket message without 'count':", data);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error: ", error);
      };

      wsRef.current.onclose = (event) => {
        console.log("WebSocket connection closed:", event);
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          setTimeout(() => {
            console.log(`Attempting to reconnect... (${reconnectAttempts})`);
            connectWebSocket();
          }, 3000); // Attempt reconnection after 3 seconds
        } else {
          console.error("Max reconnection attempts reached.");
        }
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    console.log("Production count updated:", contagemProducao);
  }, [contagemProducao]);

  const parseDuration = (duration: string): number => {
    if (!duration) return 0;
    const parts = duration.split(":").map(Number);
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  };

  const formatDuration = (durationInSeconds: number): string => {
    const days = Math.floor(durationInSeconds / 86400);
    const hours = Math.floor((durationInSeconds % 86400) / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = Math.floor(durationInSeconds % 60);

    return `${String(days).padStart(2, "0")}:${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const startProduction = async () => {
    setIsProducing(true);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        "http://127.0.0.1:8000/api/production/start/",
        { machine_name: "Furadeira F400" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
          },
        }
      );
      toast.success("Produção iniciada!");
    } catch (error) {
      console.error("Erro ao iniciar produção:", error);
      toast.error("Erro ao iniciar produção.");
    }
  };

  const stopProduction = async () => {
    setIsProducing(false);
    setContagemProducao(contagemProducao);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        "http://127.0.0.1:8000/api/production/stop/",
        {
          machine_name: "Furadeira F400",
          contagem_producao: contagemProducao,
          refugos: 0, // Adicione o valor dos refugos conforme necessário
          hora_final_producao: new Date().toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
          },
        }
      );
      toast.success("Produção finalizada!");
      setContagemProducao(0); // Zera o campo de contagem de produção
    } catch (error) {
      console.error("Erro ao finalizar produção:", error);
      toast.error("Erro ao finalizar produção.");
    }
  };

  const updateRefugos = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.patch(
        "http://127.0.0.1:8000/api/production/update-refugos/",
        {
          machine_name: "Furadeira F400",
          refugos: refugos,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
          },
        }
      );
      setRefugos(0); // Zera o campo após apontar o refugo
      toast.success("Refugos atualizados!");
    } catch (error) {
      console.error("Erro ao atualizar refugos:", error);
      toast.error("Erro ao atualizar refugos.");
    }
  };

  const handleOrderSelection = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setContagemProducao(0); // Zera o campo de contagem de produção ao selecionar nova ordem
  };

  const onSuggestionsFetchRequested = async ({ value }: { value: string }) => {
    const token = localStorage.getItem("accessToken");
    try {
        const response = await axios.get<{ results: ProductionOrder[] }>(
            `http://127.0.0.1:8000/api/production-orders/?search=${value}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        setSuggestions(response.data.results); // 'results' é onde as ordens de produção estão armazenadas
    } catch (error) {
        console.error("Erro ao buscar ordens de produção:", error);
    }
};


  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion: ProductionOrder) => `${suggestion.name} - ${suggestion.codigo_interno}`;

  const renderSuggestion = (suggestion: ProductionOrder) => (
    <div>
      {suggestion.name} - {suggestion.codigo_interno}
    </div>
  );

  const inputProps = {
    placeholder: "Digite o nome ou código da ordem de produção",
    value: orderQuery,
    onChange: (_event: React.FormEvent<HTMLElement>, { newValue }: { newValue: string }) => {
      setOrderQuery(newValue);
    },
  };

  const chartData = {
    labels: ["Produzido", "A Produzir"],
    datasets: [
      {
        data: [contagemProducao, selectedOrder ? selectedOrder.quantity - contagemProducao : 0],
        backgroundColor: ["rgba(75,192,192,0.6)", "rgba(255,99,132,0.6)"],
        borderColor: ["rgba(75,192,192,1)", "rgba(255,99,132,1)"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="machine-data-page">
      <h2>Dados da Máquina</h2>
      <div className="status-section">
        <button className={`status-button ${status ? "producing" : "stopped"}`}>
          {status ? "Máquina Produzindo" : "Máquina Parada"}
        </button>
        <div className="status-info">
          {paradaDesde && (
            <div>
              <p>Máquina parada desde: {new Date(paradaDesde).toLocaleString()}</p>
              <p>Tempo de inatividade: {formatDuration(tempoInativoAoVivo)}</p>
            </div>
          )}
          {produzindoDesde && (
            <div>
              <p>Produzindo desde: {new Date(produzindoDesde).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
      <div className="display-section">
        <div className="display">
          <h3>Tempo Total Ativo</h3>
          <p>{formatDuration(totalActiveTime)}</p>
        </div>
        <div className="display">
          <h3>Tempo Total Inativo</h3>
          <p>{formatDuration(totalInactiveTime)}</p>
        </div>
      </div>
      <div className="order-info">
        {selectedOrder && (
          <h3>Quantidade: {selectedOrder.quantity} / Produzido: {contagemProducao}</h3>
        )}
      </div>
      <div className="chart-section">
        <h3>Progresso da Produção</h3>
        <Pie data={chartData} />
      </div>
      <div className="production-controls">
        <button onClick={startProduction} disabled={isProducing}>Iniciar Produção</button>
        <button onClick={stopProduction} disabled={!isProducing}>Finalizar Produção</button>
      </div>
      <div className="production-count">
        <h3>Contagem de Produção</h3>
        <p>{contagemProducao}</p>
      </div>
      <div className="refugos-section">
        <h3>Apontar Refugos</h3>
        <input
          type="number"
          value={refugos}
          onChange={(e) => setRefugos(Number(e.target.value))}
        />
        <button onClick={updateRefugos}>Atualizar Refugos</button>
      </div>
      <div className="order-select">
        <h3>Selecionar Ordem de Produção</h3>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          onSuggestionSelected={(_, { suggestion }) => handleOrderSelection(suggestion)}
          inputProps={inputProps}
        />
      </div>
    </div>
  );
};

export default MachineDataPage;







