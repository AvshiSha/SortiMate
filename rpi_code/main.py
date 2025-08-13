import time
from sorting_mechanism import SortingMechanism, WasteType
from Waste_recognition.CameraManager import CameraManager
from Waste_recognition.Classifier import WasteClassifier
import traceback
from laser_sensor import LaserSensor
from firebase_handler import FirebaseHandler

def main():
    try:
        #firebase_handler = FirebaseHandler()
        #sorter = SortingMechanism(rotation_pin=17, gate_pin=27)
        camera = CameraManager()
        classifier = WasteClassifier()
        #laser_sensor = LaserSensor(laser_pin=23)

        #bin_id = load_bin_id()
        print("Smart Recycling Bin initialized...")
        print("Waiting for object to enter the bin...")

        while True:
            #while not laser_sensor.is_beam_broken():
            #    time.sleep(0.1)
            
            print("New item detected!")
            image = camera.capture_image()
            predicted_label, confidence = classifier.waste_classification(image)
            print("Predicted waste type:", predicted_label)
            print("Predicted score:", confidence)

            if predicted_label == "Plastic":
                waste_type = WasteType.PLASTIC
            elif predicted_label == "Glass":
                waste_type = WasteType.GLASS
            elif predicted_label == "Metal":
                waste_type = WasteType.METAL
            else:
                waste_type = WasteType.OTHER

            #print(f"Sorting waste of type: {predicted_label}")
            #sorter.sort_waste(waste_type)

            # try:
            #     waste_event_id = firebase_handler.log_waste_event(
            #         bin_id=bin_id,
            #         waste_type=waste_type.name,
            #         confidence=confidence
            #     )
            #     print(f"Waste event logged with ID: {waste_event_id}") 
            # except Exception as log_err:
            #     print(f"Failed to log waste event: {log_err}")

            # Wait until beam is restored before detecting the next object
            #while laser_sensor.is_beam_broken():
            #    time.sleep(0.1)
            
            print("Item sorted. Waiting for the next item...")
            user_char = input("Press q to quit, anything else to continue:") #TO DELETE
            if user_char.lower() == 'q':
                break

    except KeyboardInterrupt:
        print("\nProgram interrupted by user")

    except Exception as e:
        print(f"An error occurred: {e}")
        traceback.print_exc()

    finally:
        print("END") #TO DELETE
        #sorter.cleanup()
        #laser_sensor.cleanup()

def load_bin_id(path="/home/pi/creds/bin_id.txt"):
    try:
        with open(path, "r") as f:
            return f.read().strip()
    except FileNotFoundError:
        print(f"An error occurred with getting bin ID, Bin ID file not found at {path}")
        traceback.print_exc()
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        traceback.print_exc()


if __name__ == "__main__":
    main()