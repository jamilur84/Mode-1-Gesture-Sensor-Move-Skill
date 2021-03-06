/**
 * This is the Javascript containing the interfacing between the Hexa Mind robot
 * and the Leap Motion Sensor.
 */


/**
 * The name of the HEXA skill.
 */
var HexaSkill = "GestureSensorMoveSkill";

/**
 * The object of the HEXA robot.
 * This is the proxy object for the interaction with the robot.
 */
var MyHexaRobot = null;

/**
 * The actual frame number.
 */
var FrmNo = 0;

/**
 * The flag to indicate whether the processing is busy or not.
 * We need to consider the time needed by the robot to perform the command.
 */
var FlgHandProcBusy = false;

/**
 * The flag to indicate a valid hand movement that can be
 * sent to the HEXA robot.
 * A valid hand movement is a pre-defined movement
 * that can be translated into the HEXA movement.
 */
var FlgValidHandMotion = false;

/**
 * The array for storing the start sequence.
 * A start sequence is Palm Open - Close - Open.
 */
var HandStartSeq = [false, false, false];

/**
 * The flag to indicate the start hand motion sequence.
 */
var FlgStartSeq = false;

/**
 * The flag to indicate the stop hand motion sequence.
 */
var FlgStopSeq = false;

/**
 * The reference hand position, which is set when
 * the start sequence is being set.
 * This reference position will be used for detecting the
 * up and down hand movement, which the movement along the 
 * Y axis of the Leap Motion Sensor.
 */
var HandRefPos = [0, 0, 0];

/**
 * The flag to indicate there are no hands detected for a certain 
 * number of frames (FRM_NO_HAND_DETECTED)
 */
var FlgNoHandDetected = true;

/**
 * The counter of no hands detected, which is updated for each frame.
 */
var CntrNoHandDetected = 0;

/**
 * The threshold value of the pinching strength.
 */
var THR_PINCH_STRENGTH = 0.65;

/**
 * The threshold value of the hand motion along the Y axis
 * of the Leap Motion Sensor (in mm).
 */
var THR_HAND_MOVE_POS_Y = 100;

/**
 * The threshold value of the hand rotation around one axis
 * of the Leap Motion Sensor (in radian).
 */
var THR_HAND_ROTATE_ANG_RAD = 0.5236;

/**
 * A constant for the number of frames where no hands are detected. 
 */
var FRM_NO_HAND_DETECTED = 80;

/**
 * The time for waiting the robot movement completion.
 * It is in millisecond.
 */
var TIME_WAIT_ROBOT_MOVEMENT = 2500;

/**
 * The array size for the debug messages.
 */
var DBG_LIST_SIZE = 20;
/**
 * The array for storing the debug messages.
 */
var DbgMsgList = new Array(DBG_LIST_SIZE);
/**
 * The debug message index of the array.
 */
var DbgMsgListIdx = 0;
/**
 * The debug message list actual size.
 */
var DbgMsgListSz = 0;

/**
 * This is a dummy class for testing and debugging purpose.
 * One function is defined to test the sendData function
 * of a robot if the robot is not connected.
 */
class DummyHexa 
{  
    // Class constructor
    constructor() 
    {   
    }
    
    /**
     * The dummy function of the sendData function.
     * This function will just add a debug message to indicate
     * its invocation.
     *  
     * @param params The parameters containing the Skill ID and the data to be sent.
     * 
     * @returns Nothing.
     */
    sendData(params)
    {
        add_dbg_msg("DummyHexa.sendData: " + params.skillID + ": " + params.data);
    }
  }

/**
 * The callback function for initialising the communication with the HEXA robot.
 * This callback function will be called by the mind.init function.
 * 
 * @param robot The object of the HEXA robot.
 * 
 * @returns Nothing
 */
function hexa_cb(robot)
{
    // Debug message.
    add_dbg_msg("hexa callback: " + robot);
    
    // Assign this skill name.
    skillID = HexaSkill;
    
    // Assign the input parameter robot to the global variable to 
    // enable access from other functions.
    MyHexaRobot = robot;
    
    // Connect to the robot's skill. 
    robot.connectSkill
    ({
        skillID : skillID
    });
}

/**
 * A wrapper function for sending data to the HEXA robot.
 * 
 * @param data The data to be sent.
 * 
 * @returns Nothing
 */
function hexa_send_data(data)
{
    // Add a debug message.
    add_dbg_msg("hexa send data: " + data);
    
    // If the robot object is still null, which is the case when the
    // initialisation step failed, we create a dummy robot object
    // and add a debug message.
    if (MyHexaRobot == null)
    {
        add_dbg_msg("hexa_send_data: Use Dummy Hexa Robot...");
        MyHexaRobot = new DummyHexa();
    }
    
    if (MyHexaRobot != null)
    {
        // Send the data through the robot object.
        MyHexaRobot.sendData(
        {
            skillID : HexaSkill,
            data : data
        })
    }
    
    // Print the debug message.
    print_dbg_msg();
}

/**
 * The function to register event handler in the case of clicked
 * buttons.
 * 
 * @param document The HTML document where the buttons are located.
 * 
 * @returns Nothing
 */
function reg_button_ev_hdl(document)
{
    document.getElementById("start").onclick = function()
    {
        let msg = "start";

        hexa_send_data(msg);
        hexa_out.innerHTML = "Start Hexa";
    }
    document.getElementById("stop").onclick = function()
    {
        let msg = "stop";
        
        hexa_send_data(msg);
        hexa_out.innerHTML = "Stop Hexa";
    }
    document.getElementById("left").onclick = function()
    {
        let msg = "left";

        hexa_send_data(msg);
        hexa_out.innerHTML = "Hexa walks to the left";
    }
    document.getElementById("right").onclick = function()
    {
        let msg = "right";

        hexa_send_data(msg);
        hexa_out.innerHTML = "Hexa walks to the right";
    }
    document.getElementById("forward").onclick = function()
    {
        let msg = "forward";

        hexa_send_data(msg);
        hexa_out.innerHTML = "Hexa walks forward";
    }
    document.getElementById("backward").onclick = function()
    {
        let msg = "backward";

        hexa_send_data(msg);
        hexa_out.innerHTML = "Hexa walks backward";
    }
    document.getElementById("stand-up").onclick = function()
    {
        let msg = "stand-up";

        hexa_send_data(msg);
        hexa_out.innerHTML = "Hexa stands up";
    }
    document.getElementById("stand-down").onclick = function()
    {
        let msg = "stand-down";

        hexa_send_data(msg);
        hexa_out.innerHTML = "Hexa stands down";
    }
}

/**
 * The callback function for handling the frame data from the 
 * Leap Controller.
 * In this function, we will extract some hand movements that
 * will be used for controlling the HEXA robot.
 * 
 * @param frame The frame data returned by the Leap Motion Sensor.
 * 
 * @returns Nothing
 */
function leap_frame_hdlr(frame)
{
    // output.innerHTML = 'Frame: ' + frame.id;
    var handString = "";
    
    FrmNo = frame.id;

    if (frame.hands.length > 0)
    {
        // Reset the counter of no hand detected, as now at least one hand is detected.
        CntrNoHandDetected = 0;
        
        FlgNoHandDetected = false;
        
        frame.hands.forEach(function(hand, index)
        {
            if (index == 0)
            {
                handString += "Hand ID: " + hand.id + "<br />";
                handString += "Grab Strength: " + hand.grabStrength + "<br />";
                handString += "Direction: " + hand.direction[0] + ", " + hand.direction[1] + ", " + hand.direction[2] + "<br />";
                handString += "Palm Normal: " + hand.palmNormal[0] + ", " + hand.palmNormal[1] + ", " + hand.palmNormal[2] + "<br />";
                handString += "Palm Position: " + hand.palmPosition[0] + ", " + hand.palmPosition[1] + ", " + hand.palmPosition[2] + "mm <br />";
                
                leap_out.innerHTML = handString;
                
                interprete_hand_motion(hand);
            }
        })
    }
    else
    {
        // Increase the counter
        CntrNoHandDetected++;
    }
    
    // The case the counter of no hand detected is equal or more than the a certain value.
    if (CntrNoHandDetected >= FRM_NO_HAND_DETECTED)
    {
        // Set the flag
        FlgNoHandDetected = true;
        
        // Reset the counter
        CntrNoHandDetected = 0;
    }
}

/**
 * The function for processing the hand data of each frame returned
 * by the Leap Motion Sensor.
 * 
 * @param hand The hand data to be processed.
 * 
 * @returns Nothing
 */
function interprete_hand_motion(hand)
{
    var str_hand_motion;
    
    if(FlgHandProcBusy == false)
    {   
        // The hand direction. It's a 3-element array representing a unit direction vector of
        // the palm position toward the fingers.
        //var h_dir = hand.direction;
        
        // Check for a start sequence hand movement, that indicates the start of the
        // interaction.
        if(hand.grabStrength == 1 && HandStartSeq[0] == true && HandStartSeq[1] == false) 
        {
            HandStartSeq[1] = true;
        }
        else if(hand.grabStrength == 0 && HandStartSeq[0] == false)
        {
            HandStartSeq[0] = true;
        }
        else if(hand.grabStrength == 0 && HandStartSeq[0] == true && HandStartSeq[1] == true && HandStartSeq[2] == false)
        {
            // Set the flag of the start sequence of the interaction
            FlgStartSeq = true;
            
            // Reset the array for the next iteration
            HandStartSeq = [false, false, false];
            
            // Reset the stop sequence flag
            FlgStopSeq = false;
            
            // Record the palm position as the reference position.
            // We use this for the up/down movement, which is the
            // Y-axis of the Leap Motion Sensor.
            HandRefPos = hand.palmPosition;
            
            // Set the flag of valid hand motion to send the command to the robot 
            FlgValidHandMotion = true;
            
            // Send the stop command
            str_hand_motion = "start";
            
            add_dbg_msg("Hand Motion Start Sequence Flag: " + FlgStartSeq);
        }
        //add_dbg_msg("start sequence cheked")
        
        // Check for a stop sequence hand movement, to stop the interaction.
        if (hand.pinchStrength > THR_PINCH_STRENGTH && FlgStartSeq == true)
        {
            // Set the stop sequence flag
            FlgStopSeq = true;
            
            // Reset the start sequence flag to disable any 
            // hand motion detection.
            FlgStartSeq = false;
            
            // Set the flag of valid hand motion to send the command to the robot 
            FlgValidHandMotion = true;
            
            // Send the stop command
            str_hand_motion = "stop";
            
            add_dbg_msg("Hand Motion Stop Sequence Flag: " + FlgStopSeq);
        }
        
        // Calculate the angle between the palm normal with the X and Z axis of
        // the Leap Motion Sensor.
        let p_norm = hand.palmNormal;
        // The angle around X axis of Leap sensor
        let ang_x = Math.atan(p_norm[2] / p_norm[1]);
        // The angle around the Z axis of Leap sensor
        let ang_z = Math.atan(p_norm[0] / p_norm[1]);

        // Check for a significant up/down hand movement
        if (Math.abs(HandRefPos[1] - hand.palmPosition[1]) >= THR_HAND_MOVE_POS_Y)
        {
            // A significant movement along the Y axis of the Leap Sensor
            if (hand.palmPosition[1] < HandRefPos[1])
            {
                // The current position is lower than the reference position, which
                // means "going-down" movement.
                str_hand_motion = "stand-down";
            }
            else
            {
                // Otherwise, it is "going-up" movement.
                str_hand_motion = "stand-up";
            }
            
            if(FlgStartSeq == true)
            {
                // Set the valid hand motion flag
                FlgValidHandMotion = true;
            }
        }
        else if (Math.abs(ang_x) > THR_HAND_ROTATE_ANG_RAD)
        {
            // The rotation around X axis of Leap sensor.
            // Command the robot to move forward or backward.
            if(ang_x < 0)
            {
                // Hand pitching downward which means "move forward".
                str_hand_motion = "forward";
            }
            else
            {
                // Hand pitching upward which means "move backward".
                str_hand_motion = "backward";
            }

            if(FlgStartSeq == true)
            {
                // Set the valid hand motion flag
                FlgValidHandMotion = true;
            }
        }
        else if (Math.abs(ang_z) > THR_HAND_ROTATE_ANG_RAD)
        {
            // The rotation around Z axis of Leap sensor.
            // Command the robot to move left or right.
            if(ang_z < 0)
            {
                // Hand rotates to the left which means "move left".
                str_hand_motion = "left";
            }
            else
            {
                // Hand rotates to the right which means "move right".
                str_hand_motion = "right";
            }

            if(FlgStartSeq == true)
            {
                // Set the valid hand motion flag
                FlgValidHandMotion = true;
            }
        }
    }
    
    // The case that the flag of no hand detected is set and the start sequence has been
    // set already
    if(FlgValidHandMotion == false && FlgNoHandDetected == true && FlgStartSeq == true)
    {
        // Set the flag of valid hand motion to enable the command transmission to the robot
        FlgValidHandMotion = true;
        
        // Set the command to stop the robot
        str_hand_motion = "stop";
    }
    
    // Send the command when a valid hand movement is detected
    if(FlgValidHandMotion == true)
    {
        // Set the flag FlgHandProcBusy to ignore the incoming hand data while
        // the robot is still doing the previous command.
        FlgHandProcBusy = true;
        
        // Set a timeout to control the busy flag.
        setTimeout(function() {
            // Reset the FlgHandProcBusy flag after the timeout expires.
            FlgHandProcBusy = false;
        }, TIME_WAIT_ROBOT_MOVEMENT);
        
        // Send the detected hand motion to the HEXA robot
        hexa_send_data(str_hand_motion);
        
        // Reset the flag of valid hand movement
        // for the next iteration.
        FlgValidHandMotion = false;
    }
}


/**
 * Add debug messages in the message list.
 * 
 * @param dbg_msg The debug message to be added.
 * 
 * @returns Nothing
 */
function add_dbg_msg(dbg_msg)
{
    var n = Date.now();
    
    DbgMsgList[DbgMsgListIdx] = n + ": " + dbg_msg;

    DbgMsgListIdx++;

    if(DbgMsgListIdx > DbgMsgListSz)
    {
        DbgMsgListSz = DbgMsgListIdx;
    }
    
    if(DbgMsgListIdx >= DBG_LIST_SIZE)
    {
        // Reset the index to zero
        DbgMsgListIdx = 0;
    }
    
}

/**
 * Print out the stored debug messages in a specific place
 * in the HTML page.
 * 
 * @return Nothing
 */
function print_dbg_msg()
{
    var str_dbg_msg = "";
    let next_msg = true;
    let i = DbgMsgListIdx;
    let j = 0;
    let sz = 0;
    
    while (next_msg == true)
    {
        if (DbgMsgListSz == DBG_LIST_SIZE)
        {
            // This is the case of full array.
            // We start from index = DbgMsgListIdx + 1
            str_dbg_msg += DbgMsgList[i] + "<br />\n";
            i++;
            sz++;
            if (i >= DBG_LIST_SIZE)
            {
                i = 0;
            }
            if (sz >= DBG_LIST_SIZE)
            {
                next_msg = false;
            }
        }
        else
        {
            str_dbg_msg += DbgMsgList[j] + "<br />\n";
            j++;
            
            if(j >= DbgMsgListSz)
            {
                next_msg = false;
            }
        }
    }
    
    dbg_msg.innerHTML = str_dbg_msg;
}
