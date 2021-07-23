package GestureSensorMoveSkill

import (

	//"math"
	"os"
	"time"

	"mind/core/framework/drivers/hexabody"
	"mind/core/framework/log"
	"mind/core/framework/skill"
)

const (
	TIME_TO_NEXT_REACTION = 1000 // milliseconds
	TIME_MOVE_DURATION    = 2000 // milliseconds
	DISTANCE_TO_REACTION  = 250  // millimeters
	MOVE_HEAD_DURATION    = 500  // milliseconds
	ROTATE_DEGREES        = 130  // degrees out of 360
	WALK_SPEED            = 1.0  // cm per second
	SENSE_INTERVAL        = 250  // four times per second
	MOVE_LEFT             = 90   // Degrees to the left
	MOVE_RIGHT            = 270
	MOVE_FWD              = 0
	MOVE_BACKWD           = 180
	HEIGHT_STAND_UP       = 50
	HEIGHT_STAND_DOWN     = -10
	HEAD_POS_0_CAL     	  = 0
)

type GestureSensorMoveSkill struct {
	skill.Base
	stop      chan bool
	direction float64
}

type HandPalm struct {
	pitch float64
	roll  float64
	yaw   float64
	pos_x float64
	pos_y float64
	pos_z float64
}

func NewSkill() skill.Interface {
	return &GestureSensorMoveSkill{
		stop: make(chan bool),
	}
}

func (d *GestureSensorMoveSkill) standup() {
	hexabody.StandWithHeight(HEIGHT_STAND_UP)
}

func (d *GestureSensorMoveSkill) standdown() {
	hexabody.StandWithHeight(HEIGHT_STAND_DOWN)
}

func (d *GestureSensorMoveSkill) walk(direction float64) {
	// Align the head to the origin angle
	log.Info.Println("Walk: Head Direction - Begin: ", hexabody.Direction())
	hexabody.MoveHead(HEAD_POS_0_CAL, MOVE_HEAD_DURATION)
	log.Info.Println("Walk: Head Direction - End: ", hexabody.Direction())
	
	//hexabody.Walk(direction, 1000)
	hexabody.WalkContinuously(direction, WALK_SPEED)
	time.Sleep(TIME_MOVE_DURATION * time.Millisecond)
	hexabody.StopWalkingContinuously()
}

func (d *GestureSensorMoveSkill) startSkill() {
	// Align the head to the origin angle
	log.Info.Println("Walk: Head Direction - Begin: ", hexabody.Direction())
	hexabody.MoveHead(HEAD_POS_0_CAL, MOVE_HEAD_DURATION)
	log.Info.Println("Walk: Head Direction - End: ", hexabody.Direction())
	
	// Pitch to the Left/Right at the start
	hexabody.Pitch(-20, 750)
	hexabody.Pitch(20, 1500)
	
	// Stand down and stand-up
	hexabody.StandWithHeight(HEIGHT_STAND_DOWN)
	hexabody.StandWithHeight(HEIGHT_STAND_UP)
}

func (d *GestureSensorMoveSkill) OnStart() {
	// Align the head to the origin angle
	hexabody.MoveHead(HEAD_POS_0_CAL, MOVE_HEAD_DURATION)
	
	// Use this method to do something when this skill is starting.
	log.Info.Println("GestureSensorMoveSkill Started")
}

func (d *GestureSensorMoveSkill) OnClose() {
	// Use this method to do something when this skill is closing.
	hexabody.Close()
}

func (d *GestureSensorMoveSkill) OnConnect() {
	// Use this method to do something when the remote connected.
	err := hexabody.Start()
	
	if err != nil {
		log.Error.Println("Hexabody start err:", err)
		return
	}
}

func (d *GestureSensorMoveSkill) OnDisconnect() {
	// Use this method to do something when the remote disconnected.
	os.Exit(0) // Closes the process when remote disconnects
}

func (d *GestureSensorMoveSkill) OnRecvJSON(data []byte) {
	// Use this method to do something when skill receive json data from remote client.
}

func (d *GestureSensorMoveSkill) OnRecvString(data string) {
	// Use this method to do something when skill receive string from remote client.
	switch data {
		case "start":
			go d.startSkill()
		case "stop":
			d.stop <- true
			hexabody.MoveHead(HEAD_POS_0_CAL, MOVE_HEAD_DURATION)
			hexabody.StopWalkingContinuously()
			hexabody.Relax()
		case "left":
			go d.walk(MOVE_LEFT)
		case "right":
			go d.walk(MOVE_RIGHT)
		case "forward":
			go d.walk(MOVE_FWD)
		case "backward":
			go d.walk(MOVE_BACKWD)
		case "stand-up":
			go d.standup()
		case "stand-down":
			go d.standdown()
	}
}
