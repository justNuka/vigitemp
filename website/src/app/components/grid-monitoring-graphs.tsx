'use client'
import React, { useLayoutEffect, useState } from "react";
import MonitoringGraph from "./monitoring-graph";
import axios from "axios";
import SearchBar from "./filter/searchFilters";
import GroupFilter from "./filter/groupFilter";
import Filter from "./filter/Filter";

interface Type_Lieu {
    IdLieu: string; // Assuming there's a unique ID property
    Nom_Lieu: string; // Update this based on your API response
    SondeNumeroSerie:string;
    IdGroupe1:number;
    IdGroupe2:number;
    // Add other properties if needed
}

interface Type_Group {
    IdGroupe: number; // Assuming there's a unique ID property
    NomGroupe: string; // Update this based on your API response,

    // Add other properties if needed
}






export default function GridMonitoringGraphs({ SideBar } : {
    SideBar?:boolean
}) {
    const [lieux, setLieux] = useState<Type_Lieu[]>([]);
    const [numbersLieuxDisplayed, setnumbersLieuxDisplayed] = useState<number>(30);
    const [SearchFilterValue, setSearchFilterValue] = React.useState("");
    const [GroupsLieuxIDs, setGroupsLieuxIDs] = useState<number[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<Type_Group[]>();
    const hasSearchFilter = Boolean(SearchFilterValue);


    const onSearchChange = React.useCallback((value?: string) => {
        console.log(value)
        if (value) {
            setSearchFilterValue(value);
        } else {
            setSearchFilterValue("");
        }
    }, []);
    
    const onClear = React.useCallback(() => {
        setSearchFilterValue("");
    }, []);
    
    const filteredItems = React.useMemo(() => {
        console.log("filteredItems")
        let filteredUsers = [...lieux];
    
        if (hasSearchFilter) {
            filteredUsers = filteredUsers.filter((user) => {
                return user.Nom_Lieu.toLowerCase().includes(SearchFilterValue.toLowerCase())
            });
        }

        if (selectedGroups && selectedGroups.length > 0) {
            filteredUsers = filteredUsers.filter((user) => {
                // console.log(user)
                var conditionSearchBar = selectedGroups.some(x => x.IdGroupe === user.IdGroupe1)
                conditionSearchBar = conditionSearchBar || selectedGroups.some(x => x.IdGroupe === user.IdGroupe2)
                // var consitionGroupFilter = ()
                return conditionSearchBar
            });
        }

        return filteredUsers;
    }, [lieux, SearchFilterValue, selectedGroups]);

    const items = React.useMemo(() => {    
        return filteredItems.slice(0, numbersLieuxDisplayed);
    }, [filteredItems, numbersLieuxDisplayed]);
    
    useLayoutEffect(() => {
        axios.get('/api/lieux', {
            params: {
                enSurveillance: 1
            }
        })
        .then(response => {
            if (Array.isArray(response.data)) {
                // console.log(response.data);
                var tmp_liste_id_groupe:number[] = []; 
                response.data.forEach((element:Type_Lieu) =>{
                    if (!tmp_liste_id_groupe.includes(element.IdGroupe1)){
                        tmp_liste_id_groupe.push(element.IdGroupe1)
                    }
                })
                console.log("liste_id_lieux: "+tmp_liste_id_groupe)
                setGroupsLieuxIDs(tmp_liste_id_groupe);
                // for (let index = 0; index < array.length; index++) {
                //     const element = array[index];
                    
                // }
                // -----------------INSERER UNE BOUCLE QUI UN TABLEAU AVEC LES ID DE GROUPE 
                // -----------------AVEC CE TABLEAU, FAIRE APPEL API POUR RECUPERER LES GROUPES
                // -----------------METTRE CES GROUPES DANS UN STATE, PUIS METTRE CE STATE EN PARAMETRE DE <GROUPFILTER> 
                setLieux(response.data);
                // setLieux([response.data[0]]);
            } else {
                console.error("Unexpected data format:", response.data);
            }
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
    }, [])

    return (
        <div className={`${(SideBar)?'ml-[288px]':''} flex flex-col gap-6 justify-center`}>
            <div className="flex flex-row gap-5 justify-between">
                <GroupFilter GroupsLieuxIDs={GroupsLieuxIDs} selectedGroups={selectedGroups} setSelectedGroups={setSelectedGroups}/>
                <div className="flex flex-row gap-5">
                    {/* <Filter /> */}
                    <SearchBar onSearchClear={onClear} onSearchValueChange={onSearchChange}/>
                </div>
            </div>
            <div className="grid md:grid-cols-2 desktop:grid-cols-3 2xl:grid-cols-5 grid-flow-row gap-10 h-full ">
                { items.map((lieu, index) => (
                        <MonitoringGraph 
                            key={index} 
                            idLieu={lieu.IdLieu || `unknown-${index}`} 
                            NomLieu={lieu.Nom_Lieu || `unknown-${index}`} 
                        />
                    ))
                }
            </div>
            {numbersLieuxDisplayed < filteredItems.length
                ?
                <div id="btnLoadMore" 
                    className="flex flex-row cursor-pointer bg-white h-12 p-6 w-fit border-gray-200 shadow-lg border-1 rounded-full justify-center mx-auto items-center select-none" 
                    style={{transition:'opacity 0.1s'}} 
                    onClick={()=> { if(numbersLieuxDisplayed+30>filteredItems.length){
                                        setnumbersLieuxDisplayed(filteredItems.length)
                                    }else{
                                        setnumbersLieuxDisplayed(numbersLieuxDisplayed+30)
                                    }
                            }}
                >
                    Charger plus
                </div>
                : 
                    <div>
                    </div>
            }
        </div>
        
    );
}
