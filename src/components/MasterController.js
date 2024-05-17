import React from 'react';
import { faRobot, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import ConnectDevice from './ConnectDevice';
import ConfirmationButton from './ConfirmationButton';

const MasterController = () => {
    return (
        <div className="flex flex-col min-h-screen lg:flex-row bg-[#14181C]">
            <div className="grid w-full lg:w-1/6 card bg-[#1E2328] rounded-box my-2 mx-2 shadow-xl ">
                <div className="flex flex-col p-4">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold dark:text-[#6AFFDC] my-2">RestoBotics</h2>
                    <div class="divider"></div>
                    <ConnectDevice
                        inputDesign={"input input-bordered input-ghost w-[80%] max-w-xs dark:bg-[#14181C]"}
                        autoConnect={true}
                    />
                    <div class="divider"></div>
                    <ConfirmationButton
                        onClick={() => console.log('Initialization')}
                        label="Initialization"
                        modalTitle="Initialization"
                        modalDescription="Are you sure you want to Initialization?"
                        btn_class='btn btn-ghost dark:text-[#DCEBFA]'
                        text_dt='flex flex-row w-full text-left text-lg items-center'
                        icond={faWandMagicSparkles}
                    />
                    <ConfirmationButton
                        onClick={() => console.log('Control')}
                        label="Control"
                        modalTitle="Control"
                        modalDescription="Are you sure you want to Control?"
                        btn_class='btn btn-ghost dark:text-[#DCEBFA]'
                        text_dt='flex flex-row w-full text-left text-lg items-center'
                        icond={faRobot}
                    />
                </div>
            </div>
            <div className="grid w-full lg:w-4/6 card bg-[#1E2328] rounded-box place-items-center my-2 mx-1 shadow-xl p-4">
                content
            </div>
            <div className="grid w-full lg:w-1/6 card bg-[#1E2328] rounded-box place-items-center my-2 mx-2 shadow-xl p-4">
                content
            </div>
        </div>
    );
};

export default MasterController;