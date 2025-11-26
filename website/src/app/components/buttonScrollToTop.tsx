'use client'

import { useEffect } from "react";

export default function ButtonScrollToTop({ SideBar } : {
    SideBar?:boolean
}) {

    useEffect(() => {
        window.onscroll = () => {scrollFunction()};
        var btnScrollTotop = document.getElementById("btnScrollTotop");
        if (btnScrollTotop){
            btnScrollTotop.addEventListener("transitionend", detectTheEnd, false);
            btnScrollTotop.addEventListener("webkitTransitionEnd", detectTheEnd, false);
            btnScrollTotop.addEventListener("mozTransitionEnd", detectTheEnd, false);
            btnScrollTotop.addEventListener("msTransitionEnd", detectTheEnd, false);
            btnScrollTotop.addEventListener("oTransitionEnd", detectTheEnd, false);

            btnScrollTotop.addEventListener("transitionstart", detectTheStart, false);
            btnScrollTotop.addEventListener("webkitTransitionStart", detectTheStart, false);
            btnScrollTotop.addEventListener("mozTransitionStart", detectTheStart, false);
            btnScrollTotop.addEventListener("msTransitionStart", detectTheStart, false);
            btnScrollTotop.addEventListener("oTransitionStart", detectTheStart, false);
        }

    }, [])

    const detectTheEnd= () => {
        let mybutton = document.getElementById("btnScrollTotop");
        if (mybutton){
            if (document.documentElement.scrollTop <= 20) {
                mybutton.style.visibility = "hidden";
            }
        }
    }

    const detectTheStart= () => {
        let mybutton = document.getElementById("btnScrollTotop");
        if (mybutton){
            if (document.documentElement.scrollTop > 20) {
                mybutton.style.visibility = "visible";
            }
        }
    }
    

    const scrollFunction= () => {
        let mybutton = document.getElementById("btnScrollTotop");
        if (mybutton){
            if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                mybutton.style.opacity="1";
            } else {
                mybutton.style.opacity="0";
            }
        }
    }
    
    return (
        <div id="btnScrollTotop" 
            className={`${(SideBar)?'ml-[144px]':''} invisible fixed flex cursor-pointer left-[50%] -translate-x-[50%] z-[999] bg-white h-12 p-6 w-fit border-gray-200 shadow-lg border-1 rounded-full justify-center items-center select-none`} style={{transition:'opacity 0.1s'}} onClick={()=> {window.scrollTo({top:0, behavior:'smooth'});}}>
            Haut de la page
        </div>
    );
};