import { TooltipProps } from 'recharts';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
}

export default function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    // console.log(payload)
    return (
      <div className="custom-tooltip font-mono text-base bg-white/75">
        <p className="label relative text-opacity-100">{`${(new Date(payload[0].payload.DateHeureMesure).getHours()<10)?'0':''}${new Date(payload[0].payload.DateHeureMesure).getHours()}:${(new Date(payload[0].payload.DateHeureMesure).getMinutes()<10)?'0':''}${new Date(payload[0].payload.DateHeureMesure).getMinutes()} ${Number(payload[0].value).toFixed(2)}${payload[0].payload.Unite}`}</p>
      </div>
    );
  }

  return null;
};