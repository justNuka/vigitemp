'use client'

export default function CardAlarm({  type, NomLieu, descriptionAlarme, dateAlarme } : {
    type:string,
    NomLieu:string,
    descriptionAlarme:string,
    dateAlarme:string,
}){
    
    return (
        <div className="border-1 bg-white min-w-80 max-w-80 h-auto relative rounded-xl flex flex-col flex-1 overflow-hidden tracking-tight pl-5 text-sm align-middle">
            <div className="grow-0 min-h-14 flex items-center justify-end px-3">
                <div 
                className="flex bg-gray-50 text-gray-500  px-4 py-[6px] w-fit outline-gray-200 outline-1 outline rounded-full justify-center items-center" style={{transition:'opacity 0.1s'}} onClick={()=> {window.scrollTo({top:0, behavior:'smooth'});}}>
                    {
                        {
                            'metrologique':"Alarme Métrologique",
                            'technique': "Alarme Technique"
                        }[type]
                    }
                </div>
            </div>
            <div className=" bg-white flex-col flex grow">
                <div className="grow flex items-center font-black text-xl">
                    {NomLieu}
                </div>
                <div className="grow flex pr-10 text-black">
                    {descriptionAlarme}
                </div>
            </div>
            <div className="grow-0 min-h-14 flex items-center">
                {dateAlarme}
            </div>
        </div>
    );
}
