import { Button, Chip } from "@heroui/react";
import { IoFilterOutline } from 'react-icons/io5';

export default function Filter() {

    return (
        <div className="flex flex-row gap-3 items-center">
            <Button 
                size='md'
                className='transition-colors-opacity data-[hover=true]:bg-gray-50 group-data-[focus=true]:bg-white bg-white border-[#d6d6d6] border-1'
                disableRipple
                startContent={
                    <IoFilterOutline />
                }>
                Filtres
            </Button>
            {/* <Chip size="md" variant='flat' color='primary' className='select-none' onClose={()=>{}}>
                Surveillance
            </Chip> */}
        </div>
    );
};