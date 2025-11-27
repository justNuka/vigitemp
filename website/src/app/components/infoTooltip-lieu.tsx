'use client';

import { Button, Modal, ModalBody, ModalContent, ModalHeader, Tooltip, useDisclosure } from '@heroui/react';
import React from 'react';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from "lucide-react";



interface InfoTooltipProps {
    moduleName: string;
    sondeName: string;
}



const InfoTooltipLieu: React.FC<InfoTooltipProps> = ({ moduleName, sondeName }) => {

    var content = () =>{
        return (
            <div className="flex flex-col gap-1 p-2">
                <p className="text-sm font-medium">
                    Module: <span className="font-normal">{moduleName}</span>
                </p>
                <p className="text-sm font-medium">
                    Sonde: <span className="font-normal">{sondeName}</span>
                </p>
            </div>
        )
    }

    const {isOpen, onOpen, onClose} = useDisclosure();

    const handleOpen = () => {
        // setBackdrop(backdrop);
        onOpen();
      };


    return (
        <>
            <Modal backdrop="opaque" isOpen={isOpen} onClose={onClose} size='xs' hideCloseButton>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 select-none">
                                Informations du lieu
                            </ModalHeader>
                            <ModalBody className='mb-3'>
                                {content()}
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
        </Modal>
        <div className="hover:bg-white/75 flex min-w-8 items-center justify-between roundsed-full transition-colors rounded-xl outlidne outline-1 outline-black/25">
        <Tooltip 
            content={content()} 
                showArrow={true} 
                placement="bottom"
        >
            
                <Button 
                    className='px-2 mx-0 min-w-24 min-h-10 bg-transparent'
                    disableRipple
                    startContent={
                        <Info size={26} color="black"/>
                    }
                    onPress={() => handleOpen()}

                >
                    Infos
                </Button>
            </Tooltip>
            </div>
        </>
    );
};

export default InfoTooltipLieu;