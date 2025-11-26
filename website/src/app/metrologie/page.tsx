'use client'
import ListLieux from "@/app/components/list-Lieux";
import SideBarMetrology from "@/app/components/sideBarMetrology";

export default function Metrologie() {

    return (
        <>
            <main className="h-full pt-32 px-24 pb-12">
                <SideBarMetrology/>
                <ListLieux SideBar/>
            </main>
        </>
    )
}