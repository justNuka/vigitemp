'use client'
import ListLieux from "@/app/components/list-Lieux";
import SideBar from "@/app/components/sideBarMetrology";

export default function Sondes() {

    return (
        <>
            <main className="h-full pt-32 px-24 pb-12">
                <SideBar/>
                <ListLieux SideBar/>
            </main>
        </>
    )
}