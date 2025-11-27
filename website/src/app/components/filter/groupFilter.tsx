import { BreadcrumbItem, Breadcrumbs, Button, Chip, Divider } from "@heroui/react";
import { Filter as FilterIcon, XCircle } from 'lucide-react';
import { useEffect, useLayoutEffect, useState } from "react";
import axios from "axios";

interface Type_Group {
    IdGroupe: number; // Assuming there's a unique ID property
    NomGroupe: string; // Update this based on your API response,

    // Add other properties if needed
}

const data1:Type_Group[] = [
    {
        IdGroupe:1,
        NomGroupe: "Groupe 1"   
    },
    {
        IdGroupe:2,
        NomGroupe: "Groupe 2" 
    },
    {
        IdGroupe:3,
        NomGroupe: "Groupe 3" 
    }


]
const data2:Type_Group[] = [
    {
        IdGroupe:4,
        NomGroupe: "Groupe 4" 
    },
    {
        IdGroupe:5,
        NomGroupe: "Groupe 5" 
    },
    {
        IdGroupe:6,
        NomGroupe: "Groupe 6" 
    },


]

export default function GroupFilter(this: any, {GroupsLieuxIDs, selectedGroups, setSelectedGroups } : {
    GroupsLieuxIDs:number[],
    selectedGroups:Type_Group[]|undefined,
    setSelectedGroups:Function
}) {

    // console.log(GroupsLieuxIDs)

    const [nonSelectedGroups, setNonSelectedGroups] = useState<Type_Group[]>();

    useEffect(()=>{
        if(GroupsLieuxIDs.length > 0){
            // console.log("axios.get('/api/groupes', {params: {idToFind: "+GroupsLieuxIDs.toString()+"}})")
            axios.get('/api/groupes', {
                params: {
                    idToFind: GroupsLieuxIDs.toString()
                }
            })
            .then(response => {
                // console.log(response)
                if (Array.isArray(response.data)) {
                   
                    setNonSelectedGroups(response.data);
                    setSelectedGroups([]);
                } else {
                    console.error("Unexpected data format:", response.data);
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
        }
        // setSelectedGroups(data1);
        // setNonSelectedGroups(data2);
    }, [GroupsLieuxIDs])

    // useEffect(()=>{
    //     console.log("selectedGroups")
    //     console.log(selectedGroups)
    // }, [selectedGroups])
    // useEffect(()=>{
    //     console.log("nonSelectedGroups")
    //     console.log(nonSelectedGroups)
    // }, [nonSelectedGroups])

    function addGroupToFilters(group:Type_Group){
        var tmp_array_NonSelectedGroups = nonSelectedGroups?.slice()
        var tmp_array_SelectedGroups = selectedGroups?.slice()
        const index:number = tmp_array_NonSelectedGroups?.indexOf(group) ?? -1
        // console.log(tmp_array_NonSelectedGroups)
        // console.log(tmp_array_SelectedGroups)
        // console.log(index)
        if(index != -1){
            tmp_array_NonSelectedGroups?.splice(index, 1)
            console.log(tmp_array_SelectedGroups)
            if(tmp_array_SelectedGroups){
                // console.log(tmp_array_SelectedGroups)
                tmp_array_SelectedGroups.push(group)
            }

            setNonSelectedGroups(tmp_array_NonSelectedGroups)
            setSelectedGroups(tmp_array_SelectedGroups)
        }
        
        // console.log(tmp_array_SelectedGroups)
        // console.log(tmp_array_NonSelectedGroups)

    }

    function removeGroupToFilters(group:Type_Group){
        var tmp_array_NonSelectedGroups = nonSelectedGroups?.slice()
        var tmp_array_SelectedGroups = selectedGroups?.slice()
        const index:number = tmp_array_SelectedGroups?.indexOf(group) ?? -1
        // console.log(index)
        if(index != -1){
            tmp_array_SelectedGroups?.splice(index, 1)
            if(tmp_array_NonSelectedGroups){
                tmp_array_NonSelectedGroups.push(group)
            }

            setNonSelectedGroups(tmp_array_NonSelectedGroups)
            setSelectedGroups(tmp_array_SelectedGroups)
        }
        
        // console.log(tmp_array_SelectedGroups)
        // console.log(tmp_array_NonSelectedGroups)
    }

    return (
        <div className="flex flex-row gap-4 items-center">
            <div className="flex flex-row gap-0 items-center bg-grasdient-to-r from-swhite via-whites to-[#FsFBD50] z-10 rounded-xl">
                <Breadcrumbs 
                    radius="md" 
                    variant="solid"
                    className='z-10 whitespace-nowrap'
                    classNames={{
                        list:"bg-white outline-0 outlinse outline-[#d6d6d6] flex-nowrap"
                    }}
                    itemClasses={{
                        item: "text-gray-600 text-black pointer-events-none whitespace-nowrap",
                        separator:"text-bold text-gray-600 text-black whitespace-nowrap",
                        base:"flex flex-row whitespace-nowrap"
                    }}
                >
                    <BreadcrumbItem>Laboratoires</BreadcrumbItem>
                    <BreadcrumbItem>Chimie</BreadcrumbItem>
                </Breadcrumbs>
                <div className="flex flex-row gap-0">
                    {selectedGroups?.map((group, index) => (
                        <Chip 
                            key={index} 
                            size="lg"
                            radius="md" 
                            variant='flat' 
                            endContent =  {<XCircle color="#FF7D00"/>}
                            // endContent =  {<XCircle color="#808080"/>}
                            onClose={()=>removeGroupToFilters(group)}
                            className="ml-2"
                            classNames={{
                                base: "bg-[#fff3e7] back outline-1 outlisne-0 outline outline-[#ff7e00] text-small text-bladck text-[#B15700] z-20",
                                closeButton: "opacity-75 hover:opacity-75 drop-shadow-sm hover:scale-[130%] transition-all"
                            }}
                        >
                        {group.NomGroupe}
                        </Chip>
                    ))}
                </div>
                {/* <Chip 
                    size="lg"
                    radius="full" 
                    variant='flat' 
                    endContent =  {<XCircle color="#FE6862"/>}
                    onClose={()=>{}}
                    className=""
                    classNames={{
                        base: "bg-white outline-1 outline outline-[#d6d6d6] text-small text-black  z-20",
                        closeButton: "opacity-75 hover:opacity-75 drop-shadow-sm hover:scale-[130%] transition-all"
                    }}
                >
                    Groupe 1
                </Chip> */}
            </div>
            
            {(nonSelectedGroups?.length ?? 0) > 0 
            ? 
                <Divider orientation="vertical" className="h-[75%] bg-gray-400" />
            : 
                ''
            }

            <div className="flex flex-row gap-2 items-center">
                {nonSelectedGroups?.map((group, index) => (
                    <Chip 
                        key={index} 
                        size="lg"
                        radius="md" 
                        variant='flat' 
                        endContent =  {<XCircle color="#75D0E6"/>}
                        onClose={()=>addGroupToFilters(group)}
                        classNames={{
                            base: "bg-white outline-1 outline outline-[#d6d6d6] text-small text-black",
                            closeButton: " rotate-45 transform opacity-100 hover:opacity-100 drop-shadow-sm hover:scale-[130%] transition-all"
                        }}
                    >
                    {group.NomGroupe}
                    </Chip>
                ))}
                {/* <Chip 
                    size="lg"
                    radius="full" 
                    variant='flat' 
                    endContent =  {<IoMdCloseCircle color="#75D0E6"/>}
                    onClose={()=>{}}
                    classNames={{
                        base: "bg-white outline-1 outline outline-[#d6d6d6] text-small text-black",
                        closeButton: " rotate-45 transform opacity-100 hover:opacity-100 drop-shadow-sm hover:scale-[130%] transition-all"
                    }}
                >
                    Groupe 2
                </Chip>
                <Chip 
                     size="lg"
                     radius="full" 
                     variant='flat' 
                     endContent =  {<IoMdCloseCircle color="#75D0E6"/>}
                     onClose={()=>{}}
                     classNames={{
                         base: "bg-white outline-1 outline outline-[#d6d6d6] text-small text-black",
                         closeButton: " rotate-45 transform opacity-100 hover:opacity-100 drop-shadow-sm hover:scale-[130%] transition-all"
                     }}
                >
                    Groupe 3
                </Chip> */}
            </div>
            
        </div>
    );
};