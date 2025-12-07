'use client'
import { Skeleton } from "@heroui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { FaRegSnowflake } from "react-icons/fa";
import { TiHomeOutline } from "react-icons/ti";
import { CgSmartHomeRefrigerator } from "react-icons/cg";
import { TbWashTemperature1 } from "react-icons/tb";
import { PiOven, PiThermometerHotFill } from "react-icons/pi";
import { IoSettingsOutline, IoInformationCircleOutline } from "react-icons/io5";
import MonitoringModal from "./monitoring-modal";

interface type_Data {
    id: string;
    Valeur: number;
    Unite: string;
    DateHeureMesure: string;
    DateHeureMesureXaxis: string;
    Consigne_Sup: number;
    Consigne_Inf: number;
}

export default function MonitoringCard({ idLieu, NomLieu, SondeNumeroSerie } : {
    idLieu: string,
    NomLieu: string,
    SondeNumeroSerie?: string,
}){
    const [data, setData] = useState<type_Data[]>([]);
    const [isDataLoaded, setDataLoaded] = useState<boolean>(false);
    const [consigneSup, setconsigneSup] = useState<number>();
    const [consigneInf, setconsigneInf] = useState<number>();
    const [unite, setUnite] = useState<string>("");
    const [typeLieu, setTypeLieu] = useState<string>("");
    const [YaxisMin, setYaxisMin] = useState<number>(0);
    const [YaxisMax, setYaxisMax] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    useEffect(() => {
        setTypeLieu("")
        axios.get('/api/lieux/type/'+idLieu)
        .then((res_api) => {
            if (res_api.data.length > 0){
                setTypeLieu(res_api.data[0].nom_type_lieu)
            }
        })

        // Récupérer 125 dernières mesures pour le mini-graphique
        axios.get('/api/mesures/'+idLieu, {
            params: {
                rowNumber: 125
            }
        })
        .then(response => {
            if (Array.isArray(response.data) && response.data.length > 0) {
                setData(response.data.reverse());
                
                var tmp_Ymin = response.data[0].Valeur;
                var tmp_Ymax = response.data[0].Valeur;
                
                for(let mesure of response.data){
                    if (mesure.Valeur > tmp_Ymax) tmp_Ymax = mesure.Valeur;
                    if (mesure.Valeur < tmp_Ymin) tmp_Ymin = mesure.Valeur;
                }

                setconsigneSup(response.data[0].Consigne_Sup);
                setconsigneInf(response.data[0].Consigne_Inf);
                setUnite(response.data[0].Unite);

                let chart_minimum = (tmp_Ymin < response.data[0].Consigne_Inf) ? tmp_Ymin : response.data[0].Consigne_Inf;
                let chart_maximum = (tmp_Ymax > response.data[0].Consigne_Sup) ? tmp_Ymax : response.data[0].Consigne_Sup;
                setYaxisMax(Math.ceil(chart_maximum + (0.25 * (chart_maximum - chart_minimum))));
                setYaxisMin(Math.floor(chart_minimum - (0.6 * (chart_maximum - chart_minimum))));
            }

            setTimeout(() => { setDataLoaded(true); }, 500);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
    }, [idLieu]);

    const getIconForType = () => {
        switch(typeLieu) {
            case "AMBIANCE": return <TiHomeOutline size={24} title="Ambiance"/>;
            case "RÉFRIGÉRATEUR_CONGÉLATEUR": return <CgSmartHomeRefrigerator size={24} title="Réfrigérateur/Congélateur"/>;
            case "ÉTUVE_ENCEINTE_CLIMATIQUE": return <PiThermometerHotFill size={24} title="Étuve/Enceinte climatique"/>;
            case "CHAMBRE_FROIDE": return <FaRegSnowflake size={22} title="Chambre froide"/>;
            case "BAIN_MARIE_CUVE": return <TbWashTemperature1 size={24} title="Bain marie/Cuve"/>;
            case "FOUR": return <PiOven size={24} title="Four"/>;
            default: return null;
        }
    };

    return (
        <>
            <div className="relative bg-white rounded-lg w-full subpixel-antialiased transition hover:shadow-[0px_5px_15px_0px_rgba(33,33,33,0.2)] hover:scale-[101%] transform outline-1 outline outline-[#d6d6d6] border-solid border-[#d6d6d6]">
                {isDataLoaded ? (
                    <>
                        {/* Header avec nom du lieu */}
                        <div className="px-4 py-3 flex justify-between items-center border-b border-gray-200">
                            <div className="text-[#2a2a2a] font-bold grow subpixel-antialiased">
                                {NomLieu}
                            </div>
                            <div className="flex items-center justify-center">
                                {getIconForType()}
                            </div>
                        </div>

                        {/* Zone du graphique - cliquable */}
                        <div 
                            onClick={() => setIsModalOpen(true)}
                            className="relative px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <ResponsiveContainer width="100%" height={180}>
                                <AreaChart data={data} margin={{ top: 10, left: 0, right: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id={`colorUv-${idLieu}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#FFBD50" stopOpacity={0.3}/>
                                            <stop offset="100%" stopColor="#FFBD50" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="DateHeureMesure" hide />
                                    <YAxis hide domain={[YaxisMin, YaxisMax]} />
                                    <CartesianGrid strokeDasharray="5 5" horizontal={false} vertical={false} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="Valeur" 
                                        stroke="#FFBD50" 
                                        strokeWidth={2} 
                                        fillOpacity={1} 
                                        fill={`url(#colorUv-${idLieu})`}
                                        isAnimationActive={false}
                                    />
                                    <ReferenceLine y={consigneInf} stroke="#ef4444" strokeDasharray="3 4" />
                                    <ReferenceLine y={consigneSup} stroke="#ef4444" strokeDasharray="3 4" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Footer avec infos sonde */}
                        <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <IoInformationCircleOutline size={16} />
                                <span>Sonde: {SondeNumeroSerie || 'N/A'}</span>
                                {data.length > 0 && (
                                    <span className="ml-auto">
                                        Dernière mesure: {data[data.length - 1]?.Valeur}{unite}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 4 icônes dans les coins - Placeholders */}
                        <button
                            onClick={(e) => { e.stopPropagation(); console.log('Top-left icon clicked'); }}
                            className="absolute top-2 left-2 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all hover:scale-110 z-10"
                            title="Action 1"
                        >
                            <IoSettingsOutline size={18} className="text-gray-600" />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); console.log('Top-right icon clicked'); }}
                            className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all hover:scale-110 z-10"
                            title="Action 2"
                        >
                            <IoSettingsOutline size={18} className="text-gray-600" />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); console.log('Bottom-left icon clicked'); }}
                            className="absolute bottom-16 left-2 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all hover:scale-110 z-10"
                            title="Infos sonde"
                        >
                            <IoInformationCircleOutline size={18} className="text-gray-600" />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); console.log('Bottom-right icon clicked'); }}
                            className="absolute bottom-16 right-2 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all hover:scale-110 z-10"
                            title="Action 4"
                        >
                            <IoSettingsOutline size={18} className="text-gray-600" />
                        </button>
                    </>
                ) : (
                    <Skeleton className="rounded-lg h-[300px]">
                        <div className="h-full rounded-lg bg-default-300"></div>
                    </Skeleton>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <MonitoringModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    idLieu={idLieu}
                    NomLieu={NomLieu}
                    SondeNumeroSerie={SondeNumeroSerie}
                    unite={unite}
                    consigneSup={consigneSup}
                    consigneInf={consigneInf}
                />
            )}
        </>
    );
}
