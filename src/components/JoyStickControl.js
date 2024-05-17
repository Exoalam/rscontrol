import React, { Component } from 'react';
import { Joystick } from 'react-joystick-component';
import { sendCommand } from './TurtleBotControl';

class JoyStickControl extends Component {
  handleMove = (event) => {
    const { ros } = this.props; // Access ROS connection from props
    console.log(event.direction);
    switch (event.direction) {
      case 'FORWARD':
        sendCommand(ros, 0.2, 0); // Adjusted to include ROS connection
        break;
      case 'BACKWARD':
        sendCommand(ros, -0.2, 0);
        break;
      case 'LEFT':
        sendCommand(ros, 0, -0.5);
        break;
      case 'RIGHT':
        sendCommand(ros, 0, 0.5);
        break;
      default:
        sendCommand(ros, 0, 0); // Stop the robot if direction is unclear
        break;
    }
  };

  handleStop = () => {
    const { ros } = this.props; // Access ROS connection from props
    sendCommand(ros, 0, 0); // Send stop command
  };

  render() {
    return (
      <div className='m-auto'>
      <Joystick size={200}
        move={this.handleMove}
        stop={this.handleStop}
      />
      </div>
    );
  }
}

export default JoyStickControl;
