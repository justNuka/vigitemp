'use client';
import { Button, Checkbox, CircularProgress, Divider, Slider } from "@heroui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function VigilogSettings() {
    const [slider, setSlider] = useState<number[]>([-25, 25]);
    const [isVigiLogSettingLoaded, setVigiLogSettingLoaded] = useState(false);
    const [isConsigneHaute, setconsigneHaute] = useState(true);
    const [isConsigneBasse, setconsigneBasse] = useState(true);
    const [valueConsigneHaute, setValueconsigneHaute] = useState(25);
    const [valueConsigneBasse, setValueconsigneBasse] = useState(-25);
    const [isVigilogSettingsDownloading, setVigilogSettingsDownloading] = useState(false);
    const [vigilogSettingsDownloadingValue, setvigilogSettingsDownloadingValue] = useState(0);
    const [isVigilogSettingsUploading, setVigilogSettingsUploading] = useState(false);
    const [VigilogSettingsUploadingValue, setVigilogSettingsUploadingValue] = useState(0);
    const [ip, setIp] = useState<string>("");

    useEffect(() => {
        // const getLocalIP = async () => {
        //   const ip = await getServerSideProps();
        //   setIp(ip.props.localIP);
        // }
        // getLocalIP();
      }, []);

    // Log state changes
    useEffect(() => {
        // console.log("Consigne Haute:", isConsigneHaute);
        if (isConsigneHaute == true) {
            handleSliderChange([slider[0],valueConsigneHaute]); // If it's an array, set it directly
        } else {
            setValueconsigneHaute(slider[1]);
            handleSliderChange(slider[0]); // If it's an array, set it directly
        }
        
    }, [isConsigneHaute]);

    useEffect(() => {
        // console.log("Consigne Basse:", isConsigneBasse);
        if (isConsigneBasse == true) {
            handleSliderChange([valueConsigneBasse,slider[1]]); // If it's an array, set it directly
        } else {
            setValueconsigneBasse(slider[0]);
            handleSliderChange(slider[1]); // If it's an array, set it directly
        }
    }, [isConsigneBasse]);

    useEffect(() => {
        // console.log("Consigne Haute:", isConsigneHaute);
        console.log(valueConsigneHaute);
        
    }, [valueConsigneHaute]);

    useEffect(() => {
        // console.log("Consigne Haute:", isConsigneHaute);
        console.log(valueConsigneBasse);
        
    }, [valueConsigneBasse]);
    
    const handleSliderChange = (value: number | number[]) => {
        console.log("slider change: " +value)
        // Check if the value is an array before setting it
        if (Array.isArray(value)) {
            setSlider(value); // If it's an array, set it directly
        } else {
            if (!isConsigneBasse) {
                setSlider([-999999, value]); // This is just an example, adjust as necessary
            } else if (!isConsigneHaute) {
                setSlider([value, 999999]); // This is just an example, adjust as necessary
            }
            // Handle single value case if needed
            
        }
    };

    const downloadSettings = () => {
        //appliquer au vigilog
        setVigilogSettingsDownloading(true);
        const interval = setInterval(() => {
            setvigilogSettingsDownloadingValue((v)=> (v>90)?v:v+4);
            if (vigilogSettingsDownloadingValue == 100){
                clearInterval(interval);
            }
        }, 500); 
        try{
            console.log(`http://${ip}:8000/downloadLogTagConfiguration`);
            axios.get(`http://${ip}:8000/downloadLogTagConfiguration`)
            .then(response => {
                const infos = response.data;
                console.log("infos: " +infos);
                console.log("infos.res_consigneBasseActive: " +infos["res_consigneBasseActive"]);
                if(infos["res_consigneBasseActive"] != null){
                    setconsigneBasse(infos.res_consigneBasseActive);
                    setconsigneHaute(infos.res_consigneHauteActive);
                    if (infos.res_consigneBasseActive == true){
                        setValueconsigneBasse(infos.res_consigneBasseValeur);
                    }
                    if (infos.res_consigneHauteActive == true){
                        setValueconsigneHaute(infos.res_consigneHauteValeur);
                    }
                    setSlider([infos.res_consigneBasseValeur, infos.res_consigneHauteValeur])
                    
                    setVigiLogSettingLoaded(true);
                } else {
                    toast.error("Chargement des parametres impossible.\nVerifiez que le Vigilog est bien dans le dock et que le dock est connecté au PC.", {
                        style:{
                            background:"#ff675c",
                            color: "#fff1f0",
                            maxWidth: 1000
                        }
                    });
                }
                
                console.log(response.data);
                setVigilogSettingsDownloading(false);
                clearInterval(interval);
                setvigilogSettingsDownloadingValue(0);
            })
            .catch(()=>{
                console.log("Pas de reponse");
                toast.error("Verifiez que Vigitemp Agent est ouvert dans votre barre des taches.", {
                    style:{
                        background:"#ff675c",
                        color: "#fff1f0"
                    }
                });
                setVigilogSettingsDownloading(false);
                clearInterval(interval);
                setvigilogSettingsDownloadingValue(0);
            });
        } catch (error) {
            console.log("Erreur lors de la requête", error);
        }
    };


    const uploadSettings = () => {
        //appliquer au vigilog
        setVigilogSettingsUploading(true);
        const interval = setInterval(() => {
            setVigilogSettingsUploadingValue((v)=> (v>90)?v:v+4);
            if (VigilogSettingsUploadingValue == 100){
                clearInterval(interval);
            }
        }, 500); 
        try{
            console.log(`http://${ip}:8000/uploadLogTagConfiguration`);
            axios.post(`http://${ip}:8000/uploadLogTagConfiguration`, null, {
                params:{
                    consigneHaute: isConsigneHaute,
                    consigneBasse: isConsigneBasse,
                    valeurConsigneHaute: slider[1],
                    valeurConsigneBasse: slider[0]
                }
            })
            .then(response => {
                console.log(response.data);
                if(response.data.res == "false"){ 
                    setVigiLogSettingLoaded(false);
                }
                setVigilogSettingsUploading(false);
                clearInterval(interval);
                setVigilogSettingsUploadingValue(0);
            })
            .catch(()=>{
                console.log("Pas de reponse");
                setVigiLogSettingLoaded(false);
                setVigilogSettingsUploading(false);
                clearInterval(interval);
                setVigilogSettingsUploadingValue(0);
            });
        } catch (error) {
            console.log("Erreur lors de la requête", error);
        }
    };

    const thumbsAdjustments_consigneHaute = () => {
        setconsigneHaute(!isConsigneHaute);
    };

    const thumbsAdjustments_consigneBasse = () => {
        setconsigneBasse(!isConsigneBasse);
    };



    return (
        <div className="flex flex-col justify-center h-full rounded-2xl p-5 backdrop-blur-sm bg-slate-50 shadow-md">
            <div className="absolute size-full left-0 top-0 bg-slate-50 rounded-2xl z-20 items-center flex flex-col justify-center gap-3" style={{opacity:(isVigiLogSettingLoaded?'0':'100')+'%', visibility:(isVigiLogSettingLoaded?'hidden':'visible'), transition:'visibility 0s linear 0.1s,opacity 0.1s linear'}}>
                <Button size="md" color="primary" variant="ghost" isDisabled={isVigilogSettingsDownloading} onPress={downloadSettings}>
                    Charger les paramètres du Vigilog
                </Button>
                <CircularProgress
                    aria-label="Loading..."
                    size="md"
                    value={vigilogSettingsDownloadingValue}
                    color="warning"
                    
                    classNames={{
                        base:`transition-opacity ease-in-out delay-50 duration-250 ${isVigilogSettingsDownloading?"opacity-100":"opacity-0"}`
                    }}
                />
            </div>
            <div className="flex justify-center h-full gap-10" style={{visibility:(!isVigiLogSettingLoaded?'hidden':'visible')}}>
                <div className="flex flex-col gap-10 justify-center">
                    <Checkbox defaultSelected isSelected={isConsigneHaute} onValueChange={thumbsAdjustments_consigneHaute}>Consigne Haute</Checkbox>
                    <Checkbox defaultSelected isSelected={isConsigneBasse} onValueChange={thumbsAdjustments_consigneBasse}>Consigne Basse</Checkbox>
                </div>
                <Slider 
                label="Temperature" 
                showTooltip={true}
                step={1} 
                maxValue={85} 
                minValue={-85} 
                value={slider} 
                fillOffset={0}
                
                orientation="vertical"
                onChange={handleSliderChange}
                classNames={{
                    filler:"bg-slate-50 border-1 border-primary",
                    track: "bg-yellow-400",
                    // track: `bg-gradient-to-t from-blue-500 from-15% to-red-500 to-15% h-[500px] border-y-0 my-4`,
                  }}
                />
            </div>
            <Divider className="my-3" style={{visibility:(!isVigiLogSettingLoaded?'hidden':'visible')}}/>
            <div className="flex items-center align-middle justify-end w-full gap-3" style={{visibility:(!isVigiLogSettingLoaded?'hidden':'visible')}}>
                <CircularProgress
                    aria-label="Loading..."
                    size="md"
                    value={VigilogSettingsUploadingValue}
                    color="warning"
                    
                    classNames={{
                        base:`transition-opacity ease-in-out delay-50 duration-250 ${isVigilogSettingsUploading?"opacity-100":"opacity-0"}`
                    }}
                />
                <Button size="md" color="primary" onClick={uploadSettings} style={{visibility:(!isVigiLogSettingLoaded?'hidden':'visible')}}>
                    Appliquer au Vigilog
                </Button>
            </div>
        </div>
    );
}