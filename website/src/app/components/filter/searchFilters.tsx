'use client'

import { Input, useDisclosure } from "@heroui/react";
import { SearchIcon } from "../svg/SearchIcon";
import Filter from "./Filter";




export default function SearchBar({ onSearchClear, onSearchValueChange } : {
    onSearchClear:()=>void
    onSearchValueChange:any
}) {

    // const {isOpen, onOpen, onOpenChange} = useDisclosure();

    return (
        <div className="flex flex-row relative justify-between items-center">
            <Input
                isClearable
                onClear={onSearchClear}
                onValueChange={(value) => {onSearchValueChange(value)}}
                size="md"
                classNames={{
                    base:'w-80',
                    inputWrapper:'w-80 transition-colors-opacity data-[hover=true]:bg-gray-50 group-data-[focus=true]:bg-white bg-white border-[#d6d6d6] border-1'
                }}
                placeholder="Recherche"
                labelPlacement="outside-left"
                startContent={
                    <SearchIcon />
                }
            />
        </div>
    );
};