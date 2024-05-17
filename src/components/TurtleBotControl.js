import ROSLIB from 'roslib';

export function sendCommand(ros, linear, angular) {
  if (!ros) {
    console.error('ROS connection not provided!');
    return;
  }

  const cmdVel = new ROSLIB.Topic({
    ros: ros,
    name: '/cmd_vel',
    messageType: 'geometry_msgs/Twist'
  });

  const twist = new ROSLIB.Message({
    linear: { x: linear, y: 0, z: 0 },
    angular: { x: 0, y: 0, z: angular }
  });
  cmdVel.publish(twist);
}

export function send2DPoseEstimate(ros, poseX, poseY, poseTheta) {
  if (!ros) {
    console.error('ROS connection not provided!');
    return;
  }
  const poseTopic = new ROSLIB.Topic({
    ros: ros,
    name: '/initialpose',
    messageType: 'geometry_msgs/PoseWithCovarianceStamped'
  });
  const poseMessage = new ROSLIB.Message({
    header: {
      frame_id: 'map'
    },
    pose: {
      pose: {
        position: { x: poseX, y: poseY, z: 0 },
        orientation: { x: 0, y: 0, z: Math.sin(poseTheta / 2), w: Math.cos(poseTheta / 2) }
      },
      covariance: [0.25, 0, 0, 0, 0, 0, 0, 0.25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.67]
    }
  });
  poseTopic.publish(poseMessage);
}

export function sendNavigationGoal(ros, goalX, goalY, goalTheta) {
  if (!ros) {
    console.error('ROS connection not provided!');
    return;
  }

  const actionClient = new ROSLIB.ActionClient({
    ros: ros,
    serverName: '/move_base',
    actionName: 'move_base_msgs/MoveBaseAction'
  });

  const goal = new ROSLIB.Goal({
    actionClient,
    goalMessage: {
      target_pose: {
        header: {
          frame_id: 'map'
        },
        pose: {
          position: { x: goalX, y: goalY, z: 0 },
          orientation: {
            x: 0,
            y: 0,
            z: Math.sin(goalTheta / 2),
            w: Math.cos(goalTheta / 2)
          }
        }
      }
    }
  });

  // When the goal is sent, ROS assigns it an ID.
  goal.send();

  // Return the goal for further use (like cancellation)
  return goal;
}

