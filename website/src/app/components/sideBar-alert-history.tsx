'use client'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { useState } from "react";
import {fromDate} from "@internationalized/date";
import AlertHistoryCell from "./alerthistoryCell";

const rows = [
    {
      key: "1",
      startDate:"2025-03-10 11:35:54.302",
      endDate:"2025-03-10 12:35:54.302",
      alert: "Consigne haute dépassé",
      areaOrline: "area"
    },
    {
      key: "2",
      startDate:"2025-03-10T11:53:59.278Z",
      endDate:"2025-03-12T14:11:56.705Z",
      alert: "Désactivation de l'alarme",
      areaOrline: "area"
    },
    {
      key: "3",
      startDate:"2025-03-10T10:18:59.296Z",
      endDate:"",
      alert: "Changement de consigne haute (22°C -> 25°C)",
      areaOrline: "line"
    },
    {
      key: "4",
      startDate:"2025-02-20 12:07:15.132",
      endDate:"",
      alert: "Changement de consigne basse (12°C -> 15°C)",
      areaOrline: "line"
    },
  ];
  
  const columns = [
    {
      key: "alert",
      label: "Alert",
    }
  ];
  


import { Selection } from "@react-types/shared";

export default function SideBarAlertHistoric(this: any, { idLieu, isHistorySizeLocked, setHistorySizeLocked, eventHistory, setEventHistory } : {
    idLieu:number,
    isHistorySizeLocked:boolean,
    setHistorySizeLocked:Function,
    eventHistory:object,
    setEventHistory:Function
}){

    const [isDataLoaded, setDataLoaded] = useState<boolean>(false);
    // console.log(Date.parse(""))
    // console.log(isNaN(Date.parse(""))?'':fromDate(new Date(Date.parse("2025-02-20 12:07:07.132")), 'CET'))
    // console.log(fromDate(new Date(Date.parse("")), 'CET'))

    // useEffect(()=>{

    //     console.log(eventHistory)

    // }, [eventHistory])

    function onTableSelect(key:Selection){
        const selectedKey = Array.from(key)[0];
        // console.log(selectedKey)
        var res = rows.filter(obj=>{
            // console.log(res)
            return obj.key === selectedKey
        })
        setEventHistory(res);
    }


    return (
        <div className={`h-full gaps-3 flex flex-col ${isHistorySizeLocked?'w-[25%] min-w-60': 'w-[1%] min-w-10'} ${isHistorySizeLocked?'bg-rsed-300': 'bg-bslue-300'} right-1/2 hover:min-dw-60 hovedr:w-[25%]  transition-all`}>
            <div className="font-black text-2xl text-black align-midsdle items-centser m-2 ml-0 overflow-hidden">
                Évènements
            </div>
            <div className="h-full">
                <Table 
                    hideHeader 
                    classNames={{
                        base:"h-full ",
                        wrapper:"h-full p-0  ",
                        table:"border-separate border-spacing-y-4 border-spacing-x-2",
                        tbody:" gap-5",
                        th:"",
                        tr:" gap-5",
                        td:" gap-5",
                        tfoot:"",
                        thead:"",
                    }}
                    selectionMode="single"
                    maxTableHeight={600}
                    onSelectionChange={onTableSelect}
                >
                    <TableHeader columns={columns}>
                        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                    </TableHeader>
                    <TableBody items={rows}>
                        {(item) => (
                        <TableRow key={item.key}>
                            {(columnKey) => <TableCell>
                                                <AlertHistoryCell 
                                                    _alert={item.alert} 
                                                    _startDate={isNaN(Date.parse(item.startDate))?'':fromDate(new Date(Date.parse(item.startDate)), 'CET')} 
                                                    _endDate={isNaN(Date.parse(item.endDate))?'':fromDate(new Date(Date.parse(item.endDate)), 'CET')} 
                                                    _areaOrLine={isNaN(Date.parse(item.endDate))?'line':'area'} 
                                                />
                                            </TableCell>}
                        </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
        </div>
    );
}

