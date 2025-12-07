'use client'
import { Modal, ModalContent, ModalHeader, ModalBody, Tabs, Tab, Button, DateRangePicker, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination } from "@heroui/react";
import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { customActiveDotGraph } from "./customActiveDotGraph";
import CustomTooltip from "./customTooltipGraph";
import { RxReset } from "react-icons/rx";
import { parseDate } from "@internationalized/date";

interface type_Data {
    id: string;
    Valeur: number;
    Unite: string;
    DateHeureMesure: string;
    DateHeureMesureXaxis: string;
    Consigne_Sup: number;
    Consigne_Inf: number;
}

type CategoricalChartState = any;

export default function MonitoringModal({ 
    isOpen, 
    onClose, 
    idLieu, 
    NomLieu,
    SondeNumeroSerie,
    unite,
    consigneSup,
    consigneInf
}: {
    isOpen: boolean;
    onClose: () => void;
    idLieu: string;
    NomLieu: string;
    SondeNumeroSerie?: string;
    unite?: string;
    consigneSup?: number;
    consigneInf?: number;
}) {
    const [data, setData] = useState<type_Data[]>([]);
    const [isDataLoaded, setDataLoaded] = useState<boolean>(false);
    const [YaxisMin, setYaxisMin] = useState<number>(0);
    const [YaxisMax, setYaxisMax] = useState<number>(0);
    const [selectedTab, setSelectedTab] = useState<string>("graph");
    
    // Date range
    const [dateRange, setDateRange] = useState<any>(null);
    
    // Pagination pour le tableau
    const [page, setPage] = useState(1);
    const rowsPerPage = 20;
    
    // Zoom state
    const [zoomState, setZoomState] = useState<{
        refAreaLeft: string;
        refAreaRight: string;
    }>({
        refAreaLeft: '',
        refAreaRight: ''
    });

    const [displayData, setDisplayData] = useState<type_Data[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, dateRange]);

    const fetchData = () => {
        setDataLoaded(false);
        
        const params: any = {
            rowNumber: 1000 // Par défaut, récupérer beaucoup de données
        };

        // Si un range de dates est sélectionné
        if (dateRange?.start && dateRange?.end) {
            params.startDate = new Date(dateRange.start.year, dateRange.start.month - 1, dateRange.start.day).toISOString();
            params.endDate = new Date(dateRange.end.year, dateRange.end.month - 1, dateRange.end.day, 23, 59, 59).toISOString();
        }

        axios.get('/api/mesures/' + idLieu, { params })
            .then(response => {
                if (Array.isArray(response.data) && response.data.length > 0) {
                    const reversedData = response.data.reverse();
                    setData(reversedData);
                    setDisplayData(reversedData);
                    
                    // Calculer les limites Y
                    var tmp_Ymin = reversedData[0].Valeur;
                    var tmp_Ymax = reversedData[0].Valeur;
                    
                    for(let mesure of reversedData){
                        if (mesure.Valeur > tmp_Ymax) tmp_Ymax = mesure.Valeur;
                        if (mesure.Valeur < tmp_Ymin) tmp_Ymin = mesure.Valeur;
                    }

                    const consSup = consigneSup ?? reversedData[0].Consigne_Sup;
                    const consInf = consigneInf ?? reversedData[0].Consigne_Inf;

                    let chart_minimum = (tmp_Ymin < consInf) ? tmp_Ymin : consInf;
                    let chart_maximum = (tmp_Ymax > consSup) ? tmp_Ymax : consSup;
                    setYaxisMax(Math.ceil(chart_maximum + (0.25 * (chart_maximum - chart_minimum))));
                    setYaxisMin(Math.floor(chart_minimum - (0.6 * (chart_maximum - chart_minimum))));
                }
                setDataLoaded(true);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                setDataLoaded(true);
            });
    };

    // Gestion du zoom
    const zoom = () => {
        let { refAreaLeft, refAreaRight } = zoomState;

        if (refAreaLeft === refAreaRight || refAreaRight === '') {
            setZoomState({
                refAreaLeft: '',
                refAreaRight: ''
            });
            return;
        }

        // S'assurer que left < right
        if (refAreaLeft > refAreaRight) {
            [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];
        }

        // Filtrer les données dans la zone sélectionnée
        const filteredData = data.filter((item) => {
            const date = new Date(item.DateHeureMesure).getTime();
            const left = new Date(refAreaLeft).getTime();
            const right = new Date(refAreaRight).getTime();
            return date >= left && date <= right;
        });

        if (filteredData.length > 0) {
            setDisplayData(filteredData);
            
            // Recalculer les limites Y pour le zoom
            var tmp_Ymin = filteredData[0].Valeur;
            var tmp_Ymax = filteredData[0].Valeur;
            
            for(let mesure of filteredData){
                if (mesure.Valeur > tmp_Ymax) tmp_Ymax = mesure.Valeur;
                if (mesure.Valeur < tmp_Ymin) tmp_Ymin = mesure.Valeur;
            }

            const consSup = consigneSup ?? filteredData[0].Consigne_Sup;
            const consInf = consigneInf ?? filteredData[0].Consigne_Inf;

            let chart_minimum = (tmp_Ymin < consInf) ? tmp_Ymin : consInf;
            let chart_maximum = (tmp_Ymax > consSup) ? tmp_Ymax : consSup;
            setYaxisMax(Math.ceil(chart_maximum + (0.25 * (chart_maximum - chart_minimum))));
            setYaxisMin(Math.floor(chart_minimum - (0.6 * (chart_maximum - chart_minimum))));
        }

        setZoomState({
            refAreaLeft: '',
            refAreaRight: ''
        });
    };

    const resetZoom = () => {
        setDisplayData(data);
        setZoomState({
            refAreaLeft: '',
            refAreaRight: ''
        });
        
        // Recalculer les limites Y originales
        if (data.length > 0) {
            var tmp_Ymin = data[0].Valeur;
            var tmp_Ymax = data[0].Valeur;
            
            for(let mesure of data){
                if (mesure.Valeur > tmp_Ymax) tmp_Ymax = mesure.Valeur;
                if (mesure.Valeur < tmp_Ymin) tmp_Ymin = mesure.Valeur;
            }

            const consSup = consigneSup ?? data[0].Consigne_Sup;
            const consInf = consigneInf ?? data[0].Consigne_Inf;

            let chart_minimum = (tmp_Ymin < consInf) ? tmp_Ymin : consInf;
            let chart_maximum = (tmp_Ymax > consSup) ? tmp_Ymax : consSup;
            setYaxisMax(Math.ceil(chart_maximum + (0.25 * (chart_maximum - chart_minimum))));
            setYaxisMin(Math.floor(chart_minimum - (0.6 * (chart_maximum - chart_minimum))));
        }
    };

    // Données paginées pour le tableau
    const paginatedData = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return data.slice(start, end);
    }, [data, page]);

    const pages = Math.ceil(data.length / rowsPerPage);

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
            size="5xl"
            scrollBehavior="inside"
            classNames={{
                base: "max-h-[90vh]",
                body: "p-6"
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold">{NomLieu}</h2>
                            <div className="text-sm text-gray-500 font-normal">
                                Sonde: {SondeNumeroSerie || 'N/A'}
                                {data.length > 0 && ` • ${data.length} mesures`}
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            {/* Date Range Picker */}
                            <div className="mb-4 flex gap-4 items-center">
                                <DateRangePicker
                                    label="Période"
                                    className="max-w-xs"
                                    value={dateRange}
                                    onChange={setDateRange}
                                />
                                {dateRange && (
                                    <Button
                                        size="sm"
                                        color="default"
                                        variant="flat"
                                        onPress={() => setDateRange(null)}
                                    >
                                        Réinitialiser
                                    </Button>
                                )}
                            </div>

                            {/* Tabs */}
                            <Tabs
                                selectedKey={selectedTab}
                                onSelectionChange={(key) => setSelectedTab(key as string)}
                                aria-label="Options"
                                color="primary"
                                variant="underlined"
                                classNames={{
                                    tabList: "gap-6",
                                    cursor: "w-full bg-primary",
                                    tab: "max-w-fit px-0 h-12",
                                }}
                            >
                                {/* Onglet Graphique */}
                                <Tab key="graph" title="Graphique">
                                    <div className="py-4">
                                        {isDataLoaded && displayData.length > 0 ? (
                                            <>
                                                <div className="flex justify-end mb-2">
                                                    <Button
                                                        size="sm"
                                                        color="default"
                                                        variant="flat"
                                                        startContent={<RxReset />}
                                                        onPress={resetZoom}
                                                    >
                                                        Réinitialiser le zoom
                                                    </Button>
                                                </div>
                                                <ResponsiveContainer width="100%" height={500}>
                                                    <AreaChart 
                                                        data={displayData} 
                                                        margin={{ top: 10, right: 80, left: 0, bottom: 60 }}
                                                        onMouseDown={(e: CategoricalChartState) => {
                                                            if (e && e.activeLabel) {
                                                                setZoomState({ ...zoomState, refAreaLeft: String(e.activeLabel) });
                                                            }
                                                        }}
                                                        onMouseMove={(e: CategoricalChartState) => {
                                                            if (zoomState.refAreaLeft && e && e.activeLabel) {
                                                                setZoomState({ ...zoomState, refAreaRight: String(e.activeLabel) });
                                                            }
                                                        }}
                                                        onMouseUp={zoom}
                                                    >
                                                        <defs>
                                                            <linearGradient id="colorUvModal" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#FFBD50" stopOpacity={0.3}/>
                                                                <stop offset="100%" stopColor="#FFBD50" stopOpacity={0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <XAxis 
                                                            dataKey="DateHeureMesure" 
                                                            angle={-45}
                                                            textAnchor="end"
                                                            height={80}
                                                            tickFormatter={(tick) => {
                                                                const date = new Date(tick);
                                                                return date.toLocaleString('fr-FR', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                });
                                                            }}
                                                            interval={Math.floor(displayData.length / 10)}
                                                        />
                                                        <YAxis 
                                                            domain={[YaxisMin, YaxisMax]}
                                                            label={{ value: unite || '', angle: -90, position: 'insideLeft' }}
                                                        />
                                                        <CartesianGrid strokeDasharray="5 5" />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Area 
                                                            type="monotone" 
                                                            dataKey="Valeur" 
                                                            stroke="#FFBD50" 
                                                            strokeWidth={2} 
                                                            fillOpacity={1} 
                                                            fill="url(#colorUvModal)"
                                                            activeDot={customActiveDotGraph}
                                                        />
                                                        <ReferenceLine 
                                                            y={consigneInf} 
                                                            label={{ value: `Consigne inf: ${consigneInf}${unite}`, position: 'right' }}
                                                            stroke="#ef4444" 
                                                            strokeDasharray="3 4"
                                                        />
                                                        <ReferenceLine 
                                                            y={consigneSup} 
                                                            label={{ value: `Consigne sup: ${consigneSup}${unite}`, position: 'right' }}
                                                            stroke="#ef4444" 
                                                            strokeDasharray="3 4"
                                                        />
                                                        {zoomState.refAreaLeft && zoomState.refAreaRight && (
                                                            <ReferenceArea
                                                                x1={zoomState.refAreaLeft}
                                                                x2={zoomState.refAreaRight}
                                                                strokeOpacity={0.3}
                                                                fill="#8884d8"
                                                                fillOpacity={0.3}
                                                            />
                                                        )}
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center h-[500px]">
                                                <p className="text-gray-500">Chargement des données...</p>
                                            </div>
                                        )}
                                    </div>
                                </Tab>

                                {/* Onglet Tableau */}
                                <Tab key="table" title="Tableau des mesures">
                                    <div className="py-4">
                                        {data.length > 0 ? (
                                            <>
                                                <Table 
                                                    aria-label="Tableau des mesures"
                                                    bottomContent={
                                                        pages > 1 && (
                                                            <div className="flex w-full justify-center">
                                                                <Pagination
                                                                    isCompact
                                                                    showControls
                                                                    showShadow
                                                                    color="primary"
                                                                    page={page}
                                                                    total={pages}
                                                                    onChange={setPage}
                                                                />
                                                            </div>
                                                        )
                                                    }
                                                >
                                                    <TableHeader>
                                                        <TableColumn>DATE/HEURE</TableColumn>
                                                        <TableColumn>VALEUR</TableColumn>
                                                        <TableColumn>CONSIGNE INF</TableColumn>
                                                        <TableColumn>CONSIGNE SUP</TableColumn>
                                                        <TableColumn>STATUT</TableColumn>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {paginatedData.map((item, index) => {
                                                            const isOutOfRange = item.Valeur < item.Consigne_Inf || item.Valeur > item.Consigne_Sup;
                                                            return (
                                                                <TableRow key={index}>
                                                                    <TableCell>{formatDateTime(item.DateHeureMesure)}</TableCell>
                                                                    <TableCell className={isOutOfRange ? 'text-red-500 font-semibold' : ''}>
                                                                        {item.Valeur}{item.Unite}
                                                                    </TableCell>
                                                                    <TableCell>{item.Consigne_Inf}{item.Unite}</TableCell>
                                                                    <TableCell>{item.Consigne_Sup}{item.Unite}</TableCell>
                                                                    <TableCell>
                                                                        {isOutOfRange ? (
                                                                            <span className="text-red-500">⚠️ Hors limites</span>
                                                                        ) : (
                                                                            <span className="text-green-500">✓ OK</span>
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center h-[400px]">
                                                <p className="text-gray-500">Aucune donnée disponible</p>
                                            </div>
                                        )}
                                    </div>
                                </Tab>
                            </Tabs>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
