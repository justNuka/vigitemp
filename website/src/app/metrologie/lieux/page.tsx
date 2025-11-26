'use client'
import ButtonScrollToTop from "@/app/components/buttonScrollToTop";
import ListLieux from "@/app/components/list-Lieux";
import SideBar from "@/app/components/sideBarMetrology";

export default function Lieux() {

    return (
        <>
            <main className="h-screen pt-32 px-24 pb-12">
                <ButtonScrollToTop SideBar/>
                <SideBar/>
                <ListLieux SideBar/>
            </main>
        </>
    )
}