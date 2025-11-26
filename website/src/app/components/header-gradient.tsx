'use client';
import { Link, Navbar, NavbarBrand, NavbarContent, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from "@heroui/react";
import {Tabs, Tab} from "@heroui/tabs";
import {VigitempLogo} from "@/app/components/VigitempLogo";
import AccountDropdown from "@/app/components/account-dropdown";
import { usePathname } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { useState } from "react";

export default function HeaderGradient() {

    const pathname = '/' + usePathname().split('/')[1];
    const router = useTransitionRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // console.log("pathname: " + pathname);
    // console.log("router: " + router);

    
    return (
        <div className="w-full fixed z-50">
            <Navbar height={80} maxWidth="full" isBordered className="bg-gradient-to-r from-[#c5f8ef] to-[#49aee0] drop-shadow-[0_1px_2px_rgba(0,0,100,0.3)]" >
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="lg:hidden"
                />
                <NavbarBrand onClick={() => router.push('/vigilog')}>
                    <VigitempLogo />
                </NavbarBrand>
                <NavbarContent className="hidden lg:flex gap-4 min-w-[40em]" justify="center">
                    <Tabs 
                        selectedKey={pathname} 
                        size="lg" fullWidth 
                        onSelectionChange={(key)=> { 
                            console.log(key.toString()) 
                            router.push(key.toString()) 
                        }}
                        classNames={{
                            tabList: "bg-transparent min-max",
                            cursor: "bg-[#FFBD50] absolute h-full rounded-none rounded-t-2xl z-[10]",
                            tabContent: "text-[#1E196A] font-medium text-xl group-data-[selected=true]:text-[#1E196A]",
                            tab : "h-[70px] mt-[10px]"
                        }}
                    >
                        <Tab key="/surveillance" title="Surveillance"/>
                        <Tab key="/metrologie" title="Métrologie"/>
                        <Tab key="/vigilog" title="Exploitation"/>
                        <Tab key="/docs" title="Paramétrage"/>
                    </Tabs>
                </NavbarContent>
                <NavbarContent as="div" justify="end">
                    <AccountDropdown />                    
                </NavbarContent>
                <NavbarMenu>
                    <NavbarMenuItem key="/surveillance" title="Surveillance">
                        <Link className="w-full h-14 text-2xl" href= "/surveillance" size="lg">Surveillance</Link>
                    </NavbarMenuItem>
                    {/* <Divider/> */}
                    <NavbarMenuItem key="/vigilog" title="Métrologie">
                        <Link className="w-full h-14 text-2xl" href= "/vigilog" size="lg">Métrologie</Link>
                    </NavbarMenuItem>
                    {/* <Divider/> */}
                    <NavbarMenuItem key="/demo" title="Exploitation">
                        <Link className="w-full h-14 text-2xl" href= "/demo" size="lg">Exploitation</Link>
                    </NavbarMenuItem>
                    {/* <Divider/> */}
                    <NavbarMenuItem key="/docs" title="Paramétrage">
                        <Link className="w-full h-14 text-2xl" href= "/docs" size="lg">Paramétrage</Link>
                    </NavbarMenuItem>
                </NavbarMenu>
            </Navbar>
            
        </div>
    );
}