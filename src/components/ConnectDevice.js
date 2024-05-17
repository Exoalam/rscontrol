import React, { useRef, useState, useEffect } from 'react';
import ROSLIB from 'roslib';
import Cookies from 'js-cookie';

const ConnectDevice = ({ onConnect, onDisconnect, inputDesign, autoConnect }) => {
  const inputRef = useRef(null);
  const [ros, setRos] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [ipAddress, setIpAddress] = useState('');

  useEffect(() => {
    const storedIpAddress = Cookies.get('ipAddress');
    const status = Cookies.get('status');

    // Check if there's no existing connection
    if (!ros) {

      if (autoConnect && status === 'connected' && storedIpAddress) {
        setIpAddress(storedIpAddress);
        const rosConnection = new ROSLIB.Ros({ url: `ws://${storedIpAddress}` });

        rosConnection.on('connection', () => {
          setConnectionStatus('Connected');
          setRos(rosConnection);
          if (onConnect) onConnect(rosConnection);
        });

        rosConnection.on('error', () => {
          setConnectionStatus('Error');
          setRos(null);
          Cookies.set('status', 'disconnected');
        });

        rosConnection.on('close', () => {
          setConnectionStatus('Disconnected');
          setRos(null);
          Cookies.set('status', 'disconnected');
          if (onDisconnect) onDisconnect();
        });
        
      }
    }
  }, [autoConnect, onConnect, onDisconnect, ros]);

  const handleClick = () => {
    if (ros && ros.isConnected) {
      ros.close(); // Explicitly disconnect
      setConnectionStatus('Disconnected');
      setRos(null);
      Cookies.set('status', 'disconnected');
      if (onDisconnect) onDisconnect();
    } else {
      const enteredIpAddress = inputRef.current.value;
      if (!enteredIpAddress) {
        alert("Please enter the IP address and port.");
        return;
      }
      const rosConnection = new ROSLIB.Ros({ url: `ws://${enteredIpAddress}` });

      rosConnection.on('connection', () => {
        setConnectionStatus('Connected');
        setRos(rosConnection);
        setIpAddress(enteredIpAddress);
        Cookies.set('ipAddress', enteredIpAddress);
        Cookies.set('status', 'connected');
        if (onConnect) onConnect(rosConnection);
      });

      rosConnection.on('error', () => {
        setConnectionStatus('Error');
        setRos(null);
        Cookies.set('status', 'disconnected');
      });

      rosConnection.on('close', () => {
        setConnectionStatus('Disconnected');
        setRos(null);
        Cookies.set('status', 'disconnected');
        if (onDisconnect) onDisconnect();
      });
    }
  };

  return (
    <div className='column dark:text-[#DCEBFA]'>
      <input
        ref={inputRef}
        type="text"
        value={ipAddress}
        placeholder="IP Address:Port"
        className={inputDesign}
        onChange={(e) => setIpAddress(e.target.value)}
      />
      <button
        onClick={handleClick}
        className={`btn btn-md btn-outline mt-2 ${
          connectionStatus === 'Connected'
            ? 'btn-success'
            : connectionStatus === 'Error'
            ? 'btn-warning'
            : 'btn-error'
        }`}
      >
        <p className="text-lg dark:text-[#DCEBFA]">{connectionStatus}</p>
      </button>
    </div>
  );
};

export default ConnectDevice;