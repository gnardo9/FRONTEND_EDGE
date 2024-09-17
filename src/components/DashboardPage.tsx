import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Necessário para o Chart.js funcionar corretamente
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/dashboardPage.scss'; 

interface MachineData {
    id: number;
    machine_name: string;
    status: boolean;
    production_count: number;
    hora_inicio_producao: string | null;
    hora_final_producao: string | null;
    section: number;
    company: number;
    user: number;
    stopping_reason: number | null;
    company_detail?: { id: number; razao_social: string };
    section_detail?: { id: number; name: string };
    user_detail?: { id: number; nome: string; email: string };
    stopping_reason_detail?: { id: number; name: string; description: string };
}

const DashboardPage: React.FC = () => {
  const [machineData, setMachineData] = useState<MachineData[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [timelineChartData, setTimelineChartData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('https://edgeautomacao-4-0.onrender.com/api/machine-data/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMachineData(response.data);

        // Prepare data for the production chart
        const chartLabels = response.data.map((item: MachineData) =>
          item.hora_inicio_producao ? new Date(item.hora_inicio_producao).toLocaleTimeString() : 'Data não disponível'
        );
          
        const chartProductionData = response.data.map((item: MachineData) => item.production_count);

        setChartData({
          labels: chartLabels,
          datasets: [
            {
              label: 'Número de Peças Produzidas',
              data: chartProductionData,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
            },
          ],
        });

        // Prepare data for the timeline chart (machine status)
        const timelineLabels = response.data.map((item: MachineData) => {
          return item.hora_inicio_producao ? new Date(item.hora_inicio_producao).toLocaleTimeString() : 'Data não disponível';
        });

        const timelineStatusData = response.data.map((item: MachineData) => {
          // Define colors based on status and stopping_reason
          if (!item.status) {
            return { x: new Date(item.hora_inicio_producao || '').toLocaleTimeString(), y: 0, color: 'red' }; // Machine stopped
          } else if (item.stopping_reason_detail?.name === 'Setup') {
            return { x: new Date(item.hora_inicio_producao || '').toLocaleTimeString(), y: 1, color: 'orange' }; // Setup
          } else {
            return { x: new Date(item.hora_inicio_producao || '').toLocaleTimeString(), y: 1, color: 'green' }; // Producing
          }
        });

        setTimelineChartData({
          labels: timelineLabels,
          datasets: [
            {
              label: 'Status da Máquina',
              data: timelineStatusData.map((item: any) => item.y),
              borderColor: timelineStatusData.map((item: any) => item.color),
              backgroundColor: 'rgba(0, 0, 0, 0)',
              borderWidth: 2,
              pointRadius: 0, // Remove os pontos
              fill: false,
              stepped: true, // Cria linhas "stepped"
            },
          ],
        });
      } catch (error) {
        toast.error('Erro ao buscar dados da produção.');
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-page">
      <Typography variant="h4" gutterBottom>
        Dashboard de Produção
      </Typography>

      <Grid container spacing={3}>
        {machineData.map((data) => (
          <Grid item xs={12} sm={6} md={4} key={data.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{data.machine_name}</Typography>
                <Typography>Empresa: {data.company_detail?.razao_social || 'Empresa não disponível'}</Typography>
                <Typography>Seção: {data.section_detail?.name || 'Seção não disponível'}</Typography>
                <Typography>
                  Início Produção: {data.hora_inicio_producao ? new Date(data.hora_inicio_producao).toLocaleString() : 'Data não disponível'}
                </Typography>
                <Typography>
                  Fim Produção: {data.hora_final_producao ? new Date(data.hora_final_producao).toLocaleString() : 'Data não disponível'}
                </Typography>
                <Typography>Número Produzido: {data.production_count}</Typography>
                <Typography>Operador: {data.user_detail?.nome || 'Operador não disponível'}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Gráfico de produção */}
      <div className="chart-container" style={{ marginTop: '30px' }}>
        {chartData ? (
          <Line
            data={chartData}
            options={{
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Hora de Produção',
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: 'Número de Peças',
                  },
                },
              },
            }}
          />
        ) : (
          <Typography>Carregando gráfico...</Typography>
        )}
      </div>

      {/* Gráfico de linha do tempo (status da máquina) */}
      <div className="chart-container" style={{ marginTop: '30px' }}>
        {timelineChartData ? (
          <Line
            data={timelineChartData}
            options={{
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Hora de Produção',
                  },
                },
                y: {
                  display: false, // Oculta o eixo Y, já que estamos usando apenas o tempo
                },
              },
            }}
          />
        ) : (
          <Typography>Carregando gráfico de linha do tempo...</Typography>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;


