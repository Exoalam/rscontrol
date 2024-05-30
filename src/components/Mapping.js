import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import ROSLIB from 'roslib';
import iconPositions from '../icon_positions.json';

import robotIcon from '../Icons/robot.png';
import kitchenIcon from '../Icons/cooking.png';
import chargingStationIcon from '../Icons/charger.png';
import tableIcon from '../Icons/table.png';
import recycleIcon from '../Icons/recycle-bin.png';
import repositionIcon from '../Icons/reposition.png';

const SlamMapVisualization = forwardRef(({ ros, isEditingMap, handleEditMap, onMapClick, isNavigationMode }, ref) => {
  const mapCanvasRef = useRef(null);
  const robotCanvasRef = useRef(null);
  const iconsCanvasRef = useRef(null);
  const arrowCanvasRef = useRef(null);
  const [robotPosition, setRobotPosition] = useState({
    x: 0,
    y: 0,
    orientation: { x: 0, y: 0, z: 0, w: 1 },
  });
  const [kitchens, setKitchens] = useState([]);
  const [chargingStations, setChargingStations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tables, setTables] = useState([]);
  const [recycles, setRecycles] = useState([]);
  const [repositions, setRepositions] = useState([]);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [selectedIconOrientation, setSelectedIconOrientation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSettingOrientation, setIsSettingOrientation] = useState(false);
  const [arrowOrigin, setArrowOrigin] = useState(null);
  const [arrowAngle, setArrowAngle] = useState(0);

  const containerRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [lastMapMessage, setLastMapMessage] = useState(null);

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [loadedIcons, setLoadedIcons] = useState([]);
  const [laserDistance, setLaserDistance] = useState(0);

  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [pannedArrowOrigin, setPannedArrowOrigin] = useState(null);
  const [hasReachedArrowOrigin, setHasReachedArrowOrigin] = useState(false);


  useImperativeHandle(ref, () => ({
    addKitchen,
    addChargingStation,
    addTable,
    addRecycle,
    addReposition,
    deleteSelectedIcon,
    handleSaveIconPositions,
    setIsModalOpen,
    setIsSettingOrientation,
    selectedIcon,
  }));

  // Mouse handlers for panning
  const handleMouseDown = (e) => {
    if (!isNavigationMode) {
      const { clientX, clientY } = e;
      setPanStart({ x: clientX - panOffset.x, y: clientY - panOffset.y });
      setIsPanning(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isNavigationMode && isPanning) {
      const { clientX, clientY } = e;
      setPanOffset({
        x: clientX - panStart.x,
        y: clientY - panStart.y,
      });
      if (lastMapMessage) {
        drawMap(lastMapMessage); // Redraw the map with the new pan offset
      }
      drawIcons(); // Redraw icons with new pan offset
    }
  };


  const handleMouseUp = () => {
    if (!isNavigationMode) {
      setIsPanning(false);
    }
  };

  const addKitchen = () => {
    const newKitchen = {
      id: Date.now(),
      x: robotPosition.x * 40 + 400,
      y: robotPosition.y * 40 + 400,
      type: 'kitchen',
      color: 'red',
      orientation: Math.atan2(2 * (robotPosition.orientation.w * robotPosition.orientation.z + robotPosition.orientation.x * robotPosition.orientation.y), 1 - 2 * (robotPosition.orientation.y * robotPosition.orientation.y + robotPosition.orientation.z * robotPosition.orientation.z)),
    };
    setKitchens((prevKitchens) => [...prevKitchens, newKitchen]);
  };

  const addChargingStation = () => {
    const newChargingStation = {
      id: Date.now(),
      x: robotPosition.x * 40 + 400,
      y: robotPosition.y * 40 + 400,
      type: 'chargingStation',
      color: 'blue',
      orientation: Math.atan2(2 * (robotPosition.orientation.w * robotPosition.orientation.z + robotPosition.orientation.x * robotPosition.orientation.y), 1 - 2 * (robotPosition.orientation.y * robotPosition.orientation.y + robotPosition.orientation.z * robotPosition.orientation.z)),
    };
    setChargingStations((prevChargingStations) => [...prevChargingStations, newChargingStation]);
  };

  const addTable = (tableNumber) => {
    const newTable = {
      id: Date.now(),
      x: robotPosition.x * 40 + 400,
      y: robotPosition.y * 40 + 400,
      type: 'table',
      color: 'green',
      orientation: Math.atan2(2 * (robotPosition.orientation.w * robotPosition.orientation.z + robotPosition.orientation.x * robotPosition.orientation.y), 1 - 2 * (robotPosition.orientation.y * robotPosition.orientation.y + robotPosition.orientation.z * robotPosition.orientation.z)),
      number: tableNumber
    };
    setTables((prevTables) => [...prevTables, newTable]);
    setIsModalOpen(false);
  };

  const addRecycle = () => {
    const newRecycle = {
      id: Date.now(),
      x: robotPosition.x * 40 + 400,
      y: robotPosition.y * 40 + 400,
      type: 'recycle',
      color: 'purple',
      orientation: Math.atan2(2 * (robotPosition.orientation.w * robotPosition.orientation.z + robotPosition.orientation.x * robotPosition.orientation.y), 1 - 2 * (robotPosition.orientation.y * robotPosition.orientation.y + robotPosition.orientation.z * robotPosition.orientation.z)),
    };
    setRecycles((prevRecycles) => [...prevRecycles, newRecycle]);
  };

  const addReposition = () => {
    const newReposition = {
      id: Date.now(),
      x: robotPosition.x * 40 + 400,
      y: robotPosition.y * 40 + 400,
      type: 'reposition',
      color: 'orange',
      orientation: Math.atan2(2 * (robotPosition.orientation.w * robotPosition.orientation.z + robotPosition.orientation.x * robotPosition.orientation.y), 1 - 2 * (robotPosition.orientation.y * robotPosition.orientation.y + robotPosition.orientation.z * robotPosition.orientation.z)),
    };
    setRepositions((prevRepositions) => [...prevRepositions, newReposition]);
  };

  const deleteSelectedIcon = () => {
    if (selectedIcon) {
      switch (selectedIcon.type) {
        case 'kitchen':
          setKitchens(kitchens.filter((icon) => icon.id !== selectedIcon.id));
          break;
        case 'chargingStation':
          setChargingStations(chargingStations.filter((icon) => icon.id !== selectedIcon.id));
          break;
        case 'table':
          setTables(tables.filter((icon) => icon.id !== selectedIcon.id));
          break;
        case 'recycle':
          setRecycles(recycles.filter((icon) => icon.id !== selectedIcon.id));
          break;
        case 'reposition':
          setRepositions(repositions.filter((icon) => icon.id !== selectedIcon.id));
          break;
        default:
          break;
      }
      setSelectedIcon(null);
    }
  };

  const drawVector = (startX, startY, endX, endY) => {
    const ctx = arrowCanvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, arrowCanvasRef.current.width, arrowCanvasRef.current.height);
  
    ctx.beginPath();
    ctx.moveTo(startX + panOffset.x, startY + panOffset.y);
    ctx.lineTo(endX + panOffset.x, endY + panOffset.y);
  
    const headlen = 10;
    const dx = endX - startX;
    const dy = endY - startY;
    const angle = Math.atan2(dy, dx);
    ctx.lineTo(endX + panOffset.x - headlen * Math.cos(angle - Math.PI / 6), endY + panOffset.y - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(endX + panOffset.x, endY + panOffset.y);
    ctx.lineTo(endX + panOffset.x - headlen * Math.cos(angle + Math.PI / 6), endY + panOffset.y - headlen * Math.sin(angle + Math.PI / 6));
  
    ctx.strokeStyle = '#0000FF';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const redrawArrow = () => {
    if (isDrawingArrow && pannedArrowOrigin && !hasReachedArrowOrigin) {
      const endX = pannedArrowOrigin.x + 50 * Math.cos(arrowAngle);
      const endY = pannedArrowOrigin.y + 50 * Math.sin(arrowAngle);
      drawVector(pannedArrowOrigin.x, pannedArrowOrigin.y, endX, endY);
    } else {
      const ctx = arrowCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, arrowCanvasRef.current.width, arrowCanvasRef.current.height);
    }
  };

  const onCanvasMouseDown = (event) => {
    if (isNavigationMode) {
      const rect = mapCanvasRef.current.getBoundingClientRect();
      const scaleX = mapCanvasRef.current.width / rect.width;
      const scaleY = mapCanvasRef.current.height / rect.height;
  
      const canvasX = (event.clientX - rect.left) * scaleX;
      const canvasY = (event.clientY - rect.top) * scaleY;
  
      setIsDrawingArrow(true);
      setArrowOrigin({ x: canvasX, y: canvasY });
      setPannedArrowOrigin({ x: canvasX - panOffset.x, y: canvasY - panOffset.y });
      setArrowAngle(0);
    }
  };

  const onCanvasMouseMove = (event) => {
    if (!isDrawingArrow) return;
  
    const rect = mapCanvasRef.current.getBoundingClientRect();
    const scaleX = mapCanvasRef.current.width / rect.width;
    const scaleY = mapCanvasRef.current.height / rect.height;
  
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;
  
    const dx = canvasX - (pannedArrowOrigin.x + panOffset.x);
    const dy = canvasY - (pannedArrowOrigin.y + panOffset.y);
    const newAngle = Math.atan2(dy, dx);
    setArrowAngle(newAngle);
  };
  const onCanvasMouseUp = () => {
    if (!isDrawingArrow || !arrowOrigin) return;
  
    const scale = 40;
    const mapX = (arrowOrigin.x - mapCanvasRef.current.width / 2) / scale;
    const mapY = (arrowOrigin.y - mapCanvasRef.current.height / 2) / scale;
  
    setIsDrawingArrow(false);
    setArrowAngle(0);
    setHasReachedArrowOrigin(false);
  
    if (onMapClick) {
      onMapClick(mapX, mapY, arrowAngle);
    }
  
    redrawArrow();
  };

  const clearAndRedrawEverything = () => {
    if (isDrawingArrow && arrowOrigin) {
      const endX = arrowOrigin.x + 50 * Math.cos(arrowAngle);
      const endY = arrowOrigin.y + 50 * Math.sin(arrowAngle);
      drawVector(arrowOrigin.x, arrowOrigin.y, endX, endY);
    } else if (!isDrawingArrow) {
      const ctx = arrowCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, arrowCanvasRef.current.width, arrowCanvasRef.current.height);
    }
  };

  const handleCanvasMouseDown = (e) => {
    if (isSettingOrientation) {
      const canvas = iconsCanvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setArrowOrigin({ x, y });
    } else {
      const canvas = iconsCanvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const clickedKitchen = kitchens.find(
        (icon) =>
          x >= icon.x - 10 &&
          x <= icon.x + 10 &&
          y >= icon.y - 10 &&
          y <= icon.y + 10
      );

      const clickedChargingStation = chargingStations.find(
        (icon) =>
          x >= icon.x - 10 &&
          x <= icon.x + 20 &&
          y >= icon.y - 10 &&
          y <= icon.y + 20
      );

      const clickedTable = tables.find(
        (icon) =>
          x >= icon.x - 10 &&
          x <= icon.x + 10 &&
          y >= icon.y - 10 &&
          y <= icon.y + 10
      );

      const clickedRecycle = recycles.find(
        (icon) =>
          x >= icon.x - 10 &&
          x <= icon.x + 10 &&
          y >= icon.y - 10 &&
          y <= icon.y + 10
      );

      const clickedReposition = repositions.find(
        (icon) =>
          x >= icon.x - 10 &&
          x <= icon.x + 10 &&
          y >= icon.y - 10 &&
          y <= icon.y + 10
      );

      if (clickedKitchen) {
        setSelectedIcon({ ...clickedKitchen, type: 'kitchen' });
        setIsDragging(true);
        setDragOffset({ x: x - clickedKitchen.x, y: y - clickedKitchen.y });
      } else if (clickedChargingStation) {
        setSelectedIcon({ ...clickedChargingStation, type: 'chargingStation' });
        setIsDragging(true);
        setDragOffset({ x: x - clickedChargingStation.x, y: y - clickedChargingStation.y });
      } else if (clickedTable) {
        setSelectedIcon({ ...clickedTable, type: 'table' });
        setIsDragging(true);
        setDragOffset({ x: x - clickedTable.x, y: y - clickedTable.y });
      } else if (clickedRecycle) {
        setSelectedIcon({ ...clickedRecycle, type: 'recycle' });
        setIsDragging(true);
        setDragOffset({ x: x - clickedRecycle.x, y: y - clickedRecycle.y });
      } else if (clickedReposition) {
        setSelectedIcon({ ...clickedReposition, type: 'reposition' });
        setIsDragging(true);
        setDragOffset({ x: x - clickedReposition.x, y: y - clickedReposition.y });
      } else {
        setSelectedIcon(null);
        setIsDragging(false);
      }
    }
  };
  const handleCanvasMouseMove = (e) => {
    if (isSettingOrientation && arrowOrigin) {
      const canvas = iconsCanvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dx = x - arrowOrigin.x;
      const dy = y - arrowOrigin.y;
      const newAngle = Math.atan2(dy, dx);
      setArrowAngle(newAngle);
      drawIcons();
      drawArrow(arrowOrigin.x, arrowOrigin.y, newAngle);
    } else if (isDragging) {
      const canvas = iconsCanvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;

      if (selectedIcon.type === 'kitchen') {
        setKitchens((prevKitchens) =>
          prevKitchens.map((icon) =>
            icon.id === selectedIcon.id ? { ...icon, x, y } : icon
          )
        );
      } else if (selectedIcon.type === 'chargingStation') {
        setChargingStations((prevChargingStations) =>
          prevChargingStations.map((icon) =>
            icon.id === selectedIcon.id ? { ...icon, x, y } : icon
          )
        );
      } else if (selectedIcon.type === 'table') {
        setTables((prevTables) =>
          prevTables.map((icon) =>
            icon.id === selectedIcon.id ? { ...icon, x, y } : icon
          )
        );
      } else if (selectedIcon.type === 'recycle') {
        setRecycles((prevRecycles) =>
          prevRecycles.map((icon) =>
            icon.id === selectedIcon.id ? { ...icon, x, y } : icon
          )
        );
      } else if (selectedIcon.type === 'reposition') {
        setRepositions((prevRepositions) =>
          prevRepositions.map((icon) =>
            icon.id === selectedIcon.id ? { ...icon, x, y } : icon
          )
        );
      }
    }
  };
  const handleCanvasMouseUp = (e) => {
    if (isSettingOrientation && arrowOrigin) {
      const canvas = iconsCanvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dx = x - arrowOrigin.x;
      const dy = y - arrowOrigin.y;
      const newAngle = Math.atan2(dy, dx);

      if (selectedIcon) {
        switch (selectedIcon.type) {
          case 'kitchen':
            setKitchens((prevKitchens) =>
              prevKitchens.map((icon) =>
                icon.id === selectedIcon.id ? { ...icon, orientation: newAngle } : icon
              )
            );
            setSelectedIconOrientation(newAngle);
            break;
          case 'chargingStation':
            setChargingStations((prevChargingStations) =>
              prevChargingStations.map((icon) =>
                icon.id === selectedIcon.id ? { ...icon, orientation: newAngle } : icon
              )
            );
            setSelectedIconOrientation(newAngle);
            break;
          case 'table':
            setTables((prevTables) =>
              prevTables.map((icon) =>
                icon.id === selectedIcon.id ? { ...icon, orientation: newAngle } : icon
              )
            );
            setSelectedIconOrientation(newAngle);
            break;
          case 'recycle':
            setRecycles((prevRecycles) =>
              prevRecycles.map((icon) =>
                icon.id === selectedIcon.id ? { ...icon, orientation: newAngle } : icon
              )
            );
            setSelectedIconOrientation(newAngle);
            break;
          case 'reposition':
            setRepositions((prevRepositions) =>
              prevRepositions.map((icon) =>
                icon.id === selectedIcon.id ? { ...icon, orientation: newAngle } : icon
              )
            );
            setSelectedIconOrientation(newAngle);
            break;
          default:
            break;
        }
      }
      setIsSettingOrientation(false);
      setArrowOrigin(null);
      setArrowAngle(0);
      drawIcons();
    } else {
      setIsDragging(false);
    }
  };

  const handleSaveIconPositions = () => {
    publishIconPositions();
  };

  const publishIconPositions = () => {
    const iconPositionsTopic = new ROSLIB.Topic({
      ros,
      name: '/icon_positions',
      messageType: 'std_msgs/String',
    });

    let allIconPositions = [];

    const addPositions = (positions, type) => {
      positions.forEach((position) => {
        const iconData = {
          type: type,
          x: position.x,
          y: position.y,
          orientation: position.orientation,
        };

        if (type === 'table') {
          iconData.number = position.number; // Add the table number for tables
        }

        allIconPositions.push(iconData);
      });
    };

    addPositions(kitchens, 'kitchen');
    addPositions(chargingStations, 'chargingStation');
    addPositions(tables, 'table');
    addPositions(recycles, 'recycle');
    addPositions(repositions, 'reposition');

    const iconPositionsMessage = JSON.stringify(allIconPositions);
    iconPositionsTopic.publish({ data: iconPositionsMessage });
  };

  const drawArrow = (x, y, angle) => {
    const canvas = iconsCanvasRef.current;
    const context = canvas.getContext('2d');
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + 50 * Math.cos(angle), y + 50 * Math.sin(angle));
    context.lineTo(x + 40 * Math.cos(angle - Math.PI / 6), y + 40 * Math.sin(angle - Math.PI / 6));
    context.moveTo(x + 50 * Math.cos(angle), y + 50 * Math.sin(angle));
    context.lineTo(x + 40 * Math.cos(angle + Math.PI / 6), y + 40 * Math.sin(angle + Math.PI / 6));
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.stroke();
  };

  const handleMouseWheel = (e) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    console.log(zoomLevel)
    setZoomLevel((prevZoom) => {
      let newZoom = e.deltaY > 0 ? prevZoom / (1 + zoomSpeed) : prevZoom * (1 + zoomSpeed);
      return Math.max(0.1, Math.min(newZoom, 10)); // Clamp zoom level
    });
  };

  const drawMap = (message) => {
    const canvas = mapCanvasRef.current;
    if (!canvas || !message) return;

    const context = canvas.getContext('2d');
    const { data, info } = message;
    const { width, height, origin } = info;
    const imageData = context.createImageData(width, height);

    // Clear the map canvas before drawing
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Loop to fill imageData...
    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      let color;

      switch (value) {
        case 100:
          color = '#14181C';

          break;
        case -1:
          color = '#1E2328';
          break;
        case 0:
          color = '#DCEBFA';
          break;
        default:
          color = '#6AFFDC';
      }

      const index = i * 4;
      const hexColor = parseInt(color.slice(1), 16);
      const r = (hexColor >> 16) & 255;
      const g = (hexColor >> 8) & 255;
      const b = hexColor & 255;

      imageData.data[index] = r;
      imageData.data[index + 1] = g;
      imageData.data[index + 2] = b;
      imageData.data[index + 3] = 255;
    }

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    const offscreenContext = offscreenCanvas.getContext('2d');
    offscreenContext.putImageData(imageData, 0, 0);

    context.save();
    context.scale(zoomLevel * 2, zoomLevel * 2);
    context.translate(panOffset.x / zoomLevel * 0.5, panOffset.y / zoomLevel * 0.5);
    context.drawImage(offscreenCanvas, 0, 0);
    context.restore();
  };

  const drawRobot = () => {
    const canvas = robotCanvasRef.current;
    if (!canvas || !robotPosition) return;

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    const scale = 40;
    const posX = robotPosition.x * scale + canvas.width / 2;
    const posY = robotPosition.y * scale + canvas.height / 2;

    const orientation = robotPosition.orientation;
    const theta = Math.atan2(
      2 * (orientation.w * orientation.z + orientation.x * orientation.y),
      1 - 2 * (orientation.y * orientation.y + orientation.z * orientation.z)
    );

    const robotSize = 20; // Adjust the size as needed
    const robotImage = new Image();
    robotImage.src = robotIcon;

    context.save();
    context.translate(panOffset.x, panOffset.y);
    context.scale(zoomLevel, zoomLevel);
    context.translate(posX, posY);
    context.rotate(theta + Math.PI / 2); // Add Math.PI / 2 to rotate by 90 degrees clockwise
    context.drawImage(
      robotImage,
      -robotSize / 2,
      -robotSize / 2,
      robotSize,
      robotSize
    );
    context.restore();

    drawIcons();
  };
  const drawIcons = () => {
    const canvas = iconsCanvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.translate(panOffset.x, panOffset.y);
    context.scale(zoomLevel, zoomLevel);

    // Common function to draw each icon
    const drawIcon = (icon, iconImage) => {
      const size = 30; // Adjust the size as needed

      const iconImg = new Image();
      iconImg.src = iconImage;

      context.save();
      context.translate(icon.x, icon.y);
      context.rotate(icon.orientation);
      context.drawImage(iconImg, -size / 2, -size / 2, size, size);
      context.restore();
    };

    // Draw each type of icon
    kitchens.forEach(icon => drawIcon(icon, kitchenIcon));
    chargingStations.forEach(icon => drawIcon(icon, chargingStationIcon));
    tables.forEach(icon => drawIcon(icon, tableIcon));
    recycles.forEach(icon => drawIcon(icon, recycleIcon));
    repositions.forEach(icon => drawIcon(icon, repositionIcon));
    context.restore();
  };


  useEffect(() => {
    const canvas = containerRef.current;
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleCanvasMouseDown);
      canvas.removeEventListener('mousemove', handleCanvasMouseMove);
      canvas.removeEventListener('mouseup', handleCanvasMouseUp);
    };
  }, [
    kitchens,
    chargingStations,
    tables,
    recycles,
    repositions,
    selectedIcon,
    isSettingOrientation,
    arrowOrigin,
  ]);

  useEffect(() => {
    drawIcons();
  }, [
    kitchens,
    chargingStations,
    tables,
    recycles,
    repositions,
    selectedIcon,
    selectedIconOrientation,
  ]);

  useEffect(() => {
    drawIcons();
  }, [kitchens, chargingStations, tables, recycles, repositions, selectedIcon, selectedIconOrientation, zoomLevel, panOffset]);

  useEffect(() => {
    const mapCanvas = containerRef.current;
    mapCanvas.addEventListener('mousedown', handleMouseDown);
    mapCanvas.addEventListener('mousemove', handleMouseMove);
    mapCanvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      mapCanvas.removeEventListener('mousedown', handleMouseDown);
      mapCanvas.removeEventListener('mousemove', handleMouseMove);
      mapCanvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (lastMapMessage) {
      drawMap(lastMapMessage); // Redraw the map using the last received message
    }
  }, [zoomLevel, lastMapMessage]);

  useEffect(() => {
    if (!ros) return;

    const mapTopic = new ROSLIB.Topic({
      ros,
      name: '/map',
      messageType: 'nav_msgs/OccupancyGrid'
    });

    const laserScanTopic = new ROSLIB.Topic({
      ros,
      name: '/scan',
      messageType: 'sensor_msgs/LaserScan'
    });

    laserScanTopic.subscribe((message) => {
      // Process the laser scan data
      const laserScanData = message.ranges;
      const backLaserDistance = laserScanData[0]; // Assuming the back direction is at the 0th index
      if (backLaserDistance) {
        setLaserDistance(backLaserDistance.toFixed(2));
      }
      else {
        setLaserDistance(-1);
      }
    });

    mapTopic.subscribe((message) => {
      setLastMapMessage(message);
      drawMap(message);
      setLoadedIcons(iconPositions); // Load icons from icon_positions.json
    });

    const poseTopic = new ROSLIB.Topic({
      ros,
      name: '/odom',
      messageType: 'nav_msgs/Odometry'
    });

    mapTopic.subscribe((message) => {
      setLastMapMessage(message);
      drawMap(message);
    });

    poseTopic.subscribe((message) => {
      const { x, y } = message.pose.pose.position;
      const orientation = message.pose.pose.orientation;
      setRobotPosition({ x, y, orientation });
    });

    return () => {
      mapTopic.unsubscribe();
      poseTopic.unsubscribe();
      laserScanTopic.unsubscribe();
    };
  }, [ros]);

  useEffect(() => {
    drawRobot();
  }, [robotPosition]);

  useEffect(() => {
    const container = containerRef.current; // Use container ref
    if (container) {
      container.addEventListener('wheel', handleMouseWheel);
      container.addEventListener('mousemove', (e) => {
        const rect = mapCanvasRef.current.getBoundingClientRect(); // Use mapCanvasRef for mouse position calculation
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleMouseWheel);
      }
    };
  }, []);
  useEffect(() => {
    if (loadedIcons.length > 0) {
      // Merge loaded icons into the respective arrays
      loadedIcons.forEach(({ type, x, y, orientation, number }) => {
        const icon = { id: Date.now(), x, y, orientation };

        let iconImage;
        switch (type) {
          case 'kitchen':
            iconImage = kitchenIcon;
            setKitchens(prevKitchens => [...prevKitchens, { ...icon, iconImage }]);
            break;
          case 'chargingStation':
            iconImage = chargingStationIcon;
            setChargingStations(prevChargingStations => [...prevChargingStations, { ...icon, iconImage }]);
            break;
          case 'table':
            iconImage = tableIcon;
            setTables(prevTables => [...prevTables, { ...icon, number, iconImage }]);
            break;
          case 'recycle':
            iconImage = recycleIcon;
            setRecycles(prevRecycles => [...prevRecycles, { ...icon, iconImage }]);
            break;
          case 'reposition':
            iconImage = repositionIcon;
            setRepositions(prevRepositions => [...prevRepositions, { ...icon, iconImage }]);
            break;
          default:
            break;
        }
      });
    }
  }, [loadedIcons]);
  const getIconHandlers = () => {
    return {
      addKitchen,
      addChargingStation,
      addTable,
      addRecycle,
      addReposition,
      deleteSelectedIcon,
      handleSaveIconPositions,
      setIsModalOpen,
      setIsSettingOrientation,
      selectedIcon,
    };
  };

  useEffect(() => {
    if (arrowOrigin) {
      setPannedArrowOrigin({ x: arrowOrigin.x - panOffset.x, y: arrowOrigin.y - panOffset.y });
      redrawArrow();
    }
  }, [panOffset, arrowOrigin, arrowAngle]);

  // useEffect(() => {
  //   if (pannedArrowOrigin && robotPosition) {
  //     const scale = 40;
  //     const robotX = robotPosition.x * scale + mapCanvasRef.current.width / 2;
  //     const robotY = robotPosition.y * scale + mapCanvasRef.current.height / 2;
  
  //     const distance = Math.sqrt(
  //       Math.pow(robotX - (pannedArrowOrigin.x + panOffset.x), 2) +
  //       Math.pow(robotY - (pannedArrowOrigin.y + panOffset.y), 2)
  //     );
  
  //     if (distance < 10) {
  //       setHasReachedArrowOrigin(true);
  //       redrawArrow();
  //     }
  //   }
  // }, [robotPosition, pannedArrowOrigin, panOffset]);

  return (
    <div className='row bg-[#1E2328] w-full h-full'>
      <div className='col h-full'>
        <div ref={containerRef} style={{ width: '66%', height: '94%', position: 'relative', border: 'solid white 1px', borderRadius: '10px' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas
              ref={mapCanvasRef}
              width={800}
              height={800}
              style={{ position: 'absolute', left: 0, top: 0, zIndex: 1 }}
            />
            <canvas
              ref={robotCanvasRef}
              width={800}
              height={800}
              style={{ position: 'absolute', left: 0, top: 0, zIndex: 3 }}
            />
            <canvas
              ref={arrowCanvasRef}
              width={800}
              height={800}
              style={{ position: 'absolute', left: 0, top: 0, zIndex: 4 }}
              onMouseDown={onCanvasMouseDown}
              onMouseMove={onCanvasMouseMove}
              onMouseUp={onCanvasMouseUp}
            />
            <canvas
              ref={iconsCanvasRef}
              width={800}
              height={800}
              style={{ position: 'absolute', left: 0, top: 0, zIndex: 2 }}
            />
          </div>
        </div>
        <div style={{ margin: '10px', fontSize: '34px' }} className="laser-distance">
          <p className='text-white'>Laser Distance: {laserDistance} m</p>
        </div>
      </div>
    </div>
  );
});

export default SlamMapVisualization; 