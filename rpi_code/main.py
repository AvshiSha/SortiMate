import time
from sorting_mechanism import SortingMechanism, WasteType

def main():
    try:
        sorter = SortingMechanism(rotation_pin=17, gate_pin=27) 
        print("Smart Recycling Bin initialized...")
        
        # time.sleep(2)
        # sorter.gate_servo.set_angle(150)
        # time.sleep(2)
        # sorter.rotation_servo.set_angle(180)
        # time.sleep(2)
        # sorter.rotation_servo.set_angle(0)
        # time.sleep(2)
        
        print("moving gate to 90")
        sorter.gate_servo.set_angle(90)
        time.sleep(2)
        print("moving gate to 0")
        sorter.gate_servo.set_angle(0)
        time.sleep(2)
        print("moving gate to 90")
        sorter.gate_servo.set_angle(90)
        time.sleep(2)
        
        
    except KeyboardInterrupt:
        print("\nProgram interrupted by user")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        # Clean up GPIO resources
        sorter.cleanup()

if __name__ == "__main__":
    main()
