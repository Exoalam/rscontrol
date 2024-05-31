import React, { useState, useRef, useEffect } from 'react';
import { faRobot, faWandMagicSparkles, faBars, faTimes, faUpload, faMapMarkerAlt, faMapLocationDot, faDownload, faKitchenSet, faDumpster, faBatteryHalf, faChair, faLocationCrosshairs, faCircleStop, faMap, faSave, faDeleteLeft, faCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ConnectDevice from './ConnectDevice';
import ConfirmationButton from './ConfirmationButton';
import JoyStickControl from './JoyStickControl';
import SlamMapVisualization from './Mapping';
import ROSLIB from 'roslib';
import { sendNavigationGoal, send2DPoseEstimate } from './TurtleBotControl'

import robotIcon from '../Icons/robot.png';
import kitchenIcon from '../Icons/cooking.png';
import chargingStationIcon from '../Icons/charger.png';
import tableIcon from '../Icons/table.png';
import recycleIcon from '../Icons/recycle-bin.png';
import repositionIcon from '../Icons/reposition.png';

const Modal = ({ isOpen, onClose, onSubmit }) => {
    const [tableNumber, setTableNumber] = useState('');

    return (
        isOpen && (
            <div className="modal modal-open">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Enter Table Number</h3>
                    <input
                        type="text"
                        placeholder="Table number"
                        className="input input-bordered w-full max-w-xs"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                    />
                    <div className="modal-action">
                        <button className="btn" onClick={() => onSubmit(tableNumber)}>Submit</button>
                        <button className="btn" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        )
    );
};
const MasterController = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(true);
    const [showControl, setShowControl] = useState(false);
    const [isNavigationMode, setIsNavigationMode] = useState(false);
    const [goal, setGoal] = useState(null);
    const [tableNumbers, setTableNumbers] = useState([]);
    const slamMapRef = useRef();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [iconPositions, setLoadedIcons] = useState([]);
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

    const getLocationCoords = (locationType) => {
        const location = iconPositions.find(pos => pos.type === locationType);
        return location ? { x: location.x, y: location.y, orientation: location.orientation } : null;
    };

    const handleNavigation = () => {
        setIsNavigationMode(!isNavigationMode)
    }

    const kitchen_button = () => {
        const coords = getLocationCoords('kitchen');
        if (coords) setGoal(sendNavigationGoal(ros, (coords.x - 400) / 40, (coords.y - 400) / 40, coords.orientation));
        console.log(coords)
    }

    const recycle_button = () => {
        const coords = getLocationCoords('recycle');
        if (coords) setGoal(sendNavigationGoal(ros, (coords.x - 400) / 40, (coords.y - 400) / 40, coords.orientation));
    }

    const charging_button = () => {
        const coords = getLocationCoords('chargingStation');
        if (coords) setGoal(sendNavigationGoal(ros, (coords.x - 400) / 40, (coords.y - 400) / 40, coords.orientation));
    }

    const reposition_button = () => {
        const coords = getLocationCoords('reposition');
        if (coords) setGoal(send2DPoseEstimate(ros, (coords.x - 400) / 40, (coords.y - 400) / 40, coords.orientation));
    }

    const handleDisconnect = () => {
        ros.close()
    };
    const [selectedTable, setSelectedTable] = useState('1'); // Default to the first option

    const handleSelectChange = (event) => {
        setSelectedTable(event.target.value);
    };

    const handleMapClick = (mapX, mapY, goalTheta) => {

        setGoal(sendNavigationGoal(ros, mapX, mapY, goalTheta));
        setIsNavigationMode(false);

    };


    const table_button = () => {
        const tableData = iconPositions.find(pos => pos.type === 'table' && pos.number === selectedTable);
        if (tableData) {
            setGoal(sendNavigationGoal(ros, (tableData.x - 400) / 40, (tableData.y - 400) / 40, tableData.orientation));
        } else {
            console.log("No table found with the selected number");
        }
    };

    const stopRobot = () => {
        const cmdVelTopic = new ROSLIB.Topic({
            ros: ros, // Assuming 'ros' is your ROSLIB.Ros instance connected to your ROS backend
            name: '/cmd_vel',
            messageType: 'geometry_msgs/Twist'
        });

        const stopMessage = new ROSLIB.Message({
            linear: {
                x: 0,
                y: 0,
                z: 0
            },
            angular: {
                x: 0,
                y: 0,
                z: 0
            }
        });
        goal.cancel();
        setGoal(null);
        cmdVelTopic.publish(stopMessage);
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
    useEffect(() => {
        if (ros) {
          const iconPositionsTopic = new ROSLIB.Topic({
            ros,
            name: '/icon_positions_response',
            messageType: 'std_msgs/String'
          });

      
          iconPositionsTopic.subscribe((message) => {
            const iconPositions = JSON.parse(message.data);
            setLoadedIcons(iconPositions);
          });
      
          return () => {
            iconPositionsTopic.unsubscribe();
          };
        }
      }, [ros]);
    

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
                    <ConnectDevice inputDesign={"input input-bordered input-ghost w-[80%] max-w-xs dark:bg-[#14181C]"} autoConnect={true} onConnect={setRos} />
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
                                    onClick={() => reposition_button()}
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
                            onClick={() => kitchen_button()}
                            label="Go to Kitchen"
                            modalTitle="Go to Kitchen"
                            modalDescription="Are you sure you want to Go to Kitchen?"
                            btn_class='btn btn-ghost dark:text-[#DCEBFA]'
                            text_dt='flex flex-row w-full text-left text-lg items-center'
                            icond={faKitchenSet}
                        />
                        <ConfirmationButton
                            onClick={() => recycle_button()}
                            label="Go to Recycle"
                            modalTitle="Go to Recycle"
                            modalDescription="Are you sure you want to Go to Recycle?"
                            btn_class='btn btn-ghost dark:text-[#DCEBFA]'
                            text_dt='flex flex-row w-full text-left text-lg items-center'
                            icond={faDumpster}
                        />
                        <ConfirmationButton
                            onClick={() => charging_button()}
                            label="Go to Charger"
                            modalTitle="Go to Charger"
                            modalDescription="Are you sure you want to Go to Charger?"
                            btn_class='btn btn-ghost dark:text-[#DCEBFA]'
                            text_dt='flex flex-row w-full text-left text-lg items-center'
                            icond={faBatteryHalf}
                        />
                        <ConfirmationButton
                            onClick={() => table_button()}
                            label="Go to Table"
                            modalTitle="Go to Table"
                            modalDescription="Are you sure you want to Go to Table?"
                            btn_class='btn btn-ghost dark:text-[#DCEBFA]'
                            text_dt='flex flex-row w-full text-left text-lg items-center'
                            icond={faChair}
                        />
                        <ConfirmationButton
                            onClick={() => handleNavigation()}
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
                            onClick={() => stopRobot()}
                            label="Stop"
                            modalTitle="Stop"
                            modalDescription="Are you sure you want to stop?"
                            btn_class='btn btn-error btn-outline dark:text-[#DCEBFA] text-center'
                            text_dt='flex flex-row text-2xl items-center'
                            icond={faCircleStop}
                        />
                    </div>)}
            </div>
            <div className="grid lg:w-4/6 card bg-[#1E2328] rounded-box place-items-center my-2 mx-1 shadow-xl p-4">
                <SlamMapVisualization ref={slamMapRef} onMapClick={handleMapClick} isNavigationMode={isNavigationMode} ros={ros} isEditingMap={isEditingMap} handleEditMap={handleEditMap} />
            </div>
            <div className="grid w-full lg:w-1/6 card bg-[#1E2328] rounded-box place-items-center my-2 mx-2 shadow-xl p-4">
                {isEditingMap && (
                    <div className='w-full h-full' style={{ display: 'flex', flexDirection: 'column' }}>
                        <button
                            onClick={() => slamMapRef.current.addKitchen()}
                            className='btn btn-ghost dark:text-[#DCEBFA]'>
                            <div className='flex flex-row w-full text-left text-lg items-center'>
                                <img src={kitchenIcon} alt="Icon" style={{ width: '20px', marginRight: '5px' }} />
                                <div className='mx-2'>
                                    Add Kitchen
                                </div>
                            </div>
                        </button>
                        <button
                            onClick={() => slamMapRef.current.addChargingStation()}
                            className='btn btn-ghost dark:text-[#DCEBFA]'
                        >
                            <div className='flex flex-row w-full text-left text-lg items-center'>
                                <img src={chargingStationIcon} alt="Icon" style={{ width: '20px', marginRight: '5px' }} />
                                <div className='mx-2'>
                                    Add Charging Station
                                </div>
                            </div>
                        </button>

                        <button
                            className="btn btn-ghost dark:text-[#DCEBFA]"
                            onClick={() => {setIsModalOpen(true);}}
                        >
                            <div className='flex flex-row w-full text-left text-lg items-center'>
                                <img src={tableIcon} alt="Icon" style={{ width: '20px', marginRight: '5px' }} />
                                <div className='mx-2'>
                                    Add Table
                                </div>
                            </div>
                        </button>

                        <Modal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onSubmit={slamMapRef.current.addTable}
                        />

                        <button
                            className='btn btn-ghost dark:text-[#DCEBFA]'
                            onClick={() => slamMapRef.current.addRecycle()}
                        >
                            <div className='flex flex-row w-full text-left text-lg items-center'>
                                <img src={recycleIcon} alt="Icon" style={{ width: '20px', marginRight: '5px' }} />
                                <div className='mx-2'>
                                    Add Recycle
                                </div>
                            </div>
                        </button>

                        <button
                            className='btn btn-ghost dark:text-[#DCEBFA]'
                            onClick={() => slamMapRef.current.addReposition()}
                        >
                            <div className='flex flex-row w-full text-left text-lg items-center'>
                                <img src={repositionIcon} alt="Icon" style={{ width: '20px', marginRight: '5px' }} />
                                <div className='mx-2'>
                                    Add Reposition
                                </div>
                            </div>
                        </button>

                        <button
                            className='btn btn-ghost dark:text-[#DCEBFA]'
                            onClick={() => slamMapRef.current.deleteSelectedIcon()}
                            disabled={!slamMapRef.current.selectedIcon}
                        >
                            <div className='flex flex-row w-full text-left text-lg items-center'>
                                <FontAwesomeIcon icon={faDeleteLeft} />
                                <div className='mx-2'>
                                    Delete Selected Icon
                                </div>
                            </div>
                        </button>

                        <button
                            className='btn btn-ghost dark:text-[#DCEBFA]'
                            onClick={() => slamMapRef.current.handleSaveIconPositions()}
                        >
                            <div className='flex flex-row w-full text-left text-lg items-center'>
                                <FontAwesomeIcon icon={faSave} />
                                <div className='mx-2'>
                                    Save All Icon Positions
                                </div>
                            </div>
                        </button>

                        <button
                            className='btn btn-ghost dark:text-[#DCEBFA]'
                            onClick={() => slamMapRef.current.setIsSettingOrientation(true)}
                            disabled={!slamMapRef.current.selectedIcon}
                        >
                            <div className='flex flex-row w-full text-left text-lg items-center'>
                            <FontAwesomeIcon icon={faCircle} />
                                <div className='mx-2'>
                                    Set Orientation
                                </div>
                            </div>
                        </button>
                    </div>
                )}
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