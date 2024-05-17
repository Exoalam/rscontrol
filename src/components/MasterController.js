import React, { useState } from 'react';
import { faRobot, faWandMagicSparkles, faBars, faTimes, faUpload, faMapMarkerAlt, faMapLocationDot, faDownload, faKitchenSet, faDumpster, faBatteryHalf, faChair, faLocationCrosshairs, faCircleStop, faMap} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ConnectDevice from './ConnectDevice';
import ConfirmationButton from './ConfirmationButton';
import JoyStickControl from './JoyStickControl';
import SlamMapVisualization from './Mapping';
import ROSLIB from 'roslib';


const MasterController = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(true);
    const [showControl, setShowControl] = useState(false);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const toggleControl = (value) => {
        setShowControl(value);
        toggleDrawer();
    }

    const [ros, setRos] = useState(null);
    const [map, setMap] = useState(null);
    const [isEditingMap, setIsEditingMap] = useState(false);
  
    const handleEditMap = () => {
      setIsEditingMap(!isEditingMap);
    };
  
    const sendCommand = (command, map = 0) => {
      if (map === 1) {
        setMap('map1')
        command = 'create map'
      }
      if (map === 2) {
        setMap('map2')
        command = 'create map'
      }
      if (map === 3) {
        setMap('map3')
        command = 'create map'
      }
  
      if (!ros || !ros.isConnected) {
        console.log('ROS is not connected.');
        return;
      }
      const commandTopic = new ROSLIB.Topic({
        ros: ros,
        name: '/command_center',
        messageType: 'std_msgs/String'
      });

      const message = new ROSLIB.Message({
        data: command
      });

      commandTopic.publish(message);
      console.log(`Command sent: ${command}`);
    };
  
    const handleLoadMap = (value) => {
      sendCommand('load map' + value)
    }

    return (
        <div className="flex flex-col min-h-screen lg:flex-row bg-[#14181C]">
            <div className={`fixed top-0 left-0 h-screen w-full lg:w-1/6 card bg-[#1E2328] rounded-box shadow-xl z-50 transition-transform duration-300 ease-in-out transform ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col p-4">
                    <button
                        className="absolute top-4 right-4 btn btn-ghost dark:text-[#DCEBFA]"
                        onClick={toggleDrawer}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold dark:text-[#6AFFDC] my-2">RestoBotics</h2>
                    <div className="divider"></div>
                    <ConnectDevice inputDesign={"input input-bordered input-ghost w-[80%] max-w-xs dark:bg-[#14181C]"} autoConnect={true} onConnect={setRos}/>
                    <div className="divider"></div>
                    <ConfirmationButton onClick={() => toggleControl(false)} label="Initialization" modalTitle="Initialization" modalDescription="Are you sure you want to Initialization?" btn_class='btn btn-ghost dark:text-[#DCEBFA]' text_dt='flex flex-row w-full text-left text-lg items-center' icond={faWandMagicSparkles} />
                    <ConfirmationButton onClick={() => toggleControl(true)} label="Control" modalTitle="Control" modalDescription="Are you sure you want to Control?" btn_class='btn btn-ghost dark:text-[#DCEBFA]' text_dt='flex flex-row w-full text-left text-lg items-center' icond={faRobot} />
                    <div className="divider"></div>
                </div>
            </div>
            <div className="grid w-full lg:w-1/6 card bg-[#1E2328] rounded-box place-items-center my-2 mx-2 shadow-xl p-4">
                {!showControl && (
                    <div className="flex flex-col w-full h-full pt-4">
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold dark:text-[#6AFFDC] my-2">Initialization</h2>
                        <div className="divider"></div>
                        <ul className="menu rounded-box">
                            <li>
                                <details>
                                    <summary className='dark:text-[#DCEBFA] mb-1 text-lg'>
                                        <FontAwesomeIcon icon={faMapLocationDot} className="mr-2" />
                                        Generate Map
                                    </summary>
                                    <ul>
                                        <li>
                                            <ConfirmationButton
                                                onClick={() => sendCommand('create map1', 1)}
                                                label="Map 1"
                                                modalTitle="Map 1"
                                                modalDescription="Are you sure you want to generate Map 1?"
                                                btn_class='btn btn-ghost dark:text-[#DCEBFA] mb-1'
                                                text_dt='flex flex-row w-full text-left text-base items-center'
                                            />
                                        </li>
                                        <li>
                                            <ConfirmationButton
                                                onClick={() => sendCommand('create map1', 2)}
                                                label="Map 2"
                                                modalTitle="Map 2"
                                                modalDescription="Are you sure you want to generate Map 2?"
                                                btn_class='btn btn-ghost dark:text-[#DCEBFA] mb-1'
                                                text_dt='flex flex-row w-full text-left text-base items-center'
                                            />
                                        </li>
                                        <li>
                                            <ConfirmationButton
                                                onClick={() => sendCommand('create map1', 3)}
                                                label="Map 3"
                                                modalTitle="Map 3"
                                                modalDescription="Are you sure you want to generate Map 3?"
                                                btn_class='btn btn-ghost dark:text-[#DCEBFA] mb-1'
                                                text_dt='flex flex-row w-full text-left text-base items-center'
                                            />
                                        </li>
                                    </ul>
                                </details>
                            </li>
                            <li>
                                <ConfirmationButton
                                    onClick={() => {
                                        if (map === 'map1') {
                                          sendCommand('save map1')
                                        }
                                        else if (map === 'map2') {
                                          sendCommand('save map2')
                                        }
                                        else if (map === 'map3') {
                                          sendCommand('save map3')
                                        }
                                      }}
                                    label="Save Map"
                                    modalTitle="Save Map"
                                    modalDescription="Are you sure you want to Save Map?"
                                    btn_class='btn btn-ghost dark:text-[#DCEBFA] mb-1'
                                    text_dt='flex flex-row w-full text-left text-lg items-center'
                                    icond={faUpload}
                                />
                            </li>
                            <li>
                                <details>
                                    <summary className='dark:text-[#DCEBFA] mb-1 text-lg'>
                                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                                        Load Map
                                    </summary>
                                    <ul>
                                        <li>
                                            <ConfirmationButton
                                                onClick={() => handleLoadMap('1')}
                                                label="Map 1"
                                                modalTitle="Map 1"
                                                modalDescription="Are you sure you want to load Map 1?"
                                                btn_class='btn btn-ghost dark:text-[#DCEBFA] mb-1'
                                                text_dt='flex flex-row w-full text-left text-base items-center'
                                            />
                                        </li>
                                        <li>
                                            <ConfirmationButton
                                                onClick={() => handleLoadMap('2')}
                                                label="Map 2"
                                                modalTitle="Map 2"
                                                modalDescription="Are you sure you want to load Map 2?"
                                                btn_class='btn btn-ghost dark:text-[#DCEBFA] mb-1'
                                                text_dt='flex flex-row w-full text-left text-base items-center'
                                            />
                                        </li>
                                        <li>
                                            <ConfirmationButton
                                                onClick={() => handleLoadMap('3')}
                                                label="Map 3"
                                                modalTitle="Map 3"
                                                modalDescription="Are you sure you want to load Map 3?"
                                                btn_class='btn btn-ghost dark:text-[#DCEBFA] mb-1'
                                                text_dt='flex flex-row w-full text-left text-base items-center'
                                            />
                                        </li>
                                    </ul>
                                </details>
                            </li>
                            <li>
                                <ConfirmationButton
                                    onClick={handleEditMap}
                                    label="Edit Map"
                                    modalTitle="Edit Map"
                                    modalDescription="Are you sure you want to edit Map?"
                                    btn_class='btn btn-ghost dark:text-[#DCEBFA]'
                                    text_dt='flex flex-row w-full text-left text-lg items-center'
                                    icond={faMap}
                                />
                            </li>
                            <li>
                                <ConfirmationButton
                                    onClick={() => console.log('Reposition')}
                                    label="Reposition"
                                    modalTitle="Reposition"
                                    modalDescription="Are you sure you want to Reposition?"
                                    btn_class='btn btn-ghost dark:text-[#DCEBFA]'
                                    text_dt='flex flex-row w-full text-left text-lg items-center'
                                    icond={faMapMarkerAlt}
                                />
                            </li>
                        </ul>
                        <div className="divider"></div>
                        <JoyStickControl ros={ros} />
                    </div>)}
                {showControl && (
                    <div className="flex flex-col p-4 w-full h-full">
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold dark:text-[#6AFFDC] my-2">Control</h2>
                        <div className="divider"></div>
                        <ConfirmationButton
                            onClick={() => console.log('Kitchen')}
                            label="Go to Kitchen"
                            modalTitle="Go to Kitchen"
                            modalDescription="Are you sure you want to Go to Kitchen?"
                            btn_class='btn btn-ghost dark:text-[#DCEBFA]'
                            text_dt='flex flex-row w-full text-left text-lg items-center'
                            icond={faKitchenSet}
                        />
                        <ConfirmationButton
                            onClick={() => console.log('Recycle')}
                            label="Go to Recycle"
                            modalTitle="Go to Recycle"
                            modalDescription="Are you sure you want to Go to Recycle?"
                            btn_class='btn btn-ghost dark:text-[#DCEBFA]'
                            text_dt='flex flex-row w-full text-left text-lg items-center'
                            icond={faDumpster}
                        />
                        <ConfirmationButton
                            onClick={() => console.log('Charger')}
                            label="Go to Charger"
                            modalTitle="Go to Charger"
                            modalDescription="Are you sure you want to Go to Charger?"
                            btn_class='btn btn-ghost dark:text-[#DCEBFA]'
                            text_dt='flex flex-row w-full text-left text-lg items-center'
                            icond={faBatteryHalf}
                        />
                        <ConfirmationButton
                            onClick={() => console.log('Table')}
                            label="Go to Table"
                            modalTitle="Go to Table"
                            modalDescription="Are you sure you want to Go to Table?"
                            btn_class='btn btn-ghost dark:text-[#DCEBFA]'
                            text_dt='flex flex-row w-full text-left text-lg items-center'
                            icond={faChair}
                        />
                        <ConfirmationButton
                            onClick={() => console.log('Custom')}
                            label="Custom Waypoint"
                            modalTitle="Custom Waypoint"
                            modalDescription="Are you sure you want to Go to Custom Waypoint?"
                            btn_class='btn btn-ghost dark:text-[#DCEBFA]'
                            text_dt='flex flex-row w-full text-left text-lg items-center'
                            icond={faLocationCrosshairs}
                        />
                        <div className="divider"></div>
                        <JoyStickControl ros={ros} />
                        <div className='divider'></div>
                        <ConfirmationButton
                            onClick={() => console.log('Stop')}
                            label="Stop"
                            modalTitle="Stop"
                            modalDescription="Are you sure you want to stop?"
                            btn_class='btn btn-error btn-outline dark:text-[#DCEBFA] text-center'
                            text_dt='flex flex-row text-2xl items-center'
                            icond={faCircleStop}
                        />
                    </div>)}
            </div>
            <div className="grid w-full lg:w-4/6 card bg-[#1E2328] rounded-box place-items-center my-2 mx-1 shadow-xl p-4">
                <SlamMapVisualization ros={ros} isEditingMap={isEditingMap} handleEditMap={handleEditMap}/>
            </div>
            <div className="grid w-full lg:w-1/6 card bg-[#1E2328] rounded-box place-items-center my-2 mx-2 shadow-xl p-4">
                content
            </div>
            <button
                className="fixed top-4 left-4 btn btn-ghost dark:text-[#DCEBFA] z-50"
                onClick={toggleDrawer}
            >
                <FontAwesomeIcon icon={faBars} />
            </button>
        </div>
    );
};

export default MasterController;