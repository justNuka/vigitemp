'use client'
import React from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar} from "@heroui/react";

export default function AccountDropdown() {
  return (
    <Dropdown >
        <DropdownTrigger >
        
            <button className="bg-[#9CDAEF] text-[#1E196A] px-4 py-2 rounded-3xl flex justify-between items-center gap-5">
                <div className="select-none text-[#1E196A] hidden desktop:block">
                    Pedro Sanchez
                </div>
                <Avatar
                    className="select-none transition-transform"
                    name="Jason Hughes"
                    size="md"
                    src="https://i.pravatar.cc/150"
                />
            </button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Connecté(e) en tant que </p>
                <p className="font-semibold">pedro.sanchez@lab.com</p>
            </DropdownItem>
            <DropdownItem key="vigitemp_agent">
                <a href='/VigitempAgentInstaller.msi' download>Télecharger Vigitemp Agent</a>
            </DropdownItem>
            <DropdownItem key="settings">Mes paramètres</DropdownItem>
            <DropdownItem key="help_and_feedback">Signaler un problème</DropdownItem>
            <DropdownItem key="logout" color="danger">Se déconnecter</DropdownItem>
        </DropdownMenu>
    </Dropdown>
  );
}
