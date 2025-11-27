// Configuration centralisée pour Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';

// Enregistrer les composants Chart.js globalement
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
  zoomPlugin
);

// Configuration par défaut pour les graphiques de monitoring
export const getDefaultMonitoringOptions = (
  unite: string,
  yMin: number,
  yMax: number
): ChartOptions<'line'> => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      position: 'nearest',
      backgroundColor: 'rgba(255, 255, 255, 0.75)',
      titleColor: '#000',
      bodyColor: '#000',
      borderColor: '#d6d6d6',
      borderWidth: 1,
      padding: 8,
      displayColors: false,
      callbacks: {
        title: (items: TooltipItem<'line'>[]) => {
          const date = new Date(items[0].label);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        },
        label: (item: TooltipItem<'line'>) => {
          return `${Number(item.parsed.y).toFixed(2)}${unite}`;
        },
      },
    },
  },
  scales: {
    x: {
      type: 'category',
      grid: {
        display: false,
      },
      ticks: {
        autoSkip: true,
        maxRotation: 90,
        minRotation: 90,
        padding: 5,
      },
    },
    y: {
      type: 'linear',
      min: yMin,
      max: yMax,
      display: false,
    },
  },
});

// Configuration pour les graphiques fullscreen avec zoom
export const getFullScreenOptions = (
  unite: string,
  yMin: number,
  yMax: number,
  consigneInf?: number,
  consigneSup?: number,
  enableZoom: boolean = true
): ChartOptions<'line'> => {
  const baseOptions = getDefaultMonitoringOptions(unite, yMin, yMax);
  
  return {
    ...baseOptions,
    scales: {
      ...baseOptions.scales,
      y: {
        ...baseOptions.scales?.y,
        display: true,
        ticks: {
          callback: (value) => `${value}${unite}`,
        },
      },
    },
    plugins: {
      ...baseOptions.plugins,
      zoom: enableZoom ? {
        limits: {
          x: { min: 'original', max: 'original' },
          y: { min: yMin, max: yMax },
        },
        pan: {
          enabled: true,
          mode: 'x',
          modifierKey: 'shift',
        },
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1,
          },
          drag: {
            enabled: true,
            backgroundColor: 'rgba(255, 189, 80, 0.2)',
            borderColor: 'rgba(255, 189, 80, 0.8)',
            borderWidth: 2,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
      } : undefined,
      annotation: {
        annotations: {
          ...(consigneInf !== undefined && {
            consigneInf: {
              type: 'line',
              yMin: consigneInf,
              yMax: consigneInf,
              borderColor: 'red',
              borderWidth: 2,
              borderDash: [3, 4],
              label: {
                display: true,
                content: `${consigneInf}${unite}`,
                position: 'start',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                color: 'red',
                padding: 4,
              },
            },
          }),
          ...(consigneSup !== undefined && {
            consigneSup: {
              type: 'line',
              yMin: consigneSup,
              yMax: consigneSup,
              borderColor: 'red',
              borderWidth: 2,
              borderDash: [3, 4],
              label: {
                display: true,
                content: `${consigneSup}${unite}`,
                position: 'start',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                color: 'red',
                padding: 4,
              },
            },
          }),
        },
      },
    },
  };
};

export default ChartJS;
